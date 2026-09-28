import { describe, expect, it } from "vitest";
import { bracketFor } from "@/lib/bracket/bracket";
import { seedHousehold } from "./seed";

describe("seedHousehold", () => {
  it("has three kids in the personas' brackets with overlapping TV windows", () => {
    const now = new Date("2026-09-28T12:00:00");
    const h = seedHousehold(now);
    expect(h.kids.map((k) => [k.name, bracketFor(k.birthdate, now)])).toEqual([
      ["Grace", "2-3"],
      ["Henry", "4-5"],
      ["Ella", "7-8"],
    ]);
    expect(h.kids[1].channels[0].windows[0]).toMatchObject({
      start: "16:30",
      end: "17:00",
    });
    expect(h.kids[2].channels[0].windows[0]).toMatchObject({
      start: "16:30",
      end: "17:30",
    });
    expect(h.shows).toHaveLength(4);
  });
});
