import { DarkRoot } from "@/components/tv-app/dark-root";
import { HouseholdProvider } from "@/lib/household/provider";

// The TV app: dark, full screen, no parent chrome (docs/06-screen-specs.md §4).
export default function TvLayout({ children }: LayoutProps<"/tv">) {
  return (
    <HouseholdProvider>
      <DarkRoot>
        <div className="dark bg-background text-foreground min-h-dvh">
          {children}
        </div>
      </DarkRoot>
    </HouseholdProvider>
  );
}
