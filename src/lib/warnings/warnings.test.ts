import { describe, expect, it } from "vitest";
import type { Household, Show } from "@/lib/model/types";
import { createKid } from "@/lib/routine/routine";
import { seedHousehold } from "@/lib/seed/seed";
import { emptyHousehold } from "@/lib/seed/empty";
import { defaultWindow } from "@/lib/schedule/schedule";
import {
  deriveWarnings,
  dismiss,
  visibleWarnings,
  type WarningCode,
} from "./warnings";

const now = new Date("2026-09-28T12:00:00");
const show = (id: string, minutes: number): Show => ({
  id,
  title: id,
  durationSec: minutes * 60,
  fileKey: null,
  posterKey: null,
  category: "stories",
  ages: [3, 6],
  addedAt: now.toISOString(),
});

/** Simona (4) with one channel on the default window and a programme of 12 + 15 minutes. */
function simonaHousehold(): Household {
  const h = emptyHousehold(now);
  h.shows = [show("a", 12), show("b", 15), show("c", 20)];
  const kid = createKid(
    { name: "Simona", birthdate: "2022-03-14", pin: "1111", colour: 2 },
    now,
  );
  kid.channels = [
    {
      id: "ch",
      name: "Stories",
      icon: "book",
      windows: [defaultWindow(kid, "4-5")!],
      programme: ["a", "b"],
      programmesByDay: null,
    },
  ];
  h.kids = [kid];
  return h;
}

const codes = (h: Household) => deriveWarnings(h, now).map((w) => w.code);
const only = (h: Household, code: WarningCode) =>
  deriveWarnings(h, now).filter((w) => w.code === code);

describe("a household on the defaults raises no warnings", () => {
  it("Simona with the default window and a fitting programme", () => {
    expect(codes(simonaHousehold())).toEqual([]);
  });
});

describe("each warning triggers on its condition and its fixes clear it (C2.2, C2.3)", () => {
  it("W01 daily cap, with three fixes", () => {
    const h = simonaHousehold();
    h.kids[0].channels[0].windows[0].end = "17:15";
    h.kids[0].channels[0].programme = ["a", "b", "c"];
    h.kids[0].allowances = h.kids[0].allowances.map((a) =>
      a.tech === "games" ? { ...a, minutesPerDay: 10, daysPerWeek: 7 } : a,
    );
    const w = only(h, "W01");
    expect(w.length).toBeGreaterThan(0);
    expect(w[0].message).toMatch(/Simona would have \d+ minutes on Monday/);
    expect(w[0].fixes.map((f) => f.id)).toEqual([
      "shorten",
      "remove-last",
      "reduce",
    ]);
    // Shortening fixes the television part; the games allowance still pushes Monday over.
    const shortened = w[0].fixes[0].apply(h);
    const stillOver = only(shortened, "W01").filter((x) => x.weekday === "mon");
    expect(stillOver).toHaveLength(1);
    expect(stillOver[0].fixes.map((f) => f.id)).toEqual([
      "remove-last",
      "reduce",
    ]);
    const reduced = stillOver[0].fixes[1].apply(shortened);
    expect(
      only(reduced, "W01").filter((x) => x.weekday === "mon"),
    ).toHaveLength(0);
  });

  it("W02 weekly cap wins even when every day fits", () => {
    const h = simonaHousehold();
    h.kids[0].channels[0].windows[0].days = ["mon", "wed", "fri", "sun"];
    h.kids[0].channels[0].windows[0].end = "17:00";
    h.kids[0].allowances = h.kids[0].allowances.map((a) =>
      a.tech === "games" ? { ...a, minutesPerDay: 30, daysPerWeek: 7 } : a,
    );
    // 27 x 4 + 30 x 7 = 318 > 120, and Monday 57 > 30 raises W01 too.
    const w = only(h, "W02");
    expect(w).toHaveLength(1);
    expect(w[0].fixes.map((f) => f.id)).toEqual(["drop-day", "scale"]);
  });

  it("W03 too many days and W04 consecutive days, with fixes that clear them", () => {
    const h = simonaHousehold();
    h.kids[0].channels[0].windows[0].days = ["mon", "tue", "wed", "thu", "fri"];
    expect(codes(h)).toContain("W03");
    expect(codes(h)).toContain("W04");
    const fixed = only(h, "W04")[0].fixes[0].apply(h);
    expect(codes(fixed)).not.toContain("W03");
    expect(codes(fixed)).not.toContain("W04");
    const dropped = only(h, "W04")[0].fixes[1].apply(h);
    expect(dropped.kids[0].channels[0].windows[0].days).toEqual([
      "mon",
      "wed",
      "thu",
      "fri",
    ]);
  });

  it("W05 for a channel under 3, kept by dismissal and not blocked (C5.4)", () => {
    const h = emptyHousehold(now);
    h.shows = [show("a", 12)];
    const selena = createKid(
      { name: "Selena", birthdate: "2025-06-01", pin: null, colour: 1 },
      now,
    );
    selena.channels = [
      {
        id: "sh",
        name: "Shichida",
        icon: "star",
        windows: [
          {
            days: ["mon", "tue", "wed", "thu", "fri"],
            start: "10:00",
            end: "10:15",
          },
        ],
        programme: ["a"],
        programmesByDay: null,
      },
    ];
    h.kids = [selena];
    const w = only(h, "W05");
    expect(w).toHaveLength(1);
    expect(w[0].message).toMatch(/Selena is 1/);
    const kept = w[0].fixes.find((f) => f.id === "keep")!.apply(h);
    expect(deriveWarnings(kept, now).map((x) => x.code)).toContain("W05");
    expect(visibleWarnings(kept, now).map((x) => x.code)).not.toContain("W05");
    const removed = w[0].fixes.find((f) => f.id === "remove")!.apply(h);
    expect(only(removed, "W05")).toHaveLength(0);
  });

  it("W06 after dinner, W07 past bedtime, W08 routine clash", () => {
    const dinner = simonaHousehold();
    dinner.kids[0].channels[0].windows[0] = {
      days: ["mon"],
      start: "17:15",
      end: "17:45",
    };
    expect(codes(dinner)).toContain("W06");
    const fixed = only(dinner, "W06")[0].fixes[0].apply(dinner);
    expect(fixed.kids[0].channels[0].windows[0]).toMatchObject({
      start: "17:00",
      end: "17:30",
    });
    expect(codes(fixed)).not.toContain("W06");

    const bed = simonaHousehold();
    bed.kids[0].channels[0].windows[0] = {
      days: ["mon"],
      start: "18:45",
      end: "19:15",
    };
    expect(codes(bed)).toContain("W07");

    const school = simonaHousehold();
    school.kids[0].channels[0].windows[0] = {
      days: ["mon"],
      start: "15:00",
      end: "15:30",
    };
    const w = only(school, "W08");
    expect(w).toHaveLength(1);
    expect(w[0].fixes[0].label).toBe("Start when kindergarten ends");
    expect(
      w[0].fixes[0].apply(school).kids[0].channels[0].windows[0],
    ).toMatchObject({ start: "16:00", end: "16:30" });
  });

  it("W10 a show that does not fit, with remove and extend", () => {
    const h = simonaHousehold();
    h.kids[0].channels[0].programme = ["a", "b", "c"];
    const w = only(h, "W10");
    expect(w.length).toBe(4);
    expect(w[0].fixes[1].label).toBe("Extend the window by 17 minutes");
    expect(only(w[0].fixes[0].apply(h), "W10")).toHaveLength(0);
  });

  it("W11 an on-air day with nothing to play", () => {
    const h = simonaHousehold();
    h.kids[0].channels[0].programmesByDay = { wed: [] };
    const w = only(h, "W11");
    expect(w).toHaveLength(1);
    expect(w[0].fixes[0].label).toBe("Copy Monday's programme");
    expect(only(w[0].fixes[0].apply(h), "W11")).toHaveLength(0);
  });

  it("W12 informational overage from the log, with no fixes", () => {
    const h = simonaHousehold();
    h.viewingLog = [
      {
        id: "e",
        kidId: h.kids[0].id,
        date: "2026-09-28",
        channelId: "ch",
        showId: "a",
        startedAt: "",
        seconds: 45 * 60,
        coWatch: true,
      },
    ];
    const w = only(h, "W12");
    expect(w).toHaveLength(1);
    expect(w[0].fixes).toEqual([]);
  });
});

describe("W09 overlap on one television (C5.5)", () => {
  it("two kids: stagger, a refused earlier move with its reason, and together", () => {
    const h = seedHousehold(now);
    const mon = only(h, "W09").filter((w) => w.weekday === "mon");
    expect(mon).toHaveLength(1);
    expect(mon[0].message).toMatch(
      /Henry and Ella both have the TV from 16:30 to 17:00/,
    );
    const [stagger, earlier, together] = mon[0].fixes;
    expect(earlier.disabled).toMatch(/Henry is at kindergarten/);
    const staggered = stagger.apply(h);
    expect(staggered.kids[2].channels[0].windows[0]).toMatchObject({
      start: "17:00",
      end: "18:00",
    });
    expect(
      only(staggered, "W09").filter((w) => w.weekday === "mon"),
    ).toHaveLength(0);
    expect(only(staggered, "W06").some((w) => w.kidId === h.kids[2].id)).toBe(
      true,
    );
    const acked = together.apply(h);
    expect(only(acked, "W09").filter((w) => w.weekday === "mon")).toHaveLength(
      0,
    );
  });
  it("three kids overlapping produce a warning per pair", () => {
    const h = seedHousehold(now);
    const grace = h.kids[0];
    grace.channels = [
      {
        id: "g",
        name: "Songs",
        icon: "music",
        windows: [{ days: ["mon"], start: "16:30", end: "16:45" }],
        programme: [h.shows[0].id],
        programmesByDay: null,
      },
    ];
    expect(only(h, "W09").filter((w) => w.weekday === "mon")).toHaveLength(3);
  });
});

describe("dismissals and the global mute (C2.4)", () => {
  it("hide warnings without changing the derivation", () => {
    const h = simonaHousehold();
    h.kids[0].channels[0].windows[0].days = ["mon", "tue"];
    expect(visibleWarnings(h, now).map((w) => w.code)).toContain("W04");
    const d = dismiss(h, only(h, "W04")[0].key);
    expect(visibleWarnings(d, now).map((w) => w.code)).not.toContain("W04");
    expect(deriveWarnings(d, now).map((w) => w.code)).toContain("W04");
    const muted = { ...h, settings: { ...h.settings, warningsMuted: true } };
    expect(visibleWarnings(muted, now)).toEqual([]);
  });
});
