import { describe, expect, it } from "vitest";
import { minutesOf, resolveNow, timeOf, weekdayOf } from "./clock";

describe("clock", () => {
  it("uses the demo clock when set and the real clock otherwise", () => {
    const real = new Date("2026-09-28T10:00:00");
    expect(resolveNow(null, real)).toBe(real);
    expect(resolveNow("2027-03-15T17:08:00", real).getHours()).toBe(17);
    expect(resolveNow("not a date", real)).toBe(real);
  });

  it("gives Monday-first weekdays", () => {
    expect(weekdayOf(new Date("2026-09-28T12:00:00"))).toBe("mon");
    expect(weekdayOf(new Date("2026-10-04T12:00:00"))).toBe("sun");
  });

  it("converts times both ways, including the end of the day", () => {
    expect(minutesOf("17:08")).toBe(1028);
    expect(timeOf(1028)).toBe("17:08");
    expect(minutesOf("24:00")).toBe(1440);
  });
});
