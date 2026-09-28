import {
  Blocks,
  BookOpen,
  Footprints,
  Heart,
  Moon,
  School,
  Sparkles,
  Sun,
  TreePine,
  Tv,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { BlockKind } from "@/content";

/** One lucide icon per block kind, for the timeline and the printed page. */
export const KIND_ICONS: Record<BlockKind, LucideIcon> = {
  care: Sun,
  outdoors: TreePine,
  play: Blocks,
  reading: BookOpen,
  chores: Sparkles,
  independence: Footprints,
  emotional: Heart,
  family: Users,
  screen: Tv,
  sleep: Moon,
  away: School,
};

export const KIND_LABELS: Record<BlockKind, string> = {
  care: "Care",
  outdoors: "Outdoors",
  play: "Play",
  reading: "Reading",
  chores: "Chores",
  independence: "Independence",
  emotional: "One-on-one",
  family: "Family",
  screen: "TV",
  sleep: "Sleep",
  away: "Away",
};
