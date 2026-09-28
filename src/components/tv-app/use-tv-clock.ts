"use client";

import * as React from "react";
import { resolveNow } from "@/lib/clock/clock";
import { useHousehold } from "@/lib/household/provider";

/**
 * A ticking "now" for the TV: the demo clock, when set, is the moment the TV app opened, and
 * time advances from there, so a mid-show tune-in can be demonstrated (C4.1, C6.1).
 */
export function useTvClock(): Date {
  const { household } = useHousehold();
  const demo = household?.settings.demoClock ?? null;
  const [now, setNow] = React.useState<Date>(() => resolveNow(demo));
  React.useEffect(() => {
    const base = resolveNow(demo).getTime();
    const start = Date.now();
    const id = setInterval(
      () => setNow(new Date(base + (Date.now() - start))),
      1000,
    );
    return () => clearInterval(id);
  }, [demo]);
  return now;
}
