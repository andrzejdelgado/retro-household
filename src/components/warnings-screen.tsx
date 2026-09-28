"use client";

import Link from "next/link";
import { TopBar } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WarningCard } from "@/components/warning-card";
import { useHousehold } from "@/lib/household/provider";
import { KID_COLOUR_CLASS } from "@/lib/household/kid-view";
import { useNow } from "@/lib/household/use-now";
import { visibleWarnings, type Warning } from "@/lib/warnings/warnings";
import { cn } from "@/lib/utils";

function owningScreen(w: Warning): string | null {
  if (w.code === "W09") return "/schedule";
  if (!w.kidId) return null;
  if (w.channelId) return `/kids/${w.kidId}/channels`;
  return `/kids/${w.kidId}/screen-time`;
}

/** S17: every active warning in the household, grouped by kid, then household-level (D41). */
export function WarningsScreen() {
  const { household } = useHousehold();
  const now = useNow();
  if (!household) return null;
  const warnings = visibleWarnings(household, now);
  const groups = [
    ...household.kids.map((kid) => ({
      key: kid.id,
      title: kid.name,
      colour: kid.colour,
      items: warnings.filter((w) => w.kidId === kid.id),
    })),
    {
      key: "household",
      title: "Household",
      colour: null,
      items: warnings.filter((w) => !w.kidId),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <>
      <TopBar title="Warnings" />
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-6 md:px-6">
        {household.settings.warningsMuted && (
          <p className="text-muted-foreground text-sm">
            All warnings are hidden in Settings. Budgets are still shown.
          </p>
        )}
        {groups.length === 0 ? (
          <p className="text-muted-foreground">Nothing needs your attention.</p>
        ) : (
          groups.map((g, i) => (
            <section key={g.key} className="flex flex-col gap-3">
              {i > 0 && <Separator />}
              <h2 className="font-heading flex items-center gap-2 text-lg">
                {g.colour && (
                  <span
                    className={cn(
                      "size-3 rounded-full",
                      KID_COLOUR_CLASS[g.colour],
                    )}
                  />
                )}
                {g.title}
              </h2>
              {g.items.map((w) => {
                const href = owningScreen(w);
                return (
                  <div key={w.key} className="flex flex-col gap-1">
                    <WarningCard warning={w} primaryFirst />
                    {href && (
                      <Button
                        variant="link"
                        className="h-11 self-start px-1"
                        render={<Link href={href} />}
                        nativeButton={false}
                      >
                        Open
                      </Button>
                    )}
                  </div>
                );
              })}
            </section>
          ))
        )}
      </main>
    </>
  );
}
