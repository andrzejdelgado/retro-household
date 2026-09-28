import type { Household } from "@/lib/model/types";

/** The seam between the app and where data lives (D05). Swappable for a home server later. */
export interface HouseholdStore {
  load(): Promise<Household | null>;
  save(household: Household): Promise<void>;
  putBlob(key: string, blob: Blob): Promise<void>;
  getBlob(key: string): Promise<Blob | null>;
  deleteBlob(key: string): Promise<void>;
  clear(): Promise<void>;
}

/** In-memory store for tests and server rendering. */
export function createMemoryStore(): HouseholdStore {
  let household: Household | null = null;
  const blobs = new Map<string, Blob>();
  return {
    async load() {
      return household ? structuredClone(household) : null;
    },
    async save(h) {
      household = structuredClone(h);
    },
    async putBlob(key, blob) {
      blobs.set(key, blob);
    },
    async getBlob(key) {
      return blobs.get(key) ?? null;
    },
    async deleteBlob(key) {
      blobs.delete(key);
    },
    async clear() {
      household = null;
      blobs.clear();
    },
  };
}
