import type { RhythmTemplate, TemplateBlock } from "./types";

// best-parctices/household-rhythms.md. Cell text is kept as the block title so the
// content test can find every cell. "Same" cells are resolved against the column to the left.
// The screen slot sits inside the 16:30 to 17:30 window (the file's rule) with the daily cap's
// length (D17); the window's own activity takes the remainder. Under 3 there is no screen block.
// Wind-down runs from 18:30 to the bedtime the file gives; a sleep block anchors the day (D28).

const away = (start: string, end: string, title: string): TemplateBlock => ({
  start,
  end,
  title,
  kind: "away",
});

const weekdayCommon = {
  breakfast: (title: string): TemplateBlock => ({
    start: "06:30",
    end: "07:30",
    title,
    kind: "care",
  }),
  toDaycare: (title: string): TemplateBlock => ({
    start: "07:30",
    end: "08:00",
    title,
    kind: "outdoors",
  }),
  pickUp: (title: string): TemplateBlock => ({
    start: "16:00",
    end: "16:30",
    title,
    kind: "outdoors",
  }),
  dinner: (): TemplateBlock => ({
    start: "17:30",
    end: "18:00",
    title: "Dinner",
    kind: "care",
  }),
  evening: (title: string): TemplateBlock => ({
    start: "18:00",
    end: "18:30",
    title,
    kind: "play",
  }),
  windDown: (bedtime: string, title: string): TemplateBlock[] => [
    { start: "18:30", end: bedtime, title, kind: "care" },
    { start: bedtime, end: "24:00", title: "Sleep", kind: "sleep" },
  ],
};

function afternoon(title: string, screenMinutes: number): TemplateBlock[] {
  if (screenMinutes === 0) {
    return [{ start: "16:30", end: "17:30", title, kind: "play" }];
  }
  const endMinutes = 16 * 60 + 30 + screenMinutes;
  const end = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
  if (end < "17:30") {
    return [
      { start: "16:30", end, title: "TV", kind: "screen" },
      { start: end, end: "17:30", title, kind: "play" },
    ];
  }
  return [
    {
      start: "16:30",
      end,
      title: "TV",
      kind: "screen",
      note: `On days without TV this hour is: ${title}`,
    },
  ];
}

export const RHYTHM_TEMPLATES: RhythmTemplate[] = [
  // Infants set their own rhythm and follow the outdoor row in household-routine-elements.md.
  {
    ages: [0, 1],
    kind: "weekday",
    blocks: [
      {
        start: "10:00",
        end: "11:00",
        title: "Outside, in all weather",
        kind: "outdoors",
        note: "Infants set their own rhythm. Move this to fit the day.",
      },
    ],
    notes: [],
  },
  {
    ages: [0, 1],
    kind: "weekend",
    blocks: [
      {
        start: "10:00",
        end: "11:00",
        title: "Outside, in all weather",
        kind: "outdoors",
        note: "Infants set their own rhythm. Move this to fit the day.",
      },
    ],
    notes: [],
  },
  {
    ages: [1, 3],
    kind: "weekday",
    blocks: [
      weekdayCommon.breakfast("Wake, breakfast"),
      weekdayCommon.toDaycare("Walk or pram to daycare"),
      away("08:00", "16:00", "Daycare"),
      weekdayCommon.pickUp(
        "Pick-up, parent's phone stays in pocket. Home via playground 30 min",
      ),
      ...afternoon("Free play. Parent transition ritual", 0),
      weekdayCommon.dinner(),
      weekdayCommon.evening("Outside or free play"),
      ...weekdayCommon.windDown("19:00", "Wind-down and bed"),
    ],
    notes: [],
  },
  {
    ages: [3, 5],
    kind: "weekday",
    blocks: [
      weekdayCommon.breakfast("Wake, breakfast, child dresses self"),
      weekdayCommon.toDaycare("Walk, bike or scooter"),
      away("08:00", "16:00", "Kindergarten"),
      weekdayCommon.pickUp(
        "Pick-up, parent's phone stays in pocket. Home via playground 30 min",
      ),
      ...afternoon("Free play, chores 10 min", 30),
      weekdayCommon.dinner(),
      weekdayCommon.evening("Outside or free play"),
      ...weekdayCommon.windDown("19:00", "Wind-down and bed from 19:00"),
    ],
    notes: [],
  },
  {
    ages: [5, 7],
    kind: "weekday",
    blocks: [
      weekdayCommon.breakfast(
        "Wake, breakfast, child makes own bed and packs bag",
      ),
      weekdayCommon.toDaycare("Walk or bike, alone from 6 or 7"),
      away("08:00", "16:00", "School"),
      weekdayCommon.pickUp("Home alone or via playground 30 min"),
      ...afternoon("Free play, chores 15 min, reading 15 min", 45),
      weekdayCommon.dinner(),
      weekdayCommon.evening("Outside, game or one-on-one"),
      ...weekdayCommon.windDown("19:30", "Wind-down and bed from 19:30"),
    ],
    notes: [],
  },
  {
    ages: [7, 8],
    kind: "weekday",
    blocks: [
      weekdayCommon.breakfast(
        "Wake, breakfast, child makes own bed and packs bag",
      ),
      weekdayCommon.toDaycare("Walk or bike, alone from 6 or 7"),
      away("08:00", "16:00", "School"),
      weekdayCommon.pickUp("Home alone or via playground 30 min"),
      ...afternoon("Free play, chores 15 min, reading 15 min", 60),
      weekdayCommon.dinner(),
      weekdayCommon.evening("Outside, game or one-on-one"),
      ...weekdayCommon.windDown("19:30", "Wind-down and bed from 19:30"),
    ],
    notes: [],
  },
  {
    ages: [1, 3],
    kind: "weekend",
    blocks: [
      {
        start: "07:30",
        end: "09:30",
        title: "No alarm, breakfast",
        kind: "care",
      },
      {
        start: "09:30",
        end: "12:00",
        title: "Outside: playground, forest, bike",
        kind: "outdoors",
      },
      { start: "12:00", end: "13:00", title: "Lunch at home", kind: "care" },
      { start: "13:00", end: "15:00", title: "Nap", kind: "care" },
      {
        start: "15:00",
        end: "17:00",
        title: "Free play, Saturday cleaning hour with the family",
        kind: "play",
      },
      { start: "17:00", end: "18:00", title: "Dinner", kind: "care" },
      ...weekdayCommon.windDown("19:00", "Wind-down and bed"),
    ],
    notes: [
      "Friday evening: Cosy evening 60 min",
      "One weekend day: Nothing planned by adults",
    ],
  },
  {
    ages: [3, 5],
    kind: "weekend",
    blocks: [
      {
        start: "07:30",
        end: "09:30",
        title: "No alarm, breakfast",
        kind: "care",
      },
      {
        start: "09:30",
        end: "12:00",
        title: "Outside. Sunday nature outing",
        kind: "outdoors",
      },
      { start: "12:00", end: "13:00", title: "Lunch at home", kind: "care" },
      {
        start: "13:00",
        end: "15:00",
        title: "Quiet hour with books",
        kind: "reading",
      },
      {
        start: "15:00",
        end: "16:30",
        title: "Free play, Saturday cleaning hour with the family, peer play",
        kind: "play",
      },
      { start: "16:30", end: "17:00", title: "TV", kind: "screen" },
      { start: "17:00", end: "18:00", title: "Dinner", kind: "care" },
      ...weekdayCommon.windDown("19:00", "Wind-down and bed from 19:00"),
    ],
    notes: [
      "Friday evening: Cosy evening 60 min",
      "One weekend day: Nothing planned by adults",
    ],
  },
  {
    ages: [5, 7],
    kind: "weekend",
    blocks: [
      {
        start: "07:30",
        end: "09:30",
        title: "No alarm, breakfast, reading hour on one morning",
        kind: "care",
      },
      {
        start: "09:30",
        end: "12:00",
        title: "Outside. Sunday hike 2 to 3 h",
        kind: "outdoors",
      },
      { start: "12:00", end: "13:00", title: "Lunch at home", kind: "care" },
      {
        start: "13:00",
        end: "15:00",
        title: "Quiet hour, then free play",
        kind: "play",
      },
      {
        start: "15:00",
        end: "16:30",
        title:
          "Free play, Saturday cleaning hour with the family, peer play, unsupervised outside",
        kind: "play",
      },
      { start: "16:30", end: "17:15", title: "TV", kind: "screen" },
      {
        start: "17:15",
        end: "18:00",
        title: "Dinner, Sunday family meeting 15 min",
        kind: "family",
      },
      ...weekdayCommon.windDown("19:30", "Wind-down and bed from 19:30"),
    ],
    notes: [
      "Friday evening: Cosy evening 60 min, board game",
      "One weekend day: Nothing planned by adults",
    ],
  },
  {
    ages: [7, 8],
    kind: "weekend",
    blocks: [
      {
        start: "07:30",
        end: "09:30",
        title: "No alarm, breakfast, reading hour on one morning",
        kind: "care",
      },
      {
        start: "09:30",
        end: "12:00",
        title: "Outside. Sunday hike 2 to 3 h",
        kind: "outdoors",
      },
      { start: "12:00", end: "13:00", title: "Lunch at home", kind: "care" },
      {
        start: "13:00",
        end: "15:00",
        title: "Quiet hour, then free play",
        kind: "play",
      },
      {
        start: "15:00",
        end: "16:30",
        title:
          "Free play, Saturday cleaning hour with the family, peer play, unsupervised outside",
        kind: "play",
      },
      { start: "16:30", end: "17:30", title: "TV", kind: "screen" },
      {
        start: "17:30",
        end: "18:00",
        title: "Dinner, Sunday family meeting 15 min",
        kind: "family",
      },
      ...weekdayCommon.windDown("19:30", "Wind-down and bed from 19:30"),
    ],
    notes: [
      "Friday evening: Cosy evening 60 min, board game",
      "One weekend day: Nothing planned by adults",
    ],
  },
];
