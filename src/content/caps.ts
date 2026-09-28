import type { Bracket, Cap } from "./types";
import { bracketsInRange } from "./brackets";

// best-parctices/household-tech-access-stages.md, "Total screen budget" table.
// "never two days in a row" comes from the long-form row for 3 to 5.
const rows: { ages: [number, number]; cap: Cap }[] = [
  {
    ages: [0, 3],
    cap: {
      minutesPerDay: 0,
      minutesPerWeek: 0,
      maxDaysPerWeek: 0,
      noConsecutiveDays: false,
    },
  },
  {
    ages: [3, 5],
    cap: {
      minutesPerDay: 30,
      minutesPerWeek: 120,
      maxDaysPerWeek: 4,
      noConsecutiveDays: true,
    },
  },
  {
    ages: [5, 7],
    cap: {
      minutesPerDay: 45,
      minutesPerWeek: 240,
      maxDaysPerWeek: 5,
      noConsecutiveDays: false,
    },
  },
  {
    ages: [7, 8],
    cap: {
      minutesPerDay: 60,
      minutesPerWeek: 300,
      maxDaysPerWeek: 6,
      noConsecutiveDays: false,
    },
  },
];

export const CAPS: Record<Bracket, Cap> = Object.fromEntries(
  rows.flatMap(({ ages, cap }) =>
    bracketsInRange(ages).map((b) => [b, cap] as const),
  ),
) as Record<Bracket, Cap>;
