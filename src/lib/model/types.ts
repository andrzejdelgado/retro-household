// Stored entities, docs/05-domain-model.md §1. Everything lives in the browser (D05).
import type { BlockKind, CountableTech } from "@/content";
import type { Weekday } from "@/lib/clock/clock";

export type Id = string;

export type Household = {
  id: Id;
  name: string;
  passcode: string | null;
  rules: HouseholdRule[];
  wifiOffWindows: Window[];
  settings: { warningsMuted: boolean; demoClock: string | null };
  kids: Kid[];
  shows: Show[];
  viewingLog: ViewingEntry[];
  overlapAcks: OverlapAck[];
  /** `code:subject` keys of dismissed warnings. */
  dismissals: string[];
  updatedAt: string;
};

export type HouseholdRule = {
  id: Id;
  /** A major rule's id from the content, or null for a custom rule. */
  ruleId: string | null;
  customText: string | null;
  enabled: boolean;
};

export type Kid = {
  id: Id;
  name: string;
  birthdate: string;
  pin: string | null;
  colour: 1 | 2 | 3 | 4 | 5 | 6;
  week: Record<Weekday, Id>;
  dayTypes: DayType[];
  allowances: Allowance[];
  channels: Channel[];
  firstVisitSeen: boolean;
};

export type DayType = {
  id: Id;
  label: string;
  blocks: RoutineBlock[];
};

export type RoutineBlock = {
  id: Id;
  start: string;
  end: string;
  title: string;
  kind: BlockKind;
  practiceId: string | null;
  note: string | null;
  /** True while the block is still the untouched template default (D08). */
  fromTemplate: boolean;
};

export type Allowance = {
  tech: CountableTech;
  minutesPerDay: number;
  daysPerWeek: number;
  source: "manual" | "device";
};

export type Window = {
  days: Weekday[];
  start: string;
  end: string;
};

export type Channel = {
  id: Id;
  name: string;
  icon: string;
  windows: Window[];
  /** The programme that plays on every day of the window (D30). */
  programme: Id[];
  /** Set only when the parent varies by day; replaces `programme` for listed days. */
  programmesByDay: Partial<Record<Weekday, Id[]>> | null;
};

export type ShowCategory =
  "stories" | "films" | "nature" | "music" | "learning" | "family" | "other";

export type Show = {
  id: Id;
  title: string;
  durationSec: number;
  fileKey: string | null;
  posterKey: string | null;
  category: ShowCategory;
  ages: [number, number];
  addedAt: string;
};

export type ViewingEntry = {
  id: Id;
  kidId: Id;
  date: string;
  channelId: Id;
  showId: Id;
  startedAt: string;
  seconds: number;
  coWatch: boolean;
};

export type OverlapAck = {
  id: Id;
  kidIds: Id[];
  days: Weekday[];
  start: string;
  end: string;
};

export function newId(): Id {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}
