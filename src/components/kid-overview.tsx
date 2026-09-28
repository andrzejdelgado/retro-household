"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TopBar } from "@/components/app-shell";
import { BudgetBar, BudgetCard } from "@/components/budget-bar";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTechStages } from "@/content";
import { useHousehold } from "@/lib/household/provider";
import {
  bracketLabel,
  KID_COLOUR_CLASS,
  kidView,
} from "@/lib/household/kid-view";
import { useNow } from "@/lib/household/use-now";
import { orderedDayTypes } from "@/lib/routine/routine";
import { cn } from "@/lib/utils";

/** S05: the hub for one kid. */
export function KidOverview({ id }: { id: string }) {
  const { household, update } = useHousehold();
  const now = useNow();
  const kid = household?.kids.find((k) => k.id === id);
  if (!household) return null;
  if (!kid) {
    return (
      <>
        <TopBar title="Not found" />
        <main className="mx-auto w-full max-w-[720px] px-4 py-6 md:px-6">
          <p className="text-muted-foreground">
            There is no child with that id.
          </p>
          <Button
            variant="link"
            render={<Link href="/" />}
            nativeButton={false}
          >
            Back to home
          </Button>
        </main>
      </>
    );
  }
  const v = kidView(household, kid, now);
  const dayTypes = orderedDayTypes(kid);
  const openTechs = getTechStages(v.bracket)
    .filter(({ tech, row }) => tech.countsAs && row?.allowance)
    .map(({ tech }) =>
      tech.title
        .toLowerCase()
        .replace("watching long-form media", "television"),
    );
  const under3 = v.cap.minutesPerDay === 0;

  const sections = [
    {
      href: `/kids/${kid.id}/routine`,
      title: "Routine",
      line: dayTypes
        .map((d) => `${d.label} (${d.blocks.length} blocks)`)
        .join(" · "),
    },
    {
      href: `/kids/${kid.id}/screen-time`,
      title: "Screen time",
      line: under3
        ? "No screen time is recommended under 3."
        : `Today ${Math.round(v.plannedToday)} of ${v.cap.minutesPerDay} min · open now: ${openTechs.join(", ") || "nothing"}`,
    },
    {
      href: `/kids/${kid.id}/channels`,
      title: "TV channels",
      line:
        kid.channels.length > 0
          ? kid.channels.map((c) => c.name).join(" · ")
          : under3
            ? "No screen time is recommended under 3. You can still add a channel; the app will show what it means."
            : "No channels yet.",
    },
    {
      href: `/print?kid=${kid.id}`,
      title: "Print",
      line: `${dayTypes.map((d) => d.label).join(", ")} and the rules page`,
    },
  ];

  return (
    <>
      <TopBar title={kid.name} />
      <main className="mx-auto w-full max-w-[1080px] px-4 py-6 md:grid md:grid-cols-[minmax(0,720px)_320px] md:gap-6 md:px-6">
        <div className="flex flex-col gap-4 pb-20 md:pb-0">
          <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              className={cn(
                "size-3 rounded-full",
                KID_COLOUR_CLASS[kid.colour],
              )}
            />
            <span className="text-muted-foreground text-sm">
              Age {v.age} · {bracketLabel(v.bracket)}
              {v.beyondScope && " · the last bracket"}
            </span>
            <span className="text-muted-foreground text-sm">
              {kid.pin ? `PIN ${kid.pin}` : "No PIN yet"}
            </span>
            <Button
              variant="link"
              className="h-11 px-1"
              render={<Link href={`/kids/${kid.id}/edit`} />}
              nativeButton={false}
            >
              Edit
            </Button>
          </header>
          {!kid.firstVisitSeen && (
            <Alert>
              <AlertDescription>
                Set up from recommended practice for age {v.age}. Change
                anything.
              </AlertDescription>
              <AlertAction>
                <Button
                  variant="ghost"
                  className="h-11"
                  onClick={() =>
                    update((h) => ({
                      ...h,
                      kids: h.kids.map((k) =>
                        k.id === kid.id ? { ...k, firstVisitSeen: true } : k,
                      ),
                    }))
                  }
                >
                  Got it
                </Button>
              </AlertAction>
            </Alert>
          )}
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-3"
            >
              <Card className="hover:bg-accent/40 transition-colors">
                <CardContent className="flex items-center gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-heading text-lg">{s.title}</span>
                    <span className="text-muted-foreground truncate text-sm">
                      {s.line}
                    </span>
                  </div>
                  <ChevronRight className="text-muted-foreground size-5 shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <BudgetCard kid={kid} />
      </main>
      <BudgetBar kid={kid} />
    </>
  );
}
