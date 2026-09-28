import { describe, expect, it } from "vitest";
import { getPractices } from "@/content";
import {
  addPractice,
  copyDayTo,
  createKid,
  dayTypeFor,
  editBlock,
  mergeBack,
  orderedDayTypes,
  refreshForBracket,
  screenBlock,
  sleepBlock,
  splitDays,
  weekdaysOf,
} from "./routine";

const now = new Date("2026-09-28T12:00:00");
const simona = () =>
  createKid(
    { name: "Simona", birthdate: "2022-03-14", pin: null, colour: 2 },
    now,
  );
const selena = () =>
  createKid(
    { name: "Selena", birthdate: "2025-06-01", pin: null, colour: 1 },
    now,
  );

describe("createKid", () => {
  it("prefills weekday and weekend from the bracket's template and the allowances (C2.1)", () => {
    const kid = simona();
    expect(kid.dayTypes.map((d) => d.label)).toEqual(["Weekday", "Weekend"]);
    expect(screenBlock(dayTypeFor(kid, "mon"))).toMatchObject({
      start: "16:30",
      end: "17:00",
    });
    expect(sleepBlock(dayTypeFor(kid, "mon"))?.start).toBe("19:00");
    expect(kid.allowances).toEqual([
      { tech: "longform", minutesPerDay: 30, daysPerWeek: 4, source: "manual" },
      { tech: "games", minutesPerDay: 0, daysPerWeek: 0, source: "manual" },
      {
        tech: "schoolApps",
        minutesPerDay: 0,
        daysPerWeek: 0,
        source: "manual",
      },
    ]);
  });
  it("gives a kid under 3 no screen block", () => {
    expect(screenBlock(dayTypeFor(selena(), "mon"))).toBeNull();
  });
});

describe("split, copy, merge (D29, C3.4)", () => {
  it("splits weekdays into five day types, each a copy", () => {
    const kid = splitDays(simona(), "weekday");
    expect(orderedDayTypes(kid).map((d) => d.label)).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Weekend",
    ]);
    expect(kid.dayTypes).toHaveLength(6);
    expect(dayTypeFor(kid, "tue").blocks.map((b) => b.title)).toEqual(
      dayTypeFor(kid, "mon").blocks.map((b) => b.title),
    );
  });
  it("copying points weekdays at one day type and drops the orphans", () => {
    let kid = splitDays(simona(), "weekday");
    const monday = kid.week.mon;
    kid = copyDayTo(kid, monday, ["tue", "wed", "thu"]);
    expect(weekdaysOf(kid, monday)).toEqual(["mon", "tue", "wed", "thu"]);
    expect(kid.dayTypes.find((d) => d.id === monday)?.label).toBe(
      "Monday · Tuesday · Wednesday · Thursday",
    );
    expect(kid.dayTypes).toHaveLength(3);
  });
  it("merging back restores one Weekday", () => {
    const kid = mergeBack(splitDays(simona(), "weekday"), "weekday");
    expect(orderedDayTypes(kid).map((d) => d.label)).toEqual([
      "Weekday",
      "Weekend",
    ]);
  });
});

describe("editBlock ripple (D28)", () => {
  it("moving school's end to 17:00 removes the swallowed blocks and shrinks the next one", () => {
    const kid = simona();
    const dt = dayTypeFor(kid, "mon");
    const school = dt.blocks.find((b) => b.title === "Kindergarten")!;
    const r = editBlock(dt, school.id, { end: "17:00" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const titles = r.value.blocks.map((b) => `${b.start}-${b.end} ${b.title}`);
    expect(titles).toContain("08:00-17:00 Kindergarten");
    expect(titles).toContain("17:00-17:30 Free play, chores 10 min");
    expect(r.value.blocks.find((b) => b.kind === "screen")).toBeUndefined();
    expect(
      r.value.blocks.find((b) => b.title === "Kindergarten")?.fromTemplate,
    ).toBe(false);
  });
  it("refuses a change that would push bedtime", () => {
    const dt = dayTypeFor(simona(), "mon");
    const dinner = dt.blocks.find((b) => b.title === "Dinner")!;
    const r = editBlock(dt, dinner.id, { end: "19:15" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.refused).toMatch(/bedtime/);
  });
  it("moving a start earlier shortens the previous block", () => {
    const dt = dayTypeFor(simona(), "mon");
    const dinner = dt.blocks.find((b) => b.title === "Dinner")!;
    const r = editBlock(dt, dinner.id, { start: "17:15" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(
      r.value.blocks.find((b) => b.title === "Free play, chores 10 min")?.end,
    ).toBe("17:15");
  });
  it("refuses an end before the start", () => {
    const dt = dayTypeFor(simona(), "mon");
    const dinner = dt.blocks.find((b) => b.title === "Dinner")!;
    expect(editBlock(dt, dinner.id, { end: "17:00" }).ok).toBe(false);
  });
});

describe("addPractice", () => {
  it("places a practice in the first gap that fits, else before sleep", () => {
    const dt = dayTypeFor(simona(), "mon");
    const boredom = getPractices("4-5", "play")[0];
    const r = addPractice(dt, boredom);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const added = r.value.blocks.find((b) => b.practiceId === boredom.id)!;
    expect(added.title).toBe("Boredom rule");
    expect(added.end).toBe(sleepBlock(r.value)!.start);
  });
});

describe("refreshForBracket (D08, C6.1)", () => {
  it("replaces untouched template blocks on a birthday and keeps edited ones", () => {
    let kid = simona();
    const dt = dayTypeFor(kid, "mon");
    const dinner = dt.blocks.find((b) => b.title === "Dinner")!;
    const edited = editBlock(dt, dinner.id, { title: "Dinner together" });
    if (!edited.ok) throw new Error(edited.refused);
    kid = {
      ...kid,
      dayTypes: kid.dayTypes.map((d) => (d.id === dt.id ? edited.value : d)),
    };

    const afterFifthBirthday = new Date("2027-03-15T12:00:00");
    const grown = refreshForBracket(kid, afterFifthBirthday);
    const monday = dayTypeFor(grown, "mon");
    expect(
      monday.blocks.find((b) => b.title === "Dinner together"),
    ).toBeDefined();
    expect(screenBlock(monday)).toMatchObject({ start: "16:30", end: "17:15" });
    expect(sleepBlock(monday)?.start).toBe("19:30");
    expect(grown.allowances.find((a) => a.tech === "longform")).toMatchObject({
      minutesPerDay: 45,
      daysPerWeek: 5,
    });
  });
});
