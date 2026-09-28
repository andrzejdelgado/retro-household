import { describe, expect, it } from "vitest";
import { seedHousehold } from "@/lib/seed/seed";
import { loggedMinutesOn } from "@/lib/accumulator/accumulator";
import { logFor, logSeconds } from "./viewing";

describe("viewing log (C4.5)", () => {
  it("logs the same seconds to the host and every co-watcher, marked as co-watch", () => {
    const now = new Date("2026-09-28T16:40:00");
    let h = seedHousehold(now);
    const [grace, henry] = h.kids;
    const channel = henry.channels[0];
    const at = {
      hostKidId: henry.id,
      coWatcherIds: [],
      channelId: channel.id,
      showId: channel.programme[0],
      at: now,
    };
    h = logSeconds(h, { ...at, seconds: 60 });
    h = logSeconds(h, { ...at, coWatcherIds: [grace.id], seconds: 120 });
    expect(loggedMinutesOn(h.viewingLog, henry.id, "2026-09-28")).toBe(3);
    expect(loggedMinutesOn(h.viewingLog, grace.id, "2026-09-28")).toBe(2);
    expect(logFor(h, grace.id)).toHaveLength(1);
    expect(logFor(h, grace.id)[0].coWatch).toBe(true);
    expect(logFor(h, henry.id)[0].coWatch).toBe(false);
  });
});
