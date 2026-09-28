/**
 * C2.1: every default shown for a child equals the practice files' value for that child's
 * bracket. This test parses best-parctices/*.md and compares each table row with the
 * content module for every one-year bracket the row covers.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BRACKETS,
  CAPS,
  DOMAIN_TITLES,
  MAJOR_RULES,
  PRACTICES,
  SOURCES,
  TECHS,
  bracketsInRange,
  getRhythmTemplate,
  getTechStage,
  type Domain,
} from "./index";

const read = (name: string) => readFileSync(`best-parctices/${name}`, "utf8");

type Table = { heading: string; header: string[]; rows: string[][] };

/** Every pipe table in a markdown file with the nearest heading above it. */
function parseTables(md: string): Table[] {
  const tables: Table[] = [];
  let heading = "";
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^#{2,3} /.test(line)) heading = line.replace(/^#+ /, "").trim();
    if (line.startsWith("|") && /^\|[-| ]+\|$/.test(lines[i + 1] ?? "")) {
      const cells = (l: string) =>
        l
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
      const header = cells(line);
      const rows: string[][] = [];
      let j = i + 2;
      while (lines[j]?.startsWith("|")) rows.push(cells(lines[j++]));
      tables.push({ heading, header, rows });
      i = j - 1;
    }
  }
  return tables;
}

const ageRange = (cell: string): [number, number] | null => {
  const m = cell.match(/^(\d+) to (\d+)$/);
  return m ? [Number(m[1]), Number(m[2])] : null;
};

const minutes = (cell: string): number => {
  if (cell === "0") return 0;
  const h = cell.match(/^(\d+) h$/);
  if (h) return Number(h[1]) * 60;
  const m = cell.match(/^(\d+) min$/);
  if (m) return Number(m[1]);
  throw new Error(`Cannot read minutes from "${cell}"`);
};

describe("caps match the total screen budget table", () => {
  const table = parseTables(read("household-tech-access-stages.md")).find(
    (t) => t.header[0] === "Age" && t.header[1] === "Per day",
  )!;
  it.each(table.rows)("%s", (age, perDay, perWeek, frequency) => {
    const range = ageRange(age)!;
    const days =
      frequency === "never" ? 0 : Number(frequency.match(/max (\d+)/)![1]);
    for (const b of bracketsInRange(range)) {
      expect(CAPS[b].minutesPerDay).toBe(minutes(perDay));
      expect(CAPS[b].minutesPerWeek).toBe(minutes(perWeek));
      expect(CAPS[b].maxDaysPerWeek).toBe(days);
    }
  });
  it("marks never two days in a row only where the long-form row says so", () => {
    expect(CAPS["3-4"].noConsecutiveDays).toBe(true);
    expect(CAPS["4-5"].noConsecutiveDays).toBe(true);
    expect(CAPS["5-6"].noConsecutiveDays).toBe(false);
  });
});

describe("tech stages match every per-technology table", () => {
  const tables = parseTables(read("household-tech-access-stages.md")).filter(
    (t) => t.header[0] === "Age" && t.header[1] === "Depth",
  );
  it("covers every technology section in the file", () => {
    expect(tables.map((t) => t.heading).sort()).toEqual(
      TECHS.map((t) => t.title).sort(),
    );
  });
  for (const table of tables) {
    const tech = TECHS.find((t) => t.title === table.heading)!;
    describe(table.heading, () => {
      for (const row of table.rows) {
        const range = ageRange(row[0]);
        if (range) {
          it(`${row[0]}: depth and duration for every bracket`, () => {
            for (const b of bracketsInRange(range)) {
              const stage = getTechStage(tech, b)!;
              expect(stage.depth).toBe(row[1]);
              expect(stage.duration).toBe(row[2] ?? "");
            }
          });
        } else if (/^From (\d+)$/.test(row[0])) {
          it(`${row[0]}: opens at that age with the file's text`, () => {
            const later = tech.later.find((l) => l.what === row[1])!;
            expect(later.opensAt).toBe(Number(row[0].match(/\d+/)![0]));
          });
        } else {
          it(`later: ${row[0]}`, () => {
            const later = tech.later.find((l) => l.what === row[0])!;
            const before = row[1].match(/before (\d+)/);
            expect(later.opensAt).toBe(before ? Number(before[1]) : null);
          });
        }
      }
    });
  }
});

describe("practices match every routine element row", () => {
  const tables = parseTables(read("household-routine-elements.md")).filter(
    (t) => t.header[0] === "Age" && t.header[1] === "Practice",
  );
  it("covers every domain in the file", () => {
    expect(tables.map((t) => t.heading).sort()).toEqual(
      Object.values(DOMAIN_TITLES).sort(),
    );
  });
  for (const table of tables) {
    const domain = (Object.keys(DOMAIN_TITLES) as Domain[]).find(
      (d) => DOMAIN_TITLES[d] === table.heading,
    )!;
    it.each(table.rows)(`${table.heading} %s`, (age, practice, duration) => {
      for (const b of bracketsInRange(ageRange(age)!)) {
        const found = PRACTICES.find(
          (p) => p.domain === domain && bracketsInRange(p.ages).includes(b),
        )!;
        expect(found.detail).toBe(practice);
        expect(found.duration).toBe(duration);
        expect(found.why.length).toBeGreaterThan(0);
      }
    });
  }
});

describe("rhythm templates carry every cell of the weekday and weekend tables", () => {
  const tables = parseTables(read("household-rhythms.md"));
  for (const [kind, heading] of [
    ["weekday", "Weekday rhythm"],
    ["weekend", "Weekend rhythm"],
  ] as const) {
    const table = tables.find((t) => t.heading === heading)!;
    const columns = table.header.slice(1).map((h) => ageRange(h)!);
    it.each(table.rows)(`${kind} %s`, (_time, ...cells) => {
      const base = cells[0];
      cells.forEach((cell, i) => {
        const text = cell.startsWith("Same")
          ? base + cell.replace(/^Same/, "")
          : cell;
        for (const b of bracketsInRange(columns[i])) {
          const t = getRhythmTemplate(b, kind);
          const inBlocks = t.blocks.some(
            (blk) => blk.title === text || blk.note?.includes(text),
          );
          const inNotes = t.notes.some((n) => n.includes(text));
          expect(inBlocks || inNotes, `${b} ${kind}: "${text}"`).toBe(true);
        }
      });
    });
  }
  it("gives every bracket a template of each kind, with one screen block at most", () => {
    for (const b of BRACKETS) {
      for (const kind of ["weekday", "weekend"] as const) {
        const t = getRhythmTemplate(b, kind);
        const screens = t.blocks.filter((blk) => blk.kind === "screen");
        expect(screens.length).toBeLessThanOrEqual(1);
        expect(screens.length === 0).toBe(CAPS[b].minutesPerDay === 0);
        expect(t.blocks.at(-1)?.kind === "sleep" || b === "0-1").toBe(true);
      }
    }
  });
});

describe("major rules match the file's bullets", () => {
  const bullets = read("household-major-rules.md")
    .split("\n")
    .filter((l) => l.startsWith("- **"))
    .map((l) => {
      const m = l.match(/^- \*\*(.+?)\*\*\s?(.*)$/)!;
      return { title: m[1], detail: m[2] };
    });
  it("has the same nine rules in the same order", () => {
    expect(MAJOR_RULES.map((r) => r.title)).toEqual(
      bullets.map((b) => b.title),
    );
    expect(MAJOR_RULES.map((r) => r.detail)).toEqual(
      bullets.map((b) => b.detail),
    );
  });
});

describe("sources are the union of every file's source list", () => {
  const files = [
    "household-major-rules.md",
    "household-tech-access-stages.md",
    "household-routine-elements.md",
    "household-rhythms.md",
    "parent-tech-concerns.md",
  ];
  for (const file of files) {
    const section = read(file).split("## Sources")[1];
    if (!section) continue;
    it.each(
      [...section.matchAll(/- \[(.+?)\]\((.+?)\)/g)].map((m) => [m[1], m[2]]),
    )(`${file}: %s`, (title, url) => {
      const s = SOURCES.find((x) => x.url === url)!;
      expect(s.title).toBe(title);
      expect(s.usedBy).toContain(file);
    });
  }
});
