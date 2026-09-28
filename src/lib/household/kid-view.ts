import { getCap } from "@/content";
import { plannedMinutes, plannedWeek } from "@/lib/accumulator/accumulator";
import { ageOn, bracketFor, isBeyondScope } from "@/lib/bracket/bracket";
import { weekdayOf } from "@/lib/clock/clock";
import type { Household, Kid } from "@/lib/model/types";
import { visibleWarnings, type Warning } from "@/lib/warnings/warnings";

export const KID_COLOUR_CLASS: Record<Kid["colour"], string> = {
  1: "bg-kid-1",
  2: "bg-kid-2",
  3: "bg-kid-3",
  4: "bg-kid-4",
  5: "bg-kid-5",
  6: "bg-kid-6",
};

/** Text placed on a kid colour: ink on mustard, white elsewhere, so every pair clears 4.5:1. */
export const KID_TEXT_CLASS: Record<Kid["colour"], string> = {
  1: "text-white",
  2: "text-white",
  3: "text-foreground",
  4: "text-white",
  5: "text-white",
  6: "text-white",
};

export const KID_COLOUR_NAMES: Record<Kid["colour"], string> = {
  1: "Teal",
  2: "Terracotta",
  3: "Mustard",
  4: "Plum",
  5: "Moss",
  6: "Slate",
};

export function bracketLabel(bracket: string): string {
  const [a, b] = bracket.split("-");
  return `bracket ${a} to ${b}`;
}

/** Everything a kid card or header shows, computed once per render (S04, S05). */
export function kidView(household: Household, kid: Kid, now: Date) {
  const bracket = bracketFor(kid.birthdate, now);
  const cap = getCap(bracket);
  const today = weekdayOf(now);
  const plannedToday = plannedMinutes(kid, today, household.shows);
  const week = plannedWeek(kid, household.shows);
  const warnings = visibleWarnings(household, now).filter(
    (w) => w.kidId === kid.id,
  );
  return {
    age: ageOn(kid.birthdate, now),
    bracket,
    beyondScope: isBeyondScope(kid.birthdate, now),
    cap,
    today,
    plannedToday,
    week,
    warnings,
    state: budgetState(plannedToday, cap.minutesPerDay, warnings),
  };
}

export type BudgetState = "under" | "at" | "over" | "choice";

/** Over by choice once every warning on the subject has been dismissed (D37). */
export function budgetState(
  planned: number,
  cap: number,
  visible: Warning[],
): BudgetState {
  if (planned > cap) return visible.length === 0 ? "choice" : "over";
  if (planned === cap && cap > 0) return "at";
  return "under";
}

export function formatMinutes(minutes: number): string {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} h` : `${h} h ${rest} min`;
}
