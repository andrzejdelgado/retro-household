import {
  getDefaultAllowances,
  getRhythmTemplate,
  type Bracket,
  type DayKind,
  type Practice,
} from "@/content";
import { bracketFor } from "@/lib/bracket/bracket";
import { minutesOf, timeOf, WEEKDAYS, type Weekday } from "@/lib/clock/clock";
import {
  newId,
  type DayType,
  type Kid,
  type RoutineBlock,
} from "@/lib/model/types";

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const WEEK_DAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri"];
const WEEKEND_DAYS: Weekday[] = ["sat", "sun"];

export type Refusal = { refused: string };
export type Result<T> =
  | { ok: true; value: T; removed?: RoutineBlock[] }
  | { ok: false; refused: string };

const sortBlocks = (blocks: RoutineBlock[]) =>
  [...blocks].sort((a, b) => minutesOf(a.start) - minutesOf(b.start));

/** The template's blocks for a bracket and day kind, as fresh routine blocks (D08). */
export function templateBlocks(
  bracket: Bracket,
  kind: DayKind,
): RoutineBlock[] {
  return getRhythmTemplate(bracket, kind).blocks.map((b) => ({
    id: newId(),
    start: b.start,
    end: b.end,
    title: b.title,
    kind: b.kind,
    practiceId: null,
    note: b.note ?? null,
    fromTemplate: true,
  }));
}

export function createKid(
  input: {
    name: string;
    birthdate: string;
    pin: string | null;
    colour: Kid["colour"];
  },
  now: Date,
): Kid {
  const bracket = bracketFor(input.birthdate, now);
  const weekday: DayType = {
    id: newId(),
    label: "Weekday",
    kind: "weekday",
    blocks: templateBlocks(bracket, "weekday"),
  };
  const weekend: DayType = {
    id: newId(),
    label: "Weekend",
    kind: "weekend",
    blocks: templateBlocks(bracket, "weekend"),
  };
  return {
    id: newId(),
    name: input.name,
    birthdate: input.birthdate,
    pin: input.pin,
    colour: input.colour,
    week: {
      mon: weekday.id,
      tue: weekday.id,
      wed: weekday.id,
      thu: weekday.id,
      fri: weekday.id,
      sat: weekend.id,
      sun: weekend.id,
    },
    dayTypes: [weekday, weekend],
    // Allowances start at none; the file's ceiling is shown beside the field (D47).
    allowances: getDefaultAllowances(bracket).map((a) => ({
      tech: a.tech,
      minutesPerDay: 0,
      days: [],
      source: "manual" as const,
    })),
    channels: [],
    firstVisitSeen: false,
  };
}

export function dayTypeFor(kid: Kid, weekday: Weekday): DayType {
  const dt = kid.dayTypes.find((d) => d.id === kid.week[weekday]);
  if (!dt) throw new Error(`${weekday} points at no day type`);
  return dt;
}

/** The weekdays that use a day type, in Monday-first order. */
export function weekdaysOf(kid: Kid, dayTypeId: string): Weekday[] {
  return WEEKDAYS.filter((w) => kid.week[w] === dayTypeId);
}

/** Day types in the order of their first weekday, for the day switcher. */
export function orderedDayTypes(kid: Kid): DayType[] {
  const seen = new Set<string>();
  const out: DayType[] = [];
  for (const w of WEEKDAYS) {
    const id = kid.week[w];
    if (!seen.has(id)) {
      seen.add(id);
      out.push(kid.dayTypes.find((d) => d.id === id)!);
    }
  }
  return out;
}

function dropOrphans(kid: Kid): Kid {
  const used = new Set(Object.values(kid.week));
  return { ...kid, dayTypes: kid.dayTypes.filter((d) => used.has(d.id)) };
}

const cloneBlocks = (blocks: RoutineBlock[]) =>
  blocks.map((b) => ({ ...b, id: newId() }));

/** Split a group so each weekday has its own day type, each a copy of the one it had. */
export function splitDays(kid: Kid, kind: DayKind): Kid {
  const days = kind === "weekday" ? WEEK_DAYS : WEEKEND_DAYS;
  const dayTypes = [...kid.dayTypes];
  const week = { ...kid.week };
  for (const w of days) {
    const source = kid.dayTypes.find((d) => d.id === kid.week[w])!;
    const own: DayType = {
      id: newId(),
      label: WEEKDAY_LABELS[w],
      kind,
      blocks: cloneBlocks(source.blocks),
    };
    dayTypes.push(own);
    week[w] = own.id;
  }
  return dropOrphans({ ...kid, week, dayTypes });
}

/** Point weekdays at one day type so they are one day edited in one place (D29). */
export function copyDayTo(
  kid: Kid,
  sourceDayTypeId: string,
  targets: Weekday[],
): Kid {
  const week = { ...kid.week };
  for (const w of targets) week[w] = sourceDayTypeId;
  const kidNext = dropOrphans({ ...kid, week });
  return relabel(kidNext);
}

/** Merge a group back onto one day type, keeping the first weekday's blocks. */
export function mergeBack(kid: Kid, kind: DayKind): Kid {
  const days = kind === "weekday" ? WEEK_DAYS : WEEKEND_DAYS;
  const keep = kid.week[days[0]];
  return copyDayTo(kid, keep, days);
}

/** Labels follow the weekdays a day type covers: "Weekday", "Weekend", or the day names. */
function relabel(kid: Kid): Kid {
  return {
    ...kid,
    dayTypes: kid.dayTypes.map((d) => {
      const days = weekdaysOf(kid, d.id);
      const all = (group: Weekday[]) =>
        group.every((w) => days.includes(w)) && days.length === group.length;
      const label = all(WEEK_DAYS)
        ? "Weekday"
        : all(WEEKEND_DAYS)
          ? "Weekend"
          : days.map((w) => WEEKDAY_LABELS[w]).join(" · ");
      return { ...d, label };
    }),
  };
}

export function sleepBlock(dayType: DayType): RoutineBlock | null {
  return sortBlocks(dayType.blocks).findLast((b) => b.kind === "sleep") ?? null;
}

export function screenBlock(dayType: DayType): RoutineBlock | null {
  return dayType.blocks.find((b) => b.kind === "screen") ?? null;
}

export function dinnerBlock(dayType: DayType): RoutineBlock | null {
  return dayType.blocks.find((b) => /^dinner/i.test(b.title)) ?? null;
}

/**
 * Edit a block's times, title or note with the ripple rule (D28): an end change moves the next
 * block's start, a start change moves the previous block's end, blocks never overlap, and the
 * sleep block anchors the day; a change that would push past it is refused with the reason.
 */
export function editBlock(
  dayType: DayType,
  blockId: string,
  patch: Partial<Pick<RoutineBlock, "start" | "end" | "title" | "note">>,
): Result<DayType> {
  const blocks = sortBlocks(dayType.blocks);
  const i = blocks.findIndex((b) => b.id === blockId);
  if (i < 0) return { ok: false, refused: "That block no longer exists." };
  const current = blocks[i];
  const start = patch.start ?? current.start;
  const end = patch.end ?? current.end;
  if (minutesOf(end) <= minutesOf(start))
    return { ok: false, refused: "A block needs to end after it starts." };

  const next = blocks.map((b) => ({ ...b }));
  next[i] = {
    ...next[i],
    start,
    end,
    title: patch.title ?? current.title,
    note: patch.note === undefined ? current.note : patch.note,
    fromTemplate: false,
  };

  // Ripple forward (D28): a following block that now overlaps starts where this one ends and
  // shrinks; one swallowed entirely is removed and reported so the parent can undo. The sleep
  // block never moves: pushing into it is refused with the reason.
  const removed: RoutineBlock[] = [];
  for (let j = i + 1; j < next.length; j++) {
    const prev = next[j - 1];
    const b = next[j];
    if (minutesOf(b.start) >= minutesOf(prev.end)) break;
    if (b.kind === "sleep")
      return {
        ok: false,
        refused: `This would push bedtime past ${b.start}. Shorten something first.`,
      };
    if (minutesOf(b.end) <= minutesOf(prev.end)) {
      removed.push(b);
      next.splice(j, 1);
      j -= 1;
      continue;
    }
    next[j] = { ...b, start: prev.end, fromTemplate: false };
  }

  // Ripple backward: the previous block ends where this one starts.
  if (i > 0 && patch.start !== undefined) {
    const prev = next[i - 1];
    if (minutesOf(prev.end) > minutesOf(start)) {
      if (minutesOf(start) <= minutesOf(prev.start))
        return {
          ok: false,
          refused: `There is no room left for "${prev.title}" before this block.`,
        };
      next[i - 1] = { ...prev, end: start, fromTemplate: false };
    }
  }

  return { ok: true, value: { ...dayType, blocks: next }, removed };
}

const DEFAULT_PRACTICE_MINUTES = 15;

/** Add a practice at the first gap that fits, else just before sleep by shortening the last block (S07). */
export function addPractice(
  dayType: DayType,
  practice: Practice,
  minutes = DEFAULT_PRACTICE_MINUTES,
): Result<DayType> {
  const block: Omit<RoutineBlock, "id" | "start" | "end"> = {
    title: practice.title,
    kind: practice.domain,
    practiceId: practice.id,
    note: null,
    fromTemplate: false,
  };
  return addBlock(dayType, block, minutes);
}

export function addBlock(
  dayType: DayType,
  block: Omit<RoutineBlock, "id" | "start" | "end">,
  minutes: number,
): Result<DayType> {
  const blocks = sortBlocks(dayType.blocks);
  let cursor = minutesOf(blocks[0]?.start ?? "06:00");
  for (const b of blocks) {
    if (minutesOf(b.start) - cursor >= minutes) {
      return place(dayType, block, cursor, cursor + minutes);
    }
    cursor = Math.max(cursor, minutesOf(b.end));
  }
  const sleep = sleepBlock(dayType);
  const last = blocks.findLast((b) => b.kind !== "sleep");
  if (
    sleep &&
    last &&
    minutesOf(sleep.start) - minutesOf(last.start) >= minutes * 2
  ) {
    const shortened = blocks.map((b) =>
      b.id === last.id
        ? {
            ...b,
            end: timeOf(minutesOf(sleep.start) - minutes),
            fromTemplate: false,
          }
        : b,
    );
    return place(
      { ...dayType, blocks: shortened },
      block,
      minutesOf(sleep.start) - minutes,
      minutesOf(sleep.start),
    );
  }
  return { ok: false, refused: "The day is full. Shorten a block first." };
}

function place(
  dayType: DayType,
  block: Omit<RoutineBlock, "id" | "start" | "end">,
  start: number,
  end: number,
): Result<DayType> {
  const added: RoutineBlock = {
    ...block,
    id: newId(),
    start: timeOf(start),
    end: timeOf(end),
  };
  return {
    ok: true,
    value: { ...dayType, blocks: sortBlocks([...dayType.blocks, added]) },
  };
}

export function removeBlock(dayType: DayType, blockId: string): DayType {
  return { ...dayType, blocks: dayType.blocks.filter((b) => b.id !== blockId) };
}

/**
 * On a bracket change, untouched template blocks are replaced by the new bracket's template and
 * edited blocks are kept (D08). A template block that would overlap an edited block is dropped.
 */
export function refreshForBracket(kid: Kid, now: Date): Kid {
  const bracket = bracketFor(kid.birthdate, now);
  const overlaps = (a: RoutineBlock, b: RoutineBlock) =>
    minutesOf(a.start) < minutesOf(b.end) &&
    minutesOf(b.start) < minutesOf(a.end);
  return {
    ...kid,
    dayTypes: kid.dayTypes.map((d) => {
      const edited = d.blocks.filter((b) => !b.fromTemplate);
      const fresh = templateBlocks(bracket, d.kind).filter(
        (t) => !edited.some((e) => overlaps(e, t)),
      );
      return { ...d, blocks: sortBlocks([...edited, ...fresh]) };
    }),
    // Allowances are the parent's own choice and are kept across a bracket change (D47).
  };
}

/** Insert a block with explicit times; refused when it overlaps an existing block. */
export function insertBlock(
  dayType: DayType,
  block: Omit<RoutineBlock, "id">,
): Result<DayType> {
  if (minutesOf(block.end) <= minutesOf(block.start))
    return { ok: false, refused: "A block needs to end after it starts." };
  const clash = dayType.blocks.find(
    (b) =>
      minutesOf(b.start) < minutesOf(block.end) &&
      minutesOf(block.start) < minutesOf(b.end),
  );
  if (clash)
    return {
      ok: false,
      refused: `That overlaps "${clash.title}" (${clash.start} to ${clash.end}).`,
    };
  return {
    ok: true,
    value: {
      ...dayType,
      blocks: sortBlocks([...dayType.blocks, { ...block, id: newId() }]),
    },
  };
}

/** The gaps in a day, for the dashed add rows on the timeline. */
export function gapsOf(dayType: DayType): { start: string; end: string }[] {
  const blocks = sortBlocks(dayType.blocks);
  const gaps: { start: string; end: string }[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    if (minutesOf(blocks[i + 1].start) > minutesOf(blocks[i].end))
      gaps.push({ start: blocks[i].end, end: blocks[i + 1].start });
  }
  return gaps;
}
