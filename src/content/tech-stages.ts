import type { Tech } from "./types";

const source = "household-tech-access-stages.md";

// best-parctices/household-tech-access-stages.md, one entry per "### " section.
// Row text is kept exactly as written so the content test can compare it with the file.
export const TECHS: Tech[] = [
  {
    id: "videoCalls",
    title: "Video calls",
    intro: "With known people, on a parent's device.",
    rows: [
      {
        ages: [0, 1],
        depth: "Parent holds the device, known family only",
        duration: "10 min per call, up to 3 a week",
      },
      {
        ages: [1, 3],
        depth: "Same, child may talk and show things",
        duration: "15 min per call, up to 4 a week",
      },
      {
        ages: [3, 8],
        depth: "Child may start the call with a parent in the room",
        duration: "20 min per call, up to 5 a week",
      },
    ],
    later: [{ what: "Independent calls", opensAt: 12 }],
    source,
  },
  {
    id: "audio",
    title: "Screen-free audio",
    intro:
      "Music, stories, audiobooks, an offline player with no mic or internet.",
    rows: [
      {
        ages: [0, 2],
        depth: "Music and sung stories, chosen by parent, room speaker only",
        duration:
          "30 min of recorded audio a day plus live singing, no headphones",
      },
      {
        ages: [2, 3],
        depth: "Story recordings, parent present for first listens",
        duration: "30 min a day, no headphones",
      },
      {
        ages: [3, 5],
        depth: "Own offline player, child chooses from a parent-loaded library",
        duration:
          "45 min a day, bedtime story allowed on top, volume-limited headphones for travel only",
      },
      {
        ages: [5, 8],
        depth:
          "Adds podcasts pre-listened by a parent, audiobooks of any length",
        duration:
          "60 min a day plus bedtime, up to 2 new titles a month added by parent",
      },
    ],
    later: [],
    source,
  },
  {
    id: "longform",
    title: "Watching long-form media",
    intro: "Films, series, documentaries, on a TV in a common room, no feeds.",
    countsAs: "longform",
    rows: [
      { ages: [0, 3], depth: "No access", duration: "0" },
      {
        ages: [3, 5],
        depth:
          "Slow-paced, ad-free, offline, parent pre-watched, parent watching alongside for the whole session",
        duration:
          "20 min per session, 30 min a day, 2 h a week, never two days in a row",
        allowance: { minutesPerDay: 30, daysPerWeek: 4 },
      },
      {
        ages: [5, 7],
        depth:
          "Parent-chosen library, parent in the room for at least half, one episode per sitting, ends when the episode ends",
        duration:
          "45 min a day, 4 h a week. One film of up to 90 min a week replaces that day's and part of the week's budget",
        allowance: { minutesPerDay: 45, daysPerWeek: 5 },
      },
      {
        ages: [7, 8],
        depth:
          "Child picks from a parent-curated list of about 20 titles, parent nearby",
        duration:
          "60 min a day, 5 h a week, one film up to 2 h a week, cinema up to once a month",
        allowance: { minutesPerDay: 60, daysPerWeek: 6 },
      },
    ],
    later: [
      { what: "Live TV with ads, streaming home page browsing", opensAt: 10 },
    ],
    source,
  },
  {
    id: "shortform",
    title: "Short-form and algorithmic video",
    intro: "YouTube, YouTube Kids, Shorts, TikTok, Reels.",
    rows: [
      {
        ages: [0, 8],
        depth:
          "No access. If one specific YouTube video is needed, the parent downloads it, plays it on the TV, and it counts as long-form",
        duration: "0",
      },
    ],
    later: [
      { what: "YouTube with recommendations", opensAt: 13 },
      { what: "TikTok, Reels, Shorts", opensAt: 16 },
    ],
    source,
  },
  {
    id: "tabletPhone",
    title: "Tablet and mobile phone",
    intro: "Treated as one category.",
    rows: [
      {
        ages: [0, 8],
        depth:
          "No personal or shared device. A parent's phone is used only for video calls as above",
        duration: "0",
      },
    ],
    later: [
      {
        what: "Basic phone, calls and texts with a parent-set contact list",
        opensAt: 11,
      },
      { what: "Smartphone or tablet with internet", opensAt: 14 },
    ],
    source,
  },
  {
    id: "games",
    title: "Games",
    intro:
      "Retro consoles such as NES or SNES, or their offline re-releases, on a TV in a common room.",
    countsAs: "games",
    rows: [
      {
        ages: [0, 6],
        depth: "No digital games. Board games, cards, physical play",
        duration: "0",
      },
      {
        ages: [6, 7],
        depth:
          "Offline, single-player, retro titles only, no chat, no ads, no purchases, no reward timers, parent has played it first",
        duration:
          "20 min per session, 3 sessions a week, counted in the screen budget",
        allowance: { minutesPerDay: 20, daysPerWeek: 3 },
      },
      {
        ages: [7, 8],
        depth: "Same. Titles added at most 1 a month",
        duration:
          "30 min per session, 3 sessions a week, counted in the screen budget",
        allowance: { minutesPerDay: 30, daysPerWeek: 3 },
      },
    ],
    later: [
      {
        what: "Modern consoles, handhelds, mobile games, local multiplayer",
        opensAt: 10,
      },
      {
        what: "Online multiplayer, in-game chat, Roblox, Fortnite, Minecraft servers",
        opensAt: 13,
      },
      { what: "Loot boxes, gacha, in-game currency", opensAt: null },
    ],
    source,
  },
  {
    id: "browsing",
    title: "Internet browsing and search",
    intro: "",
    rows: [
      {
        ages: [0, 8],
        depth:
          "No access. Questions the child asks are answered from books or by the parent looking it up alone",
        duration: "0",
      },
    ],
    later: [
      {
        what: "With a parent, for a specific question the child asked, kid-safe search engine, parent types, parent reads results aloud",
        opensAt: 8,
      },
      { what: "Independent browsing", opensAt: 12 },
    ],
    source,
  },
  {
    id: "voiceAssistants",
    title: "Voice assistants and smart speakers",
    intro: "",
    rows: [
      {
        ages: [0, 16],
        depth:
          "No access. No device in the child's spaces. Household devices muted when the child is present, and the child does not address them",
        duration: "0",
      },
    ],
    later: [{ what: "Voice assistants and smart speakers", opensAt: 16 }],
    source,
  },
  {
    id: "ai",
    title: "AI chatbots, companions, and generative tools",
    intro: "",
    rows: [
      {
        ages: [0, 12],
        depth: "No access. The child does not see a parent use one either",
        duration: "0",
      },
    ],
    later: [
      { what: "Supervised tool use for schoolwork", opensAt: 12 },
      { what: "AI companions and character chatbots", opensAt: null },
    ],
    source,
  },
  {
    id: "connectedToys",
    title: "AI and connected toys",
    intro: "Anything with a microphone, camera, or cloud connection.",
    rows: [
      {
        ages: [0, 8],
        depth:
          "No access. Offline audio players without a mic are the allowed alternative",
        duration: "0",
      },
    ],
    later: [],
    source,
  },
  {
    id: "camera",
    title: "Camera",
    intro: "A simple offline camera, no phone.",
    rows: [
      { ages: [0, 5], depth: "No access", duration: "0" },
      {
        ages: [5, 8],
        depth:
          "Basic offline camera, no editing apps, photos viewed on the camera or printed, nothing uploaded",
        duration:
          "Unlimited outdoors, not counted as screen time, 10 min a day reviewing shots",
      },
    ],
    later: [],
    source,
  },
  {
    id: "smartwatch",
    title: "Kids' smartwatch",
    intro: "",
    rows: [{ ages: [0, 8], depth: "No access", duration: "0" }],
    later: [
      {
        what: "Only if the child travels alone. Calls and location with a parent-set contact list, no games, no camera, no internet, no messaging, worn only for the journey",
        opensAt: 8,
      },
    ],
    source,
  },
  {
    id: "messaging",
    title: "Messaging and group chats",
    intro: "",
    rows: [
      {
        ages: [0, 8],
        depth:
          "No access. Messages to family go through the parent's phone with the parent typing",
        duration: "0",
      },
    ],
    later: [
      {
        what: "Own messaging with known contacts, parent can read",
        opensAt: 12,
      },
      { what: "Group chats, class chats", opensAt: 13 },
    ],
    source,
  },
  {
    id: "social",
    title: "Social media",
    intro: "",
    rows: [{ ages: [0, 8], depth: "No access", duration: "0" }],
    later: [
      {
        what: "Any platform with a feed, followers, or public profile",
        opensAt: 16,
      },
    ],
    source,
  },
  {
    id: "schoolDevices",
    title: "School devices and educational apps",
    intro: "",
    countsAs: "schoolApps",
    rows: [
      {
        ages: [0, 6],
        depth:
          "Parents ask nursery and preschool for a no-individual-screens policy and opt the child out where possible",
        duration: "0 at home",
      },
      {
        ages: [6, 8],
        depth:
          "Whatever school mandates in class. At home, only apps the school requires, on a parent's laptop in a common room, no gamified learning apps, paper alternatives requested",
        duration: "20 min a day at home, counted in the screen budget",
        allowance: { minutesPerDay: 20, daysPerWeek: 5 },
      },
    ],
    later: [],
    source,
  },
  {
    id: "footprint",
    title: "The child's digital footprint",
    intro: "What parents do, from birth.",
    rows: [
      {
        ages: [0, 8],
        depth:
          "No public posting of face, name, school, or location. Family sharing only through private channels. No accounts created in the child's name. No cloud cameras or connected monitors in the child's room. From age 5, the child is asked before a photo is shared with anyone",
        duration: "",
      },
    ],
    later: [],
    source,
  },
];
