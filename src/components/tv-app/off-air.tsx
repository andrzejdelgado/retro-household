"use client";

/** T04: nothing to watch, nothing to wait for. Wordless, silent, slow; static under reduced motion. */
export function OffAir() {
  return (
    <main
      className="bg-background flex min-h-dvh items-center justify-center overflow-hidden"
      aria-label="Off air"
    >
      <div
        className="tv-off-air size-[30vw] rounded-full"
        style={{ background: "var(--kid, var(--kid-1))", opacity: 0.2 }}
      />
    </main>
  );
}
