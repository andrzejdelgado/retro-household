import { describe, expect, it } from "vitest";
import type { Channel, Show, ViewingEntry } from "@/lib/model/types";
import { createKid } from "@/lib/routine/routine";
import { defaultWindow } from "@/lib/schedule/schedule";
import {
  budgetLeft,
  plannedMinutes,
  plannedWeek,
  weekStart,
} from "./accumulator";

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
const shows = [show("a", 12), show("b", 15)];

function kidWithChannel(birthdate: string) {
  const kid = createKid({ name: "K", birthdate, pin: null, colour: 1 }, now);
  const window = defaultWindow(kid, "4-5");
  const channel: Channel = {
    id: "c",
    name: "Stories",
    icon: "book",
    windows: window ? [window] : [],
    programme: ["a", "b"],
    programmesByDay: null,
  };
  return { ...kid, channels: [channel] };
}

describe("planned minutes (C5.1)", () => {
  it("sums placed TV minutes and manual allowances on the first N weekdays", () => {
    const kid = kidWithChannel("2022-03-14");
    kid.allowances = kid.allowances.map((a) =>
      a.tech === "games"
        ? { ...a, minutesPerDay: 20, days: ["mon", "tue"] }
        : a,
    );
    expect(plannedMinutes(kid, "mon", shows)).toBe(27 + 20);
    expect(plannedMinutes(kid, "tue", shows)).toBe(0 + 20);
    expect(plannedMinutes(kid, "wed", shows)).toBe(27);
    const week = plannedWeek(kid, shows);
    expect(week.total).toBe(27 * 4 + 40);
    expect(week.daysUsed).toBe(5);
    expect(week.consecutiveTvPairs).toEqual([]);
  });
  it("finds consecutive TV days", () => {
    const kid = kidWithChannel("2022-03-14");
    kid.channels[0].windows[0].days = ["mon", "tue"];
    expect(plannedWeek(kid, shows).consecutiveTvPairs).toEqual([
      ["mon", "tue"],
    ]);
  });
  it("is zero for a kid with nothing scheduled", () => {
    const kid = createKid(
      { name: "Selena", birthdate: "2025-06-01", pin: null, colour: 1 },
      now,
    );
    expect(plannedWeek(kid, shows).total).toBe(0);
  });
});

describe("budget left (C5.2, D15)", () => {
  const entry = (
    kidId: string,
    date: string,
    minutes: number,
  ): ViewingEntry => ({
    id: `${date}-${minutes}`,
    kidId,
    date,
    channelId: "c",
    showId: "a",
    startedAt: `${date}T17:00:00`,
    seconds: minutes * 60,
    coWatch: false,
  });
  it("counts today and the week from Monday; the weekly cap wins", () => {
    const kid = kidWithChannel("2022-03-14");
    expect(weekStart(new Date("2026-10-04T12:00:00"))).toBe("2026-09-28");
    const log = [
      entry(kid.id, "2026-09-28", 30),
      entry(kid.id, "2026-09-30", 30),
      entry(kid.id, "2026-10-02", 30),
      entry(kid.id, "2026-10-04", 20),
    ];
    const b = budgetLeft(kid, log, new Date("2026-10-04T17:20:00"));
    expect(b.usedToday).toBe(20);
    expect(b.usedThisWeek).toBe(110);
    expect(b.leftToday).toBe(10);
    expect(b.spent).toBe(false);
    const later = budgetLeft(
      kid,
      [...log, entry(kid.id, "2026-10-04", 10)],
      new Date("2026-10-04T17:30:00"),
    );
    expect(later.leftToday).toBe(0);
    expect(later.spent).toBe(true);
    const weekly = budgetLeft(
      kid,
      [...log, entry(kid.id, "2026-10-01", 30)],
      new Date("2026-10-04T17:20:00"),
    );
    expect(weekly.leftToday).toBe(10);
    expect(weekly.leftThisWeek).toBe(-20);
    expect(weekly.spent).toBe(true);
  });
  it("does not enforce a zero cap (D46): the window is the limit and minutes are overage", () => {
    const selena = createKid(
      { name: "Selena", birthdate: "2025-06-01", pin: null, colour: 1 },
      now,
    );
    const b = budgetLeft(selena, [entry(selena.id, "2026-09-28", 5)], now);
    expect(b.capPerDay).toBe(0);
    expect(b.leftToday).toBe(-5);
    expect(b.spent).toBe(false);
  });
});
