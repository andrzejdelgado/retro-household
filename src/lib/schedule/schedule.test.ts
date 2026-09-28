import { describe, expect, it } from "vitest";
import type { Channel, Show } from "@/lib/model/types";
import { createKid } from "@/lib/routine/routine";
import {
  defaultDays,
  defaultWindow,
  layout,
  nowPlaying,
  scheduledMinutes,
} from "./schedule";

const now = new Date("2026-09-28T12:00:00");
const show = (id: string, minutes: number): Show => ({
  id,
  title: id,
  durationSec: minutes * 60,
  fileKey: null,
  posterKey: null,
  category: "stories",
  ages: [3, 6],
  addedAt: now.toISOString(),
});
const shows = [show("a", 12), show("b", 15), show("c", 20)];
const stories: Channel = {
  id: "ch1",
  name: "Stories",
  icon: "book",
  windows: [
    { days: ["mon", "wed", "fri", "sun"], start: "17:00", end: "17:30" },
  ],
  programme: ["a", "b", "c"],
  programmesByDay: null,
};

describe("defaults", () => {
  it("follows the bracket's frequency rules", () => {
    expect(defaultDays("2-3")).toEqual([]);
    expect(defaultDays("4-5")).toEqual(["mon", "wed", "fri", "sun"]);
    expect(defaultDays("6-7")).toEqual(["mon", "tue", "wed", "thu", "fri"]);
    expect(defaultDays("7-8")).toEqual([
      "mon",
      "tue",
      "wed",
      "thu",
      "fri",
      "sat",
    ]);
  });
  it("starts at the screen slot for the length of the cap, or has no default (D17, D27)", () => {
    const simona = createKid(
      { name: "Simona", birthdate: "2022-03-14", pin: null, colour: 2 },
      now,
    );
    expect(defaultWindow(simona, "4-5")).toEqual({
      days: ["mon", "wed", "fri", "sun"],
      start: "16:30",
      end: "17:00",
    });
    const selena = createKid(
      { name: "Selena", birthdate: "2025-06-01", pin: null, colour: 1 },
      now,
    );
    expect(defaultWindow(selena, "1-2")).toBeNull();
  });
});

describe("layout (C4.2)", () => {
  it("places shows back to back and refuses the one that would cross the window end", () => {
    const l = layout(stories, "mon", shows);
    expect(l.placed).toEqual([
      { showId: "a", startSec: 17 * 3600, endSec: 17 * 3600 + 12 * 60 },
      {
        showId: "b",
        startSec: 17 * 3600 + 12 * 60,
        endSec: 17 * 3600 + 27 * 60,
      },
    ]);
    expect(l.notPlaced).toEqual(["c"]);
    expect(l.offAirAtSec).toBe(17 * 3600 + 27 * 60);
    expect(scheduledMinutes(stories, "mon", shows)).toBe(27);
  });
  it("is empty on a day outside the window", () => {
    expect(layout(stories, "tue", shows)).toMatchObject({
      window: null,
      placed: [],
    });
    expect(scheduledMinutes(stories, "tue", shows)).toBe(0);
  });
  it("uses the per-day programme only when the parent varies by day (D30)", () => {
    const varied = { ...stories, programmesByDay: { wed: ["c"] } };
    expect(layout(varied, "wed", shows).placed.map((p) => p.showId)).toEqual([
      "c",
    ]);
    expect(layout(varied, "mon", shows).placed.map((p) => p.showId)).toEqual([
      "a",
      "b",
    ]);
  });
});

describe("nowPlaying (C4.1)", () => {
  it("tuning in at 17:08 on a Monday lands 8 minutes into show a", () => {
    expect(nowPlaying(stories, shows, new Date("2026-09-28T17:08:00"))).toEqual(
      {
        showId: "a",
        offsetSec: 8 * 60,
      },
    );
  });
  it("is off air between shows' end and the window end, and outside the window", () => {
    expect(
      nowPlaying(stories, shows, new Date("2026-09-28T17:28:00")),
    ).toBeNull();
    expect(
      nowPlaying(stories, shows, new Date("2026-09-29T17:08:00")),
    ).toBeNull();
  });
});
