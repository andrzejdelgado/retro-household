"use client";

import { resolveNow } from "@/lib/clock/clock";
import { useHousehold } from "./provider";

/** "Now" with the household's demo clock applied (S15). */
export function useNow(): Date {
  const { household } = useHousehold();
  return resolveNow(household?.settings.demoClock ?? null);
}
