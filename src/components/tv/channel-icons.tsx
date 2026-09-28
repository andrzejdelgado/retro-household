import {
  BookOpen,
  Car,
  Cat,
  Film,
  Fish,
  Leaf,
  Music,
  Palette,
  Puzzle,
  Rocket,
  Star,
  Sun,
  type LucideIcon,
} from "lucide-react";

/** The twelve simple glyphs a parent can pick for a channel (S10). */
export const CHANNEL_ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  film: Film,
  leaf: Leaf,
  music: Music,
  star: Star,
  sun: Sun,
  rocket: Rocket,
  fish: Fish,
  cat: Cat,
  car: Car,
  palette: Palette,
  puzzle: Puzzle,
};

export function ChannelIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = CHANNEL_ICONS[icon] ?? Star;
  return <Icon className={className} aria-hidden />;
}
