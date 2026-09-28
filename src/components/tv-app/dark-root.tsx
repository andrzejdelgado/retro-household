"use client";

import * as React from "react";

/** The TV app is dark end to end: dialogs portal to the body, so the class goes on the root while mounted. */
export function DarkRoot({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);
  return <>{children}</>;
}
