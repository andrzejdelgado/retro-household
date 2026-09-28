import { bracketForAge, type Bracket } from "@/content";

/** Whole years between an ISO birthdate and a date, by calendar, not by 365-day years. */
export function ageOn(birthdate: string, on: Date): number {
  const [y, m, d] = birthdate.split("-").map(Number);
  let age = on.getFullYear() - y;
  const beforeBirthday =
    on.getMonth() + 1 < m || (on.getMonth() + 1 === m && on.getDate() < d);
  if (beforeBirthday) age -= 1;
  return Math.max(0, age);
}

/** The kid's one-year bracket today. A kid of 8 or more reads as 7-8 (out of scope, D08). */
export function bracketFor(birthdate: string, now: Date): Bracket {
  return bracketForAge(ageOn(birthdate, now));
}

export function isBeyondScope(birthdate: string, now: Date): boolean {
  return ageOn(birthdate, now) >= 8;
}

/** The next birthday on or after `now`, as an ISO date. */
export function nextBirthday(birthdate: string, now: Date): string {
  const [, m, d] = birthdate.split("-").map(Number);
  const year = now.getFullYear();
  const candidate = new Date(year, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next = candidate >= today ? candidate : new Date(year + 1, m - 1, d);
  return toIsoDate(next);
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
