import { MAJOR_RULES } from "@/content";
import { newId, type Household } from "@/lib/model/types";

/** A household as S03 creates it on first run: default name, all nine rules on, default Wi-Fi windows (D35). */
export function emptyHousehold(now: Date = new Date()): Household {
  return {
    id: newId(),
    name: "Home",
    passcode: null,
    rules: MAJOR_RULES.map((r) => ({
      id: newId(),
      ruleId: r.id,
      customText: null,
      enabled: true,
    })),
    // "Work stops at pick-up" and "no phone in the bedroom overnight" (household-major-rules.md).
    wifiOffWindows: [
      {
        days: ["mon", "tue", "wed", "thu", "fri"],
        start: "16:00",
        end: "19:30",
      },
      {
        days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        start: "22:00",
        end: "24:00",
      },
    ],
    settings: { warningsMuted: false, demoClock: null },
    kids: [],
    shows: [],
    viewingLog: [],
    overlapAcks: [],
    dismissals: [],
    updatedAt: now.toISOString(),
  };
}
