"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

/** T01: four large dots, a numpad, nothing else. A wrong PIN clears calmly (C4.6). */
export function PinScreen({
  onSubmit,
}: {
  onSubmit: (pin: string) => boolean;
}) {
  const [value, setValue] = React.useState("");
  const [shake, setShake] = React.useState(false);

  const push = React.useCallback(
    (digit: string) => {
      setValue((v) => {
        if (v.length >= 4) return v;
        const next = v + digit;
        if (next.length === 4) {
          // Submit on the fourth digit, after the dot has rendered.
          setTimeout(() => {
            if (!onSubmit(next)) {
              setShake(true);
              setValue("");
              setTimeout(() => setShake(false), 250);
            }
          }, 120);
        }
        return next;
      });
    },
    [onSubmit],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) push(e.key);
      else if (e.key === "Backspace") setValue((v) => v.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [push]);

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-12"
      aria-label="Enter your PIN"
    >
      <div
        className={cn("flex gap-6", shake && "tv-shake")}
        aria-live="polite"
        aria-label={`${value.length} of 4 digits`}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "size-24 rounded-full border-4 transition-colors",
              i < value.length
                ? "bg-foreground border-foreground"
                : "border-muted-foreground/60",
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {KEYS.map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <Button
              key={i}
              variant="secondary"
              className="size-[120px] rounded-2xl text-[40px] focus-visible:ring-4"
              aria-label={k === "⌫" ? "Delete" : k}
              onClick={() =>
                k === "⌫" ? setValue((v) => v.slice(0, -1)) : push(k)
              }
            >
              {k}
            </Button>
          ),
        )}
      </div>
    </main>
  );
}
