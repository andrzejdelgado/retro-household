"use client";

import * as React from "react";
import type { Household } from "@/lib/model/types";
import { createIndexedDbStore } from "@/lib/storage/indexeddb";
import type { HouseholdStore } from "@/lib/storage/store";

type State =
  | { status: "loading"; household: null }
  | { status: "ready"; household: Household | null };

type Context = State & {
  /** Change the household through a pure function; the result is saved at once. */
  update: (mutate: (h: Household) => Household) => void;
  /** Replace the household wholesale (first run, seed, reset). */
  replace: (household: Household | null) => Promise<void>;
  store: HouseholdStore;
};

const HouseholdContext = React.createContext<Context | null>(null);

export function HouseholdProvider({
  children,
  store: given,
}: {
  children: React.ReactNode;
  store?: HouseholdStore;
}) {
  const store = React.useMemo(() => given ?? createIndexedDbStore(), [given]);
  const [state, setState] = React.useState<State>({
    status: "loading",
    household: null,
  });

  React.useEffect(() => {
    let cancelled = false;
    store.load().then((household) => {
      if (!cancelled) setState({ status: "ready", household });
    });
    return () => {
      cancelled = true;
    };
  }, [store]);

  const update = React.useCallback<Context["update"]>(
    (mutate) => {
      setState((s) => {
        if (s.status !== "ready" || !s.household) return s;
        const next = {
          ...mutate(s.household),
          updatedAt: new Date().toISOString(),
        };
        void store.save(next);
        return { status: "ready", household: next };
      });
    },
    [store],
  );

  const replace = React.useCallback<Context["replace"]>(
    async (household) => {
      if (household) await store.save(household);
      else await store.clear();
      setState({ status: "ready", household });
    },
    [store],
  );

  const value = React.useMemo(
    () => ({ ...state, update, replace, store }),
    [state, update, replace, store],
  );
  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold(): Context {
  const ctx = React.useContext(HouseholdContext);
  if (!ctx) throw new Error("useHousehold needs a HouseholdProvider");
  return ctx;
}
