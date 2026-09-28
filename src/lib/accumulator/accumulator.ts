import { getCap, type Bracket } from "@/content";
import { bracketFor } from "@/lib/bracket/bracket";
import { toIsoDate } from "@/lib/bracket/bracket";
import { WEEKDAYS, type Weekday } from "@/lib/clock/clock";
import type { Kid, Show, ViewingEntry } from "@/lib/model/types";
import { scheduledMinutes } from "@/lib/schedule/schedule";

/** Planned long-form minutes on a weekday: the sum of the kid's channel layouts (D13). */
export function tvMinutes(kid: Kid, weekday: Weekday, shows: Show[]): number {
  return kid.channels.reduce(
    (sum, c) => sum + scheduledMinutes(c, weekday, shows),
    0,
  );
}

/**
 * Manual allowances (games, school apps) have days per week but no chosen days; they are
 * counted on the first N weekdays, Monday first (docs/log/08-build.md M3).
 */
export function manualMinutes(kid: Kid, weekday: Weekday): number {
  const index = WEEKDAYS.indexOf(weekday);
  return kid.allowances
    .filter((a) => a.tech !== "longform")
    .reduce((sum, a) => sum + (index < a.daysPerWeek ? a.minutesPerDay : 0), 0);
}

export function plannedMinutes(
  kid: Kid,
  weekday: Weekday,
  shows: Show[],
): number {
  return tvMinutes(kid, weekday, shows) + manualMinutes(kid, weekday);
}

export type PlannedWeek = {
  perDay: Record<Weekday, number>;
  total: number;
  daysUsed: number;
  /** Adjacent weekdays that both carry long-form minutes, for W04. */
  consecutiveTvPairs: [Weekday, Weekday][];
};

export function plannedWeek(kid: Kid, shows: Show[]): PlannedWeek {
  const perDay = Object.fromEntries(
    WEEKDAYS.map((w) => [w, plannedMinutes(kid, w, shows)]),
  ) as Record<Weekday, number>;
  const tv = WEEKDAYS.map((w) => tvMinutes(kid, w, shows) > 0);
  const consecutiveTvPairs: [Weekday, Weekday][] = [];
  for (let i = 0; i < WEEKDAYS.length - 1; i++) {
    if (tv[i] && tv[i + 1])
      consecutiveTvPairs.push([WEEKDAYS[i], WEEKDAYS[i + 1]]);
  }
  return {
    perDay,
    total: WEEKDAYS.reduce((s, w) => s + perDay[w], 0),
    daysUsed: WEEKDAYS.filter((w) => perDay[w] > 0).length,
    consecutiveTvPairs,
  };
}

/** Monday of the week containing `date`, as an ISO date. */
export function weekStart(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toIsoDate(d);
}

export function loggedMinutesOn(
  log: ViewingEntry[],
  kidId: string,
  date: string,
): number {
  return (
    log
      .filter((e) => e.kidId === kidId && e.date === date)
      .reduce((s, e) => s + e.seconds, 0) / 60
  );
}

export function loggedMinutesInWeek(
  log: ViewingEntry[],
  kidId: string,
  date: Date,
): number {
  const start = weekStart(date);
  const end = toIsoDate(date);
  return (
    log
      .filter((e) => e.kidId === kidId && e.date >= start && e.date <= end)
      .reduce((s, e) => s + e.seconds, 0) / 60
  );
}

export type Budget = {
  bracket: Bracket;
  capPerDay: number;
  capPerWeek: number;
  usedToday: number;
  usedThisWeek: number;
  leftToday: number;
  leftThisWeek: number;
  /** True when the TV shows off-air for this kid for the rest of the day (D15). */
  spent: boolean;
};

/**
 * Budget left from the viewing log; the weekly cap wins. A zero cap is not enforced (D46): the
 * channel window is then the only limit and every minute counts as overage (W12).
 */
export function budgetLeft(kid: Kid, log: ViewingEntry[], now: Date): Budget {
  const bracket = bracketFor(kid.birthdate, now);
  const cap = getCap(bracket);
  const usedToday = loggedMinutesOn(log, kid.id, toIsoDate(now));
  const usedThisWeek = loggedMinutesInWeek(log, kid.id, now);
  const leftToday = cap.minutesPerDay - usedToday;
  const leftThisWeek = cap.minutesPerWeek - usedThisWeek;
  const enforced = cap.minutesPerDay > 0;
  return {
    bracket,
    capPerDay: cap.minutesPerDay,
    capPerWeek: cap.minutesPerWeek,
    usedToday,
    usedThisWeek,
    leftToday,
    leftThisWeek,
    spent: enforced && (leftToday <= 0 || leftThisWeek <= 0),
  };
}
