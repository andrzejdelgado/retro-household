// Vocabulary from docs/05-domain-model.md §2. Content is derived from best-parctices/*.md
// at build time; the markdown files are never read at runtime (D24).

export const BRACKETS = [
  "0-1",
  "1-2",
  "2-3",
  "3-4",
  "4-5",
  "5-6",
  "6-7",
  "7-8",
] as const;
export type Bracket = (typeof BRACKETS)[number];

export type DayKind = "weekday" | "weekend";

export type Cap = {
  minutesPerDay: number;
  minutesPerWeek: number;
  maxDaysPerWeek: number;
  noConsecutiveDays: boolean;
};

export type TechId =
  | "videoCalls"
  | "audio"
  | "longform"
  | "shortform"
  | "tabletPhone"
  | "games"
  | "browsing"
  | "voiceAssistants"
  | "ai"
  | "connectedToys"
  | "camera"
  | "smartwatch"
  | "messaging"
  | "social"
  | "schoolDevices"
  | "footprint";

/** Technologies whose minutes count towards the screen budget (D13). */
export type CountableTech = "longform" | "games" | "schoolApps";

export type TechStageRow = {
  /** Inclusive lower age, exclusive upper age, as in the file ("3 to 5"). */
  ages: [number, number];
  depth: string;
  duration: string;
  /** Defaults for the allowance record when this technology counts. */
  allowance?: { minutesPerDay: number; daysPerWeek: number };
};

export type TechLater = {
  what: string;
  /** Age at which it opens, or null for "no access in childhood". */
  opensAt: number | null;
};

export type Tech = {
  id: TechId;
  title: string;
  intro: string;
  rows: TechStageRow[];
  later: TechLater[];
  countsAs?: CountableTech;
  source: string;
};

export type Domain =
  | "outdoors"
  | "play"
  | "reading"
  | "chores"
  | "independence"
  | "emotional"
  | "family";

export type Practice = {
  id: string;
  domain: Domain;
  ages: [number, number];
  /** The first sentence of the file's row; the tile title. */
  title: string;
  /** The whole row text as written. */
  detail: string;
  duration: string;
  why: string;
  source: string;
};

export type BlockKind =
  | "care"
  | "outdoors"
  | "play"
  | "reading"
  | "chores"
  | "independence"
  | "emotional"
  | "family"
  | "screen"
  | "sleep"
  | "away";

export type TemplateBlock = {
  start: string;
  end: string;
  title: string;
  kind: BlockKind;
  note?: string;
};

export type RhythmTemplate = {
  ages: [number, number];
  kind: DayKind;
  blocks: TemplateBlock[];
  /** Weekly rituals from the file that are not time blocks. */
  notes: string[];
};

export type MajorRule = {
  id: string;
  title: string;
  detail: string;
  source: string;
};

export type Source = {
  title: string;
  url: string;
  usedBy: string[];
};
