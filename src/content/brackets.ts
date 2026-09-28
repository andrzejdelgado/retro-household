import { BRACKETS, type Bracket } from "./types";

/** The one-year brackets covered by an age range such as [3, 5] → 3-4, 4-5. Clamped to under 8. */
export function bracketsInRange([from, to]: [number, number]): Bracket[] {
  return BRACKETS.filter((b) => {
    const low = Number(b.split("-")[0]);
    return low >= from && low < Math.min(to, 8);
  });
}

export function bracketForAge(age: number): Bracket {
  const clamped = Math.max(0, Math.min(7, Math.floor(age)));
  return `${clamped}-${clamped + 1}` as Bracket;
}

export function bracketLow(bracket: Bracket): number {
  return Number(bracket.split("-")[0]);
}
