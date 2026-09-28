"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { WarningCard } from "@/components/warning-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { WEEKDAYS } from "@/lib/clock/clock";
import { useHousehold } from "@/lib/household/provider";
import {
  formatMinutes,
  KID_COLOUR_CLASS,
  kidView,
  type BudgetState,
} from "@/lib/household/kid-view";
import { useNow } from "@/lib/household/use-now";
import type { Kid } from "@/lib/model/types";
import { WEEKDAY_LABELS } from "@/lib/routine/routine";
import { cn } from "@/lib/utils";

const FILL: Record<BudgetState, string> = {
  under: "bg-primary",
  at: "bg-primary",
  over: "bg-warning",
  choice: "bg-muted-foreground/40",
};

function useView(kid: Kid) {
  const { household } = useHousehold();
  const now = useNow();
  return kidView(household!, kid, now);
}

function Numbers({
  kid,
  view,
}: {
  kid: Kid;
  view: ReturnType<typeof kidView>;
}) {
  const pct = view.cap.minutesPerDay
    ? Math.min(100, (view.plannedToday / view.cap.minutesPerDay) * 100)
    : view.plannedToday > 0
      ? 100
      : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm tabular-nums">
        <span
          className={cn(
            "size-3 shrink-0 rounded-full",
            KID_COLOUR_CLASS[kid.colour],
          )}
        />
        <span className="font-medium">{kid.name}</span>
        <span className="text-muted-foreground">
          Today {Math.round(view.plannedToday)} of {view.cap.minutesPerDay} min
        </span>
        <span className="text-muted-foreground ml-auto">
          Week {formatMinutes(view.week.total)} of{" "}
          {formatMinutes(view.cap.minutesPerWeek)}
        </span>
      </div>
      <Progress
        value={pct}
        aria-label={`${kid.name}'s planned screen time today`}
        className={`[&_[data-slot=progress-indicator]]:${FILL[view.state]}`}
      />
    </div>
  );
}

/** The breakdown per weekday and every warning for the kid: the one place they appear together. */
export function BudgetDetails({ kid }: { kid: Kid }) {
  const view = useView(kid);
  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableBody>
          {WEEKDAYS.map((w) => (
            <TableRow key={w}>
              <TableCell className="w-28">{WEEKDAY_LABELS[w]}</TableCell>
              <TableCell className="tabular-nums">
                {Math.round(view.week.perDay[w])} min
              </TableCell>
              <TableCell className="w-full">
                <Progress
                  value={
                    view.cap.minutesPerDay
                      ? Math.min(
                          100,
                          (view.week.perDay[w] / view.cap.minutesPerDay) * 100,
                        )
                      : view.week.perDay[w] > 0
                        ? 100
                        : 0
                  }
                  aria-label={`${WEEKDAY_LABELS[w]} planned minutes`}
                  className={`[&_[data-slot=progress-indicator]]:${
                    view.week.perDay[w] > view.cap.minutesPerDay
                      ? "bg-warning"
                      : "bg-primary"
                  }`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-muted-foreground text-sm tabular-nums">
        {formatMinutes(view.week.total)} of{" "}
        {formatMinutes(view.cap.minutesPerWeek)} a week · {view.week.daysUsed}{" "}
        of {view.cap.maxDaysPerWeek} days
      </p>
      {view.warnings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {view.warnings.map((w) => (
            <WarningCard key={w.key} warning={w} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Nothing needs your attention.
        </p>
      )}
    </div>
  );
}

/** Mobile: the bar pinned above the tab bar, opening a drawer (design system §3). */
export function BudgetBar({ kid }: { kid: Kid }) {
  const view = useView(kid);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-card fixed inset-x-0 bottom-14 z-20 border-t px-4 py-2 text-left md:hidden"
        aria-label="Open the screen-time breakdown"
      >
        <Numbers kid={kid} view={view} />
      </button>
      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle>{kid.name}&apos;s week</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <BudgetDetails kid={kid} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

/** Desktop: the same content as a card in the right column, always in view. */
export function BudgetCard({ kid }: { kid: Kid }) {
  const view = useView(kid);
  const mobile = useIsMobile();
  if (mobile) return null;
  return (
    <Card className="hidden md:block">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Screen time</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Numbers kid={kid} view={view} />
        <BudgetDetails kid={kid} />
      </CardContent>
    </Card>
  );
}
