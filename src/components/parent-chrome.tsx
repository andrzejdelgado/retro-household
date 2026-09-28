"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar, BottomNav } from "@/components/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useHousehold } from "@/lib/household/provider";
import { isUnlocked } from "@/lib/household/unlock";
import { useNow } from "@/lib/household/use-now";
import { sweepBirthdays } from "@/lib/routine/routine";
import { cn } from "@/lib/utils";

/**
 * The parent app's frame: the passcode gate (D40), the sidebar or bottom nav, and the demo clock
 * banner (S15). On first run, S03 has no nav and no back (D36).
 */
export function ParentChrome({ children }: { children: React.ReactNode }) {
  const { status, household, update } = useHousehold();
  const router = useRouter();
  const pathname = usePathname();
  const now = useNow();

  // Birthdays: untouched template blocks follow the new bracket, edited ones stay (D08, C6.1).
  const sweepKey = household
    ? household.kids.map((k) => `${k.id}:${k.templateBracket}`).join(",")
    : "";
  React.useEffect(() => {
    if (!household) return;
    if (sweepBirthdays(household, now) !== household)
      update((h) => sweepBirthdays(h, now));
    // `now` is read once per household or clock change on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sweepKey, household?.settings.demoClock, update]);
  const needsPasscode =
    status === "ready" &&
    (!household || (household.passcode !== null && !isUnlocked()));

  React.useEffect(() => {
    if (needsPasscode) router.replace("/passcode");
  }, [needsPasscode, router]);

  if (status === "loading" || needsPasscode || !household) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const firstRun = household.kids.length === 0 && pathname === "/kids/new";
  return (
    <TooltipProvider>
      <SidebarProvider>
        {!firstRun && <AppSidebar />}
        <SidebarInset className={cn(!firstRun && "pb-16 md:pb-0")}>
          <DemoClockBanner />
          {children}
        </SidebarInset>
        {!firstRun && <BottomNav />}
      </SidebarProvider>
    </TooltipProvider>
  );
}

function DemoClockBanner() {
  const { household } = useHousehold();
  const now = useNow();
  if (!household?.settings.demoClock) return null;
  const text = now.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <Alert className="rounded-none border-x-0 border-t-0">
      <AlertDescription>Demo clock: {text}</AlertDescription>
    </Alert>
  );
}
