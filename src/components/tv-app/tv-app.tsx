"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { budgetLeft } from "@/lib/accumulator/accumulator";
import { minutesOf, weekdayOf } from "@/lib/clock/clock";
import { useHousehold } from "@/lib/household/provider";
import type { Kid } from "@/lib/model/types";
import { nowPlaying } from "@/lib/schedule/schedule";
import { CoWatch } from "./co-watch";
import { OffAir } from "./off-air";
import { PinScreen } from "./pin-screen";
import { Picker } from "./picker";
import { Playback } from "./playback";
import { useTvClock } from "./use-tv-clock";

type Screen =
  | { kind: "pin" }
  | { kind: "picker"; kid: Kid; focus: number }
  | { kind: "channel"; kid: Kid; index: number };

/** The kid-facing TV app (docs/06-screen-specs.md §4): PIN, picker, playback or off-air, co-watch. */
export function TvApp() {
  const { household } = useHousehold();
  const now = useTvClock();
  const [screen, setScreen] = React.useState<Screen>({ kind: "pin" });
  const [coWatchers, setCoWatchers] = React.useState<string[]>([]);
  const [overlay, setOverlay] = React.useState(false);
  const enterRef = React.useRef<(k: Kid, index: number) => void>(() => {});

  // Escape always returns to the PIN screen; arrows switch channels on playback and off-air (D26).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (screen.kind === "channel") setOverlay((o) => !o);
        return;
      }
      if (overlay) return;
      if (e.key === "Escape") {
        setScreen({ kind: "pin" });
        setCoWatchers([]);
        return;
      }
      if (screen.kind === "picker") {
        const n = screen.kid.channels.length;
        if (n === 0) return;
        if (e.key === "ArrowRight")
          setScreen({ ...screen, focus: (screen.focus + 1) % n });
        if (e.key === "ArrowLeft")
          setScreen({ ...screen, focus: (screen.focus + n - 1) % n });
        if (e.key === "Enter")
          setScreen({ kind: "channel", kid: screen.kid, index: screen.focus });
      } else if (screen.kind === "channel") {
        const n = screen.kid.channels.length;
        if (e.key === "ArrowRight")
          setScreen({ ...screen, index: (screen.index + 1) % n });
        if (e.key === "ArrowLeft")
          setScreen({ ...screen, index: (screen.index + n - 1) % n });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, overlay]);

  // Entering a channel inside an acknowledged overlap opens the overlay once with the other kids on (D33).
  const enterChannel = (k: Kid, index: number) => {
    setScreen({ kind: "channel", kid: k, index });
    const weekday = weekdayOf(now);
    const minutes = now.getHours() * 60 + now.getMinutes();
    const ack = (household?.overlapAcks ?? []).find(
      (a) =>
        a.kidIds.includes(k.id) &&
        a.days.includes(weekday) &&
        minutesOf(a.start) <= minutes &&
        minutes < minutesOf(a.end),
    );
    if (ack) {
      setCoWatchers(ack.kidIds.filter((id) => id !== k.id));
      setOverlay(true);
    }
  };

  React.useEffect(() => {
    enterRef.current = enterChannel;
  });

  if (!household) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </main>
    );
  }

  // The signed-in kid, always read fresh from the household so budgets and channels stay current.
  const kid =
    screen.kind === "pin"
      ? null
      : (household.kids.find((k) => k.id === screen.kid.id) ?? null);
  const colour = kid ? `var(--kid-${kid.colour})` : undefined;

  const submitPin = (pin: string) => {
    const match = household.kids.find((k) => k.pin === pin);
    if (!match) return false;
    setScreen({ kind: "picker", kid: match, focus: 0 });
    return true;
  };

  let body: React.ReactNode;
  if (screen.kind === "pin" || !kid) {
    body = <PinScreen onSubmit={submitPin} />;
  } else if (screen.kind === "picker") {
    body = (
      <Picker
        kid={kid}
        shows={household.shows}
        now={now}
        focus={screen.focus}
        onSelect={(i) => enterChannel(kid, i)}
      />
    );
  } else {
    const channel = kid.channels[screen.index] ?? kid.channels[0];
    const playing = channel ? nowPlaying(channel, household.shows, now) : null;
    const budget = budgetLeft(kid, household.viewingLog, now);
    const onAir = Boolean(playing) && !budget.spent;
    body =
      onAir && channel && playing ? (
        <Playback
          kid={kid}
          channel={channel}
          playing={playing}
          shows={household.shows}
          coWatchers={coWatchers}
          now={now}
        />
      ) : (
        <OffAir />
      );
  }

  return (
    <div
      className="min-h-dvh"
      style={colour ? ({ "--kid": colour } as React.CSSProperties) : undefined}
    >
      {body}
      {kid && screen.kind === "channel" && (
        <CoWatch
          open={overlay}
          onOpenChange={setOverlay}
          host={kid}
          kids={household.kids}
          value={coWatchers}
          onChange={setCoWatchers}
          now={now}
        />
      )}
    </div>
  );
}
