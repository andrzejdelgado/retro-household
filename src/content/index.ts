import { bracketsInRange, bracketLow } from "./brackets";
import { CAPS } from "./caps";
import { MAJOR_RULES } from "./major-rules";
import { DOMAIN_TITLES, DOMAIN_WHY, PRACTICES } from "./practices";
import { RHYTHM_TEMPLATES } from "./rhythms";
import { SOURCES } from "./sources";
import { TECHS } from "./tech-stages";
import type {
  Bracket,
  Cap,
  CountableTech,
  DayKind,
  Domain,
  Practice,
  RhythmTemplate,
  Tech,
  TechStageRow,
} from "./types";

export * from "./types";
export { bracketForAge, bracketLow, bracketsInRange } from "./brackets";
export { CAPS, MAJOR_RULES, PRACTICES, RHYTHM_TEMPLATES, SOURCES, TECHS };
export { DOMAIN_TITLES, DOMAIN_WHY };

export function getCap(bracket: Bracket): Cap {
  return CAPS[bracket];
}

/** The stage row of one technology for a bracket, or null when the file has no row that low. */
export function getTechStage(
  tech: Tech,
  bracket: Bracket,
): TechStageRow | null {
  return (
    tech.rows.find((r) => bracketsInRange(r.ages).includes(bracket)) ?? null
  );
}

/** Every technology with its row for the bracket, in the file's order. */
export function getTechStages(
  bracket: Bracket,
): { tech: Tech; row: TechStageRow | null }[] {
  return TECHS.map((tech) => ({ tech, row: getTechStage(tech, bracket) }));
}

/** The technologies that count towards the budget, with their default allowance for the bracket. */
export function getDefaultAllowances(
  bracket: Bracket,
): { tech: CountableTech; minutesPerDay: number; daysPerWeek: number }[] {
  return TECHS.filter((t) => t.countsAs).map((t) => {
    const row = getTechStage(t, bracket);
    return {
      tech: t.countsAs as CountableTech,
      minutesPerDay: row?.allowance?.minutesPerDay ?? 0,
      daysPerWeek: row?.allowance?.daysPerWeek ?? 0,
    };
  });
}

/**
 * A row's depth with a leading "Same" resolved against the row above, for display. The stored
 * text stays as written in the file so the content test can compare it (D24).
 */
export function resolvedDepth(tech: Tech, row: TechStageRow): string {
  if (!/^Same\b/.test(row.depth)) return row.depth;
  const i = tech.rows.indexOf(row);
  const previous = i > 0 ? resolvedDepth(tech, tech.rows[i - 1]) : "";
  const rest = row.depth.replace(/^Same[.,]?\s*/, "");
  return rest ? `${previous}. ${rest}`.replace(/\.\.\s/, ". ") : previous;
}

/** The age at which a closed technology opens, from its first "later" entry, or null. */
export function opensAt(tech: Tech): number | null {
  return tech.later.find((l) => l.opensAt !== null)?.opensAt ?? null;
}

export function getPractices(bracket: Bracket, domain?: Domain): Practice[] {
  return PRACTICES.filter(
    (p) =>
      bracketsInRange(p.ages).includes(bracket) &&
      (domain === undefined || p.domain === domain),
  );
}

export function getRhythmTemplate(
  bracket: Bracket,
  kind: DayKind,
): RhythmTemplate {
  const t = RHYTHM_TEMPLATES.find(
    (r) => r.kind === kind && bracketsInRange(r.ages).includes(bracket),
  );
  if (!t) throw new Error(`No ${kind} rhythm template for ${bracket}`);
  return t;
}

export function domainsFor(bracket: Bracket): Domain[] {
  const low = bracketLow(bracket);
  return (Object.keys(DOMAIN_TITLES) as Domain[]).filter((d) =>
    PRACTICES.some(
      (p) => p.domain === d && p.ages[0] <= low && low < p.ages[1],
    ),
  );
}
