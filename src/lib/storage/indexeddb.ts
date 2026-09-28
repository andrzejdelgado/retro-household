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
  const dbPromise = open();
  return {
    async load() {
      return (await (await dbPromise).get("household", CURRENT)) ?? null;
    },
    async save(household) {
      await (await dbPromise).put("household", household, CURRENT);
    },
    async putBlob(key, blob) {
      await (await dbPromise).put("blobs", blob, key);
    },
    async getBlob(key) {
      return (await (await dbPromise).get("blobs", key)) ?? null;
    },
    async deleteBlob(key) {
      await (await dbPromise).delete("blobs", key);
    },
    async clear() {
      const db = await dbPromise;
      await db.clear("household");
      await db.clear("blobs");
    },
  };
}
