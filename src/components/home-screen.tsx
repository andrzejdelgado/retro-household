"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { TopBar } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useHousehold } from "@/lib/household/provider";
import {
  bracketLabel,
  KID_COLOUR_CLASS,
  kidView,
} from "@/lib/household/kid-view";
import { useNow } from "@/lib/household/use-now";
import { cn } from "@/lib/utils";

const FILL = {
  under: "bg-primary",
  at: "bg-primary",
  over: "bg-warning",
  choice: "bg-muted-foreground/40",
};

/** S04: the household at a glance, one card per kid. */
export function HomeScreen() {
  const { household } = useHousehold();
  const now = useNow();
  if (!household) return null;
  return (
    <>
      <TopBar title={household.name} />
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-6 md:px-6">
        {household.kids.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col gap-4">
              <p>
                Add your first child to get routines, screen time and TV set up
                from best practice for their age.
              </p>
              <Button
                className="h-11 self-start"
                render={<Link href="/kids/new" />}
                nativeButton={false}
              >
                <Plus /> Add a child
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {household.kids.map((kid) => {
              const v = kidView(household, kid, now);
              const pct = v.cap.minutesPerDay
                ? Math.min(100, (v.plannedToday / v.cap.minutesPerDay) * 100)
                : v.plannedToday > 0
                  ? 100
                  : 0;
              return (
                <Link
                  key={kid.id}
                  href={`/kids/${kid.id}`}
                  className="focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-3"
                >
                  <Card className="hover:bg-accent/40 h-full transition-colors">
                    <CardContent className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "size-3 shrink-0 rounded-full",
                            KID_COLOUR_CLASS[kid.colour],
                          )}
                        />
                        <span className="font-heading text-lg">{kid.name}</span>
                        <span className="text-muted-foreground text-sm">
                          Age {v.age} · {bracketLabel(v.bracket)}
                        </span>
                        {v.warnings.length > 0 && (
                          <Badge
                            className="ml-auto tabular-nums"
                            aria-label={`${v.warnings.length} warnings`}
                          >
                            {v.warnings.length}
                          </Badge>
                        )}
                      </div>
                      <Progress
                        value={pct}
                        aria-label={`${kid.name}'s planned screen time today`}
                        className={`[&_[data-slot=progress-indicator]]:${FILL[v.state]}`}
                      />
                      <p className="text-muted-foreground text-sm tabular-nums">
                        {Math.round(v.plannedToday)} of {v.cap.minutesPerDay}{" "}
                        min today
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
        {household.kids.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              className="h-11"
              render={<Link href="/print" />}
              nativeButton={false}
            >
              Print
            </Button>
            <Button
              variant="secondary"
              className="h-11"
              render={<Link href="/schedule" />}
              nativeButton={false}
            >
              TV timeline
            </Button>
          </div>
        )}
      </main>
      {household.kids.length > 0 && (
        <Button
          className="fixed right-4 bottom-20 z-20 h-12 rounded-full px-5 shadow-sm md:absolute md:top-3 md:right-6 md:bottom-auto md:h-9 md:rounded-lg md:px-3"
          render={<Link href="/kids/new" />}
          nativeButton={false}
        >
          <Plus /> Add kid
        </Button>
      )}
    </>
  );
}
