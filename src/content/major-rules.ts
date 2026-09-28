import type { MajorRule } from "./types";

const source = "household-major-rules.md";

// best-parctices/household-major-rules.md, the nine bullets, title = the bold part.
export const MAJOR_RULES: MajorRule[] = [
  {
    id: "phones-in-drawer",
    title: "Phones go in a drawer",
    detail:
      "from pick-up until the child's bedtime on weekdays and during every meal at weekends. Parents check them in three fixed 10-minute slots. No phone in the bedroom overnight. No phone in hand while a child is speaking.",
    source,
  },
  {
    id: "work-stops",
    title: "Work stops at pick-up.",
    detail:
      "No email or laptop between pick-up and bedtime. The laptop lives out of sight.",
    source,
  },
  {
    id: "no-tv-focal-point",
    title: "No television as the focal point",
    detail:
      "of the living room, and never on in the background. Music is fine.",
    source,
  },
  {
    id: "parents-read",
    title: "Parents read where the child can see",
    detail:
      "for 15 min a day, and go outside when bored rather than reach for a screen.",
    source,
  },
  {
    id: "adults-sleep",
    title: "Adults sleep 7 hours",
    detail:
      "and protect it. Parental stress and exhaustion predict worse child outcomes more reliably than most screen measures.",
    source,
  },
  {
    id: "home-for-independence",
    title: "The home is set up for the child's independence.",
    detail:
      "Hooks, shelves and toys at child height. Outdoor gear by the door in every season. Art supplies and books reachable without asking.",
    source,
  },
  {
    id: "one-on-one",
    title: "One-on-one time is per child and per parent.",
    detail: "Siblings do not share it.",
    source,
  },
  {
    id: "same-rules",
    title: "Both parents run the same rules.",
    detail:
      "Disagreements are settled away from the child, and the stricter reading holds until the monthly review.",
    source,
  },
  {
    id: "monthly-review",
    title: "Monthly review",
    detail:
      ", on the same day as the stages review: outdoor hours, whether the boredom rule held, whether chores and one-on-one time actually happened, and the child's mood and play.",
    source,
  },
];
