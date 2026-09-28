import { toIsoDate } from "@/lib/bracket/bracket";
import { newId, type Household, type ViewingEntry } from "@/lib/model/types";

/**
 * Write playing seconds to the host kid and every co-watcher (D16). Seconds extend the open
 * entry for the same kid, channel, show and date so the log stays one row per sitting.
 */
export function logSeconds(
  household: Household,
  input: {
    hostKidId: string;
    coWatcherIds: string[];
    channelId: string;
    showId: string;
    at: Date;
    seconds: number;
  },
): Household {
  const date = toIsoDate(input.at);
  const log = [...household.viewingLog];
  const kids = [
    input.hostKidId,
    ...input.coWatcherIds.filter((id) => id !== input.hostKidId),
  ];
  for (const kidId of kids) {
    const coWatch = kidId !== input.hostKidId;
    const i = log.findIndex(
      (e) =>
        e.kidId === kidId &&
        e.channelId === input.channelId &&
        e.showId === input.showId &&
        e.date === date &&
        e.coWatch === coWatch,
    );
    if (i >= 0) {
      log[i] = { ...log[i], seconds: log[i].seconds + input.seconds };
    } else {
      const entry: ViewingEntry = {
        id: newId(),
        kidId,
        date,
        channelId: input.channelId,
        showId: input.showId,
        startedAt: input.at.toISOString(),
        seconds: input.seconds,
        coWatch,
      };
      log.push(entry);
    }
  }
  return { ...household, viewingLog: log };
}

/** The log for one kid, newest date first, for S08's plain list. */
export function logFor(household: Household, kidId: string): ViewingEntry[] {
  return household.viewingLog
    .filter((e) => e.kidId === kidId)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
