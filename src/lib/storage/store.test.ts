import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { emptyHousehold } from "@/lib/seed/empty";
import { createIndexedDbStore } from "./indexeddb";
import { createMemoryStore } from "./store";

for (const [name, make] of [
  ["memory", createMemoryStore],
  ["indexeddb", createIndexedDbStore],
] as const) {
  describe(`${name} store`, () => {
    it("round-trips a household and a blob, and clears both (C1.3)", async () => {
      const store = make();
      expect(await store.load()).toBeNull();

      const h = emptyHousehold(new Date("2026-09-28T10:00:00"));
      h.kids.push({
        id: "k1",
        name: "Simona",
        birthdate: "2022-03-14",
        pin: null,
        colour: 2,
        week: {
          mon: "wd",
          tue: "wd",
          wed: "wd",
          thu: "wd",
          fri: "wd",
          sat: "we",
          sun: "we",
        },
        dayTypes: [
          { id: "wd", label: "Weekday", blocks: [] },
          { id: "we", label: "Weekend", blocks: [] },
        ],
        allowances: [],
        channels: [],
        firstVisitSeen: false,
      });
      await store.save(h);
      const loaded = await store.load();
      expect(loaded).toEqual(h);
      expect(loaded).not.toBe(h);

      const blob = new Blob(["poster"], { type: "text/plain" });
      await store.putBlob("poster-1", blob);
      expect(await (await store.getBlob("poster-1"))!.text()).toBe("poster");
      await store.deleteBlob("poster-1");
      expect(await store.getBlob("poster-1")).toBeNull();

      await store.clear();
      expect(await store.load()).toBeNull();
    });
  });
}
