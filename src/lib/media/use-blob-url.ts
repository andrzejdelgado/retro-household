"use client";

import * as React from "react";
import { useHousehold } from "@/lib/household/provider";

/** An object URL for a stored blob, revoked when the key changes or the component unmounts. */
export function useBlobUrl(key: string | null): string | null {
  const { store } = useHousehold();
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!key) return;
    let current: string | null = null;
    let cancelled = false;
    store.getBlob(key).then((blob) => {
      if (cancelled || !blob) return;
      current = URL.createObjectURL(blob);
      setUrl(current);
    });
    return () => {
      cancelled = true;
      if (current) URL.revokeObjectURL(current);
      setUrl(null);
    };
  }, [key, store]);
  return url;
}
