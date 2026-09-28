import { describe, expect, it } from "vitest";
import { ageOn, bracketFor, isBeyondScope, nextBirthday } from "./bracket";

const at = (iso: string) => new Date(`${iso}T12:00:00`);

describe("ageOn and bracketFor", () => {
  it("counts whole years by calendar", () => {
    expect(ageOn("2022-03-14", at("2026-03-13"))).toBe(3);
    expect(ageOn("2022-03-14", at("2026-03-14"))).toBe(4);
    expect(ageOn("2025-09-30", at("2026-09-28"))).toBe(0);
  });

  it("changes bracket on the birthday and not before (C6.1)", () => {
    expect(bracketFor("2022-03-14", at("2027-03-13"))).toBe("4-5");
    expect(bracketFor("2022-03-14", at("2027-03-14"))).toBe("5-6");
  });

  it("reads a kid of 8 or more as 7-8 and out of scope", () => {
    expect(bracketFor("2018-01-01", at("2026-09-28"))).toBe("7-8");
    expect(isBeyondScope("2018-01-01", at("2026-09-28"))).toBe(true);
    expect(isBeyondScope("2019-01-01", at("2026-09-28"))).toBe(false);
  });

  it("finds the next birthday, including today", () => {
    expect(nextBirthday("2022-03-14", at("2026-09-28"))).toBe("2027-03-14");
    expect(nextBirthday("2022-03-14", at("2027-03-14"))).toBe("2027-03-14");
    expect(nextBirthday("2022-11-02", at("2026-09-28"))).toBe("2026-11-02");
  });
});
