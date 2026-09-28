import { minutesOf, type Weekday } from "@/lib/clock/clock";
import type { Channel, Household, Kid, Window } from "@/lib/model/types";
import { dayTypeFor, sleepBlock } from "@/lib/routine/routine";
import { windowFor } from "@/lib/schedule/schedule";

export type Lane = {
  kid: Kid;
  windows: { channel: Channel; window: Window }[];
};

/** One lane per kid with the windows on air that weekday, for the household TV timeline (S11). */
export function tvLanes(household: Household, weekday: Weekday): Lane[] {
  return household.kids.map((kid) => ({
    kid,
    windows: kid.channels.flatMap((channel) => {
      const window = windowFor(channel, weekday);
      return window ? [{ channel, window }] : [];
    }),
  }));
}

export type Overlap = {
  weekday: Weekday;
  a: { kid: Kid; channel: Channel; window: Window };
  b: { kid: Kid; channel: Channel; window: Window };
  /** The overlapping range, in minutes since midnight. */
  start: number;
  end: number;
};

/** Every pair of kids whose windows overlap on the weekday; `a` is the younger kid. */
export function overlapsOn(household: Household, weekday: Weekday): Overlap[] {
  const entries = tvLanes(household, weekday).flatMap((lane) =>
    lane.windows.map((w) => ({ kid: lane.kid, ...w })),
  );
  const out: Overlap[] = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const x = entries[i];
      const y = entries[j];
      if (x.kid.id === y.kid.id) continue;
      const start = Math.max(
        minutesOf(x.window.start),
        minutesOf(y.window.start),
      );
      const end = Math.min(minutesOf(x.window.end), minutesOf(y.window.end));
      if (start >= end) continue;
      const [a, b] = x.kid.birthdate >= y.kid.birthdate ? [x, y] : [y, x];
      out.push({ weekday, a, b, start, end });
    }
  }
  return out;
}

/** A together slot covers the overlap when an acknowledgement names both kids, the day and the range (D17). */
export function isAcknowledged(household: Household, o: Overlap): boolean {
  return household.overlapAcks.some(
    (ack) =>
      ack.kidIds.includes(o.a.kid.id) &&
      ack.kidIds.includes(o.b.kid.id) &&
      ack.days.includes(o.weekday) &&
      minutesOf(ack.start) <= o.start &&
      minutesOf(ack.end) >= o.end,
  );
}

/** Whether a window can move to a new start on a weekday without hitting school, sleep or the small hours. */
export function canPlace(
  kid: Kid,
  weekday: Weekday,
  window: Window,
  newStart: number,
): { ok: true } | { ok: false; reason: string } {
  const length = minutesOf(window.end) - minutesOf(window.start);
  const newEnd = newStart + length;
  if (newStart < 6 * 60)
    return { ok: false, reason: `${kid.name} would be watching before 06:00.` };
  const dayType = dayTypeFor(kid, weekday);
  const away = dayType.blocks.find(
    (b) =>
      b.kind === "away" &&
      minutesOf(b.start) < newEnd &&
      newStart < minutesOf(b.end),
  );
  if (away)
    return {
      ok: false,
      reason: `${kid.name} is at ${away.title.toLowerCase()} then.`,
    };
  const sleep = sleepBlock(dayType);
  if (sleep && newEnd > minutesOf(sleep.start))
    return {
      ok: false,
      reason: `That runs past ${kid.name}'s bedtime at ${sleep.start}.`,
    };
  return { ok: true };
}
