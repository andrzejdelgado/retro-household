import { getCap, getDefaultAllowances, type CountableTech } from "@/content";
import {
  plannedMinutes,
  plannedWeek,
  loggedMinutesOn,
} from "@/lib/accumulator/accumulator";
import { ageOn, bracketFor } from "@/lib/bracket/bracket";
import { minutesOf, timeOf, WEEKDAYS, type Weekday } from "@/lib/clock/clock";
import {
  canPlace,
  isAcknowledged,
  overlapsOn,
  type Overlap,
} from "@/lib/conflicts/conflicts";
import {
  newId,
  type Channel,
  type Household,
  type Kid,
  type Window,
} from "@/lib/model/types";
import {
  WEEKDAY_LABELS,
  dayTypeFor,
  dinnerBlock,
  sleepBlock,
} from "@/lib/routine/routine";
import {
  defaultDays,
  layout,
  programmeFor,
  windowFor,
} from "@/lib/schedule/schedule";

export type WarningCode =
  | "W01"
  | "W02"
  | "W03"
  | "W04"
  | "W05"
  | "W06"
  | "W07"
  | "W08"
  | "W09"
  | "W10"
  | "W11"
  | "W12";

export type Fix = {
  id: string;
  label: string;
  /** Set when the fix cannot apply, with the reason shown beside it (S11). */
  disabled?: string;
  apply: (household: Household) => Household;
};

export type Warning = {
  code: WarningCode;
  /** `code:subject`, the dismissal key (docs/05-domain-model.md Dismissal). */
  key: string;
  kidId: string | null;
  channelId: string | null;
  weekday: Weekday | null;
  message: string;
  fixes: Fix[];
};

const TECH_LABEL: Record<CountableTech, string> = {
  longform: "television",
  games: "games",
  schoolApps: "school apps",
};

const day = (w: Weekday) => WEEKDAY_LABELS[w];
const len = (w: Window) => minutesOf(w.end) - minutesOf(w.start);

function updateKid(
  h: Household,
  kidId: string,
  fn: (k: Kid) => Kid,
): Household {
  return { ...h, kids: h.kids.map((k) => (k.id === kidId ? fn(k) : k)) };
}

function updateChannel(
  h: Household,
  kidId: string,
  channelId: string,
  fn: (c: Channel) => Channel,
): Household {
  return updateKid(h, kidId, (k) => ({
    ...k,
    channels: k.channels.map((c) => (c.id === channelId ? fn(c) : c)),
  }));
}

function setWindow(
  c: Channel,
  weekday: Weekday,
  fn: (w: Window) => Window,
): Channel {
  return {
    ...c,
    windows: c.windows.map((w) => (w.days.includes(weekday) ? fn(w) : w)),
  };
}

export function dismiss(h: Household, key: string): Household {
  return h.dismissals.includes(key)
    ? h
    : { ...h, dismissals: [...h.dismissals, key] };
}

/** Every warning in the household, before dismissals and the global mute (D14). */
export function deriveWarnings(h: Household, now: Date): Warning[] {
  const out: Warning[] = [];
  for (const kid of h.kids) out.push(...kidWarnings(h, kid, now));
  for (const w of WEEKDAYS) {
    for (const o of overlapsOn(h, w))
      if (!isAcknowledged(h, o)) out.push(overlapWarning(h, o));
  }
  return out;
}

/** Warnings after dismissals and the global mute; the numbers elsewhere are unaffected (D14, D37). */
export function visibleWarnings(h: Household, now: Date): Warning[] {
  if (h.settings.warningsMuted) return [];
  return deriveWarnings(h, now).filter((w) => !h.dismissals.includes(w.key));
}

export function isDismissed(h: Household, key: string): boolean {
  return h.dismissals.includes(key);
}

function kidWarnings(h: Household, kid: Kid, now: Date): Warning[] {
  const out: Warning[] = [];
  const bracket = bracketFor(kid.birthdate, now);
  const cap = getCap(bracket);
  const age = ageOn(kid.birthdate, now);
  const week = plannedWeek(kid, h.shows);

  // W05 not-yet-open: channels for a zero cap, allowances for a closed technology.
  if (cap.minutesPerDay === 0) {
    for (const c of kid.channels) {
      const key = `W05:${kid.id}:${c.id}`;
      out.push({
        code: "W05",
        key,
        kidId: kid.id,
        channelId: c.id,
        weekday: null,
        message: `${kid.name} is ${age}. The recommended screen time under 3 is none. Anything scheduled here counts as overage from the first minute.`,
        fixes: [
          {
            id: "remove",
            label: "Remove the channel",
            apply: (hh) =>
              updateKid(hh, kid.id, (k) => ({
                ...k,
                channels: k.channels.filter((x) => x.id !== c.id),
              })),
          },
          { id: "keep", label: "Keep it", apply: (hh) => dismiss(hh, key) },
        ],
      });
    }
  }
  const defaults = getDefaultAllowances(bracket);
  for (const a of kid.allowances) {
    const def = defaults.find((d) => d.tech === a.tech);
    if (
      a.tech !== "longform" &&
      def?.minutesPerDay === 0 &&
      a.minutesPerDay > 0
    ) {
      const key = `W05:${kid.id}:${a.tech}`;
      out.push({
        code: "W05",
        key,
        kidId: kid.id,
        channelId: null,
        weekday: null,
        message: `${kid.name} is ${age}. ${capitalise(TECH_LABEL[a.tech])} are not recommended before they open. These minutes count as overage.`,
        fixes: [
          {
            id: "zero",
            label: "Set to 0",
            apply: (hh) =>
              updateKid(hh, kid.id, (k) => ({
                ...k,
                allowances: k.allowances.map((x) =>
                  x.tech === a.tech
                    ? { ...x, minutesPerDay: 0, daysPerWeek: 0 }
                    : x,
                ),
              })),
          },
          { id: "keep", label: "Keep it", apply: (hh) => dismiss(hh, key) },
        ],
      });
    }
  }

  if (cap.minutesPerDay > 0) {
    // W01 daily cap, per weekday.
    for (const w of WEEKDAYS) {
      const planned = plannedMinutes(kid, w, h.shows);
      if (planned <= cap.minutesPerDay) continue;
      const excess = planned - cap.minutesPerDay;
      const fixes: Fix[] = [];
      const channelsOn = kid.channels.filter((c) => windowFor(c, w));
      if (channelsOn.some((c) => len(windowFor(c, w)!) > cap.minutesPerDay)) {
        fixes.push({
          id: "shorten",
          label: "Shorten the window to fit",
          apply: (hh) =>
            updateKid(hh, kid.id, (k) => ({
              ...k,
              channels: k.channels.map((c) =>
                setWindow(c, w, (win) =>
                  len(win) > cap.minutesPerDay
                    ? {
                        ...win,
                        end: timeOf(minutesOf(win.start) + cap.minutesPerDay),
                      }
                    : win,
                ),
              ),
            })),
        });
      }
      const withShows = channelsOn.find(
        (c) => layout(c, w, h.shows).placed.length > 0,
      );
      if (withShows) {
        const last = layout(withShows, w, h.shows).placed.at(-1)!.showId;
        fixes.push({
          id: "remove-last",
          label: "Remove the last show of the day",
          apply: (hh) =>
            updateChannel(hh, kid.id, withShows.id, (c) =>
              removeShow(c, w, last),
            ),
        });
      }
      if (
        kid.allowances.some((a) => a.tech !== "longform" && a.minutesPerDay > 0)
      ) {
        fixes.push({
          id: "reduce",
          label: "Reduce the allowance to fit",
          apply: (hh) =>
            updateKid(hh, kid.id, (k) => {
              let left = excess;
              return {
                ...k,
                allowances: k.allowances.map((a) => {
                  if (a.tech === "longform" || left <= 0) return a;
                  const cut = Math.min(a.minutesPerDay, left);
                  left -= cut;
                  return { ...a, minutesPerDay: a.minutesPerDay - cut };
                }),
              };
            }),
        });
      }
      out.push({
        code: "W01",
        key: `W01:${kid.id}:${w}`,
        kidId: kid.id,
        channelId: null,
        weekday: w,
        message: `${kid.name} would have ${planned} minutes on ${day(w)}. The recommended ceiling at ${age} is ${cap.minutesPerDay}.`,
        fixes,
      });
    }

    // W02 weekly cap.
    if (week.total > cap.minutesPerWeek) {
      const ratio = cap.minutesPerWeek / week.total;
      out.push({
        code: "W02",
        key: `W02:${kid.id}`,
        kidId: kid.id,
        channelId: null,
        weekday: null,
        message: `${kid.name} would have ${Math.round(week.total)} minutes a week. The recommended ceiling at ${age} is ${cap.minutesPerWeek}.`,
        fixes: [
          {
            id: "drop-day",
            label: "Take one day off the channel",
            apply: (hh) => dropLightestDay(hh, kid, h),
          },
          {
            id: "scale",
            label: "Shorten every window proportionally",
            apply: (hh) =>
              updateKid(hh, kid.id, (k) => ({
                ...k,
                channels: k.channels.map((c) => ({
                  ...c,
                  windows: c.windows.map((win) => ({
                    ...win,
                    end: timeOf(
                      minutesOf(win.start) +
                        Math.max(5, Math.floor((len(win) * ratio) / 5) * 5),
                    ),
                  })),
                })),
              })),
          },
        ],
      });
    }

    // W03 too many days.
    if (week.daysUsed > cap.maxDaysPerWeek) {
      out.push({
        code: "W03",
        key: `W03:${kid.id}`,
        kidId: kid.id,
        channelId: null,
        weekday: null,
        message: `${kid.name} would have screen time on ${week.daysUsed} days. At ${age} the recommendation is at most ${cap.maxDaysPerWeek} a week.`,
        fixes: [
          {
            id: "drop-day",
            label: "Turn off the day with the fewest minutes",
            apply: (hh) => dropLightestDay(hh, kid, h),
          },
          {
            id: "recommended-days",
            label: "Use the recommended days",
            apply: (hh) => setAllDays(hh, kid, defaultDays(bracket)),
          },
        ],
      });
    }

    // W04 consecutive days.
    if (cap.noConsecutiveDays && week.consecutiveTvPairs.length > 0) {
      const [first, second] = week.consecutiveTvPairs[0];
      out.push({
        code: "W04",
        key: `W04:${kid.id}`,
        kidId: kid.id,
        channelId: null,
        weekday: null,
        message: `${kid.name} would watch on ${day(first)} and ${day(second)} in a row. At ${age} the recommendation is never two days in a row.`,
        fixes: [
          {
            id: "recommended-days",
            label: "Use Monday, Wednesday, Friday and Sunday",
            apply: (hh) => setAllDays(hh, kid, ["mon", "wed", "fri", "sun"]),
          },
          {
            id: "drop-second",
            label: `Turn off ${day(second)}`,
            apply: (hh) => removeDay(hh, kid, second),
          },
        ],
      });
    }
  }

  // W06, W07, W08 per channel window; W10, W11 per channel weekday.
  for (const c of kid.channels) {
    for (const win of c.windows) {
      const first = win.days[0];
      if (!first) continue;
      const dt = dayTypeFor(kid, first);
      const dinner = dinnerBlock(dt);
      const dinnerStart = dinner ? minutesOf(dinner.start) : 18 * 60;
      const sleep = sleepBlock(dt);
      const away = dt.blocks.find(
        (b) =>
          b.kind === "away" &&
          minutesOf(b.start) < minutesOf(win.end) &&
          minutesOf(win.start) < minutesOf(b.end),
      );
      const shift = (newStart: number) => (hh: Household) =>
        updateChannel(hh, kid.id, c.id, (ch) =>
          setWindow(ch, first, (x) => ({
            ...x,
            start: timeOf(newStart),
            end: timeOf(newStart + len(x)),
          })),
        );
      const shorten = (newEnd: number) => (hh: Household) =>
        updateChannel(hh, kid.id, c.id, (ch) =>
          setWindow(ch, first, (x) => ({ ...x, end: timeOf(newEnd) })),
        );

      if (away) {
        out.push({
          code: "W08",
          key: `W08:${kid.id}:${c.id}`,
          kidId: kid.id,
          channelId: c.id,
          weekday: first,
          message: `${kid.name} is at ${away.title.toLowerCase()} until ${away.end} on ${day(first)}. The channel would be on air with nobody home.`,
          fixes: [
            {
              id: "after",
              label: `Start when ${away.title.toLowerCase()} ends`,
              apply: shift(minutesOf(away.end)),
            },
          ],
        });
      } else if (sleep && minutesOf(win.end) > minutesOf(sleep.start)) {
        out.push({
          code: "W07",
          key: `W07:${kid.id}:${c.id}`,
          kidId: kid.id,
          channelId: c.id,
          weekday: first,
          message: `The channel would run past ${kid.name}'s bedtime at ${sleep.start}. Screens in the hour before sleep cost the night.`,
          fixes: [
            {
              id: "earlier",
              label: "Move earlier",
              apply: shift(minutesOf(sleep.start) - 60 - len(win)),
            },
            {
              id: "shorten",
              label: `Shorten to end at ${sleep.start}`,
              apply: shorten(minutesOf(sleep.start)),
            },
          ],
        });
      } else if (minutesOf(win.end) > dinnerStart) {
        out.push({
          code: "W06",
          key: `W06:${kid.id}:${c.id}`,
          kidId: kid.id,
          channelId: c.id,
          weekday: first,
          message: `The channel would run into dinner at ${timeOf(dinnerStart)} on ${day(first)}. The rhythm keeps screens before dinner, never after.`,
          fixes: [
            {
              id: "earlier",
              label: "Move earlier to end at dinner",
              apply: shift(dinnerStart - len(win)),
            },
            ...(minutesOf(win.start) < dinnerStart
              ? [
                  {
                    id: "shorten",
                    label: "Shorten to end at dinner",
                    apply: shorten(dinnerStart),
                  },
                ]
              : []),
          ],
        });
      }
    }

    for (const w of WEEKDAYS) {
      if (!windowFor(c, w)) continue;
      const l = layout(c, w, h.shows);
      const ids = programmeFor(c, w);
      if (ids.length === 0) {
        const donor = WEEKDAYS.find(
          (d) => d !== w && windowFor(c, d) && programmeFor(c, d).length > 0,
        );
        out.push({
          code: "W11",
          key: `W11:${c.id}:${w}`,
          kidId: kid.id,
          channelId: c.id,
          weekday: w,
          message: `${c.name} is on air on ${day(w)} with nothing to play. ${kid.name} would tune in to an empty channel.`,
          fixes: [
            ...(donor
              ? [
                  {
                    id: "copy",
                    label: `Copy ${day(donor)}'s programme`,
                    apply: (hh: Household) =>
                      updateChannel(hh, kid.id, c.id, (ch) => ({
                        ...ch,
                        programmesByDay: {
                          ...(ch.programmesByDay ?? {}),
                          [w]: programmeFor(ch, donor),
                        },
                      })),
                  },
                ]
              : []),
            {
              id: "remove-day",
              label: `Remove ${day(w)} from the window`,
              apply: (hh) => removeDay(hh, kid, w, c.id),
            },
          ],
        });
      } else if (l.notPlaced.length > 0) {
        const show = h.shows.find((s) => s.id === l.notPlaced[0]);
        const needed = Math.ceil(
          (l.notPlaced.reduce(
            (s, id) => s + (h.shows.find((x) => x.id === id)?.durationSec ?? 0),
            0,
          ) +
            (l.offAirAtSec ?? 0) -
            minutesOf(l.window!.end) * 60) /
            60,
        );
        out.push({
          code: "W10",
          key: `W10:${c.id}:${w}`,
          kidId: kid.id,
          channelId: c.id,
          weekday: w,
          message: `"${show?.title ?? "A show"}" would be cut by the end of the window on ${day(w)}. A programme never ends mid-episode.`,
          fixes: [
            {
              id: "remove",
              label: `Remove "${show?.title ?? "the show"}"`,
              apply: (hh) =>
                updateChannel(hh, kid.id, c.id, (ch) =>
                  removeShow(ch, w, l.notPlaced[0]),
                ),
            },
            {
              id: "extend",
              label: `Extend the window by ${needed} minutes`,
              apply: (hh) =>
                updateChannel(hh, kid.id, c.id, (ch) =>
                  setWindow(ch, w, (x) => ({
                    ...x,
                    end: timeOf(minutesOf(x.end) + needed),
                  })),
                ),
            },
          ],
        });
      }
    }
  }

  // W12 co-watch or plain overage, informational, per logged date.
  const dates = [
    ...new Set(
      h.viewingLog.filter((e) => e.kidId === kid.id).map((e) => e.date),
    ),
  ];
  for (const date of dates) {
    const minutes = loggedMinutesOn(h.viewingLog, kid.id, date);
    if (minutes > cap.minutesPerDay) {
      out.push({
        code: "W12",
        key: `W12:${kid.id}:${date}`,
        kidId: kid.id,
        channelId: null,
        weekday: null,
        message: `${kid.name} watched ${Math.round(minutes)} minutes on ${date}, over the recommended ${cap.minutesPerDay}.`,
        fixes: [],
      });
    }
  }

  return out;
}

function overlapWarning(h: Household, o: Overlap): Warning {
  const younger = o.a;
  const older = o.b;
  const earlierStart = minutesOf(younger.window.start) - 60;
  const earlier = canPlace(
    younger.kid,
    o.weekday,
    younger.window,
    earlierStart,
  );
  const key = `W09:${o.weekday}:${younger.kid.id}:${older.kid.id}`;
  return {
    code: "W09",
    key,
    kidId: null,
    channelId: null,
    weekday: o.weekday,
    message: `On ${day(o.weekday)} ${younger.kid.name} and ${older.kid.name} both have the TV from ${timeOf(o.start)} to ${timeOf(o.end)}. There is one television.`,
    fixes: [
      {
        id: "stagger",
        label: `Move ${older.kid.name} to start when ${younger.kid.name} finishes`,
        apply: (hh) =>
          updateChannel(hh, older.kid.id, older.channel.id, (c) =>
            setWindow(c, o.weekday, (w) => {
              const start = minutesOf(younger.window.end);
              return {
                ...w,
                start: timeOf(start),
                end: timeOf(start + len(w)),
              };
            }),
          ),
      },
      {
        id: "earlier",
        label: `Move ${younger.kid.name} an hour earlier`,
        disabled: earlier.ok ? undefined : earlier.reason,
        apply: (hh) =>
          updateChannel(hh, younger.kid.id, younger.channel.id, (c) =>
            setWindow(c, o.weekday, (w) => ({
              ...w,
              start: timeOf(earlierStart),
              end: timeOf(earlierStart + len(w)),
            })),
          ),
      },
      {
        id: "together",
        label: "Mark as together time",
        apply: (hh) => ({
          ...hh,
          overlapAcks: [
            ...hh.overlapAcks,
            {
              id: newId(),
              kidIds: [younger.kid.id, older.kid.id],
              days: [o.weekday],
              start: timeOf(o.start),
              end: timeOf(o.end),
            },
          ],
        }),
      },
    ],
  };
}

function removeShow(c: Channel, weekday: Weekday, showId: string): Channel {
  if (c.programmesByDay?.[weekday]) {
    return {
      ...c,
      programmesByDay: {
        ...c.programmesByDay,
        [weekday]: c.programmesByDay[weekday]!.filter((id) => id !== showId),
      },
    };
  }
  return { ...c, programme: c.programme.filter((id) => id !== showId) };
}

function setAllDays(hh: Household, kid: Kid, days: Weekday[]): Household {
  return updateKid(hh, kid.id, (k) => ({
    ...k,
    channels: k.channels.map((c) => ({
      ...c,
      windows: c.windows.map((w) => ({ ...w, days })),
    })),
  }));
}

function removeDay(
  hh: Household,
  kid: Kid,
  weekday: Weekday,
  channelId?: string,
): Household {
  return updateKid(hh, kid.id, (k) => ({
    ...k,
    channels: k.channels.map((c) =>
      channelId && c.id !== channelId
        ? c
        : {
            ...c,
            windows: c.windows.map((w) => ({
              ...w,
              days: w.days.filter((d) => d !== weekday),
            })),
          },
    ),
  }));
}

function dropLightestDay(hh: Household, kid: Kid, h: Household): Household {
  const used = WEEKDAYS.filter((w) => plannedMinutes(kid, w, h.shows) > 0);
  const lightest = used.sort(
    (x, y) => plannedMinutes(kid, x, h.shows) - plannedMinutes(kid, y, h.shows),
  )[0];
  return lightest ? removeDay(hh, kid, lightest) : hh;
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
