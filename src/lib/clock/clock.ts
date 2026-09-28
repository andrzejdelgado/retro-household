/** "Now", with the household's demo clock override applied (docs/05-domain-model.md, settings.demoClock). */
export function resolveNow(
  demoClock: string | null | undefined,
  real: Date = new Date(),
): Date {
  if (!demoClock) return real;
  const parsed = new Date(demoClock);
  return Number.isNaN(parsed.getTime()) ? real : parsed;
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export const WEEKDAYS: Weekday[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

/** Monday-first weekday of a date (D23). */
export function weekdayOf(date: Date): Weekday {
  return WEEKDAYS[(date.getDay() + 6) % 7];
}

/** Minutes since midnight for a "HH:mm" time; "24:00" is the end of the day. */
export function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function timeOf(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
