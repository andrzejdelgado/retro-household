import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Household } from "@/lib/model/types";
import type { HouseholdStore } from "./store";

interface Schema extends DBSchema {
  household: { key: string; value: Household };
  blobs: { key: string; value: Blob };
}

const DB_NAME = "retro-household";
const CURRENT = "current";

function open(): Promise<IDBPDatabase<Schema>> {
  return openDB<Schema>(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore("household");
      db.createObjectStore("blobs");
    },
  });
}

/** The browser store: one household record and a blob store for videos and posters (D18). */
export function createIndexedDbStore(): HouseholdStore {
  // Opened on first use, never at construction, so server rendering can build the store safely.
  let dbPromise: Promise<IDBPDatabase<Schema>> | null = null;
  const db = () => (dbPromise ??= open());
  return {
    async load() {
      return (await (await db()).get("household", CURRENT)) ?? null;
    },
    async save(household) {
      await (await db()).put("household", household, CURRENT);
    },
    async putBlob(key, blob) {
      await (await db()).put("blobs", blob, key);
    },
    async getBlob(key) {
      return (await (await db()).get("blobs", key)) ?? null;
    },
    async deleteBlob(key) {
      await (await db()).delete("blobs", key);
    },
    async clear() {
      const d = await db();
      await d.clear("household");
      await d.clear("blobs");
    },
  };
}
