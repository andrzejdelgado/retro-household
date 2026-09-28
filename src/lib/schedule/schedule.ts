import { getCap, type Bracket } from "@/content";
import { minutesOf, timeOf, weekdayOf, type Weekday } from "@/lib/clock/clock";
import type { Channel, Kid, Show, Window } from "@/lib/model/types";
import { dayTypeFor, screenBlock } from "@/lib/routine/routine";

/** Default on-air days per bracket (docs/log/04-ux-specs.md step 2; PRD key behaviours). */
export function defaultDays(bracket: Bracket): Weekday[] {
  const cap = getCap(bracket);
  if (cap.minutesPerDay === 0) return [];
  if (cap.noConsecutiveDays) return ["mon", "wed", "fri", "sun"];
  if (cap.maxDaysPerWeek === 5) return ["mon", "tue", "wed", "thu", "fri"];
  return ["mon", "tue", "wed", "thu", "fri", "sat"];
}

/**
 * The default window for a new channel: the kid's screen slot start for the length of the daily
 * cap (D17). Null when the kid has no screen block on that day or a zero cap (D27).
 */
export function defaultWindow(kid: Kid, bracket: Bracket): Window | null {
  const days = defaultDays(bracket);
  const cap = getCap(bracket);
  if (days.length === 0 || cap.minutesPerDay === 0) return null;
  const slot = screenBlock(dayTypeFor(kid, days[0]));
  if (!slot) return null;
  const start = minutesOf(slot.start);
  return { days, start: timeOf(start), end: timeOf(start + cap.minutesPerDay) };
}

export function windowFor(channel: Channel, weekday: Weekday): Window | null {
  return channel.windows.find((w) => w.days.includes(weekday)) ?? null;
}

export function programmeFor(channel: Channel, weekday: Weekday): string[] {
  return channel.programmesByDay?.[weekday] ?? channel.programme;
}

export type Placed = { showId: string; startSec: number; endSec: number };
export type Layout = {
  window: Window | null;
  placed: Placed[];
  /** Shows that could not be placed before the window end, in programme order (W10). */
  notPlaced: string[];
  /** Seconds since midnight at which the channel goes off air, or null when there is no window. */
  offAirAtSec: number | null;
};

/** Lay the programme out back to back from the window start; never across the window end (D18). */
export function layout(
  channel: Channel,
  weekday: Weekday,
  shows: Show[],
): Layout {
  const window = windowFor(channel, weekday);
  if (!window)
    return { window: null, placed: [], notPlaced: [], offAirAtSec: null };
  const byId = new Map(shows.map((s) => [s.id, s]));
  const endSec = minutesOf(window.end) * 60;
  let cursor = minutesOf(window.start) * 60;
  const placed: Placed[] = [];
  const notPlaced: string[] = [];
  const ids = programmeFor(channel, weekday);
  for (let i = 0; i < ids.length; i++) {
    const show = byId.get(ids[i]);
    if (!show) continue;
    if (notPlaced.length > 0 || cursor + show.durationSec > endSec) {
      notPlaced.push(show.id);
      continue;
    }
    placed.push({
      showId: show.id,
      startSec: cursor,
      endSec: cursor + show.durationSec,
    });
    cursor += show.durationSec;
  }
  return {
    window,
    placed,
    notPlaced,
    offAirAtSec: placed.at(-1)?.endSec ?? cursor,
  };
}

export type NowPlaying = { showId: string; offsetSec: number } | null;

/** What a channel shows at `now`, and how far in: broadcast semantics (C4.1). */
export function nowPlaying(
  channel: Channel,
  shows: Show[],
  now: Date,
): NowPlaying {
  const { placed } = layout(channel, weekdayOf(now), shows);
  const sec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const hit = placed.find((p) => p.startSec <= sec && sec < p.endSec);
  return hit ? { showId: hit.showId, offsetSec: sec - hit.startSec } : null;
}

/** Planned minutes of one channel on a weekday: the placed shows' durations. */
export function scheduledMinutes(
  channel: Channel,
  weekday: Weekday,
  shows: Show[],
): number {
  const { placed } = layout(channel, weekday, shows);
  return placed.reduce((sum, p) => sum + (p.endSec - p.startSec), 0) / 60;
}
