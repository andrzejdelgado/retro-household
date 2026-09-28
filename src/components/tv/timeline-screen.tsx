"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarningCard } from "@/components/warning-card";
import {
  minutesOf,
  timeOf,
  WEEKDAYS,
  weekdayOf,
  type Weekday,
} from "@/lib/clock/clock";
import {
  overlapsOn,
  tvLanes,
  isAcknowledged,
  type Lane,
} from "@/lib/conflicts/conflicts";
import { useHousehold } from "@/lib/household/provider";
import { KID_COLOUR_CLASS } from "@/lib/household/kid-view";
import { useNow } from "@/lib/household/use-now";
import type { Kid } from "@/lib/model/types";
import {
  dayTypeFor,
  dinnerBlock,
  sleepBlock,
  WEEKDAY_LABELS,
} from "@/lib/routine/routine";
import { visibleWarnings } from "@/lib/warnings/warnings";
import { cn } from "@/lib/utils";
import { ChannelIcon } from "./channel-icons";

const DEFAULT_START = 15 * 60;
const DEFAULT_END = 20 * 60;

/** Routine regions a proposal must respect, drawn hatched behind the lane (S11). */
function regionsFor(
  kid: Kid,
  weekday: Weekday,
): { start: number; end: number; title: string }[] {
  const dt = dayTypeFor(kid, weekday);
  const out: { start: number; end: number; title: string }[] = [];
  for (const b of dt.blocks) {
    if (b.kind === "away")
      out.push({
        start: minutesOf(b.start),
        end: minutesOf(b.end),
        title: b.title,
      });
  }
  const dinner = dinnerBlock(dt);
  if (dinner)
    out.push({
      start: minutesOf(dinner.start),
      end: minutesOf(dinner.end),
      title: "Dinner",
    });
  const sleep = sleepBlock(dt);
  if (sleep)
    out.push({
      start: minutesOf(sleep.start),
      end: minutesOf(sleep.end),
      title: "Sleep",
    });
  return out;
}

/** S11: resolve conflicts on the one household TV (D17, D32, D44). */
export function TimelineScreen() {
  const { household } = useHousehold();
  const now = useNow();
  const [weekday, setWeekday] = React.useState<Weekday>(weekdayOf(now));
  if (!household) return null;

  const lanes = tvLanes(household, weekday);
  const overlaps = overlapsOn(household, weekday).filter(
    (o) => !isAcknowledged(household, o),
  );
  const overlapping = new Set(
    overlaps.flatMap((o) => [o.a.channel.id, o.b.channel.id]),
  );
  const warnings = visibleWarnings(household, now).filter(
    (w) =>
      (w.code === "W09" && w.weekday === weekday) ||
      (["W06", "W07", "W08"].includes(w.code) &&
        lanes.some((l) => l.windows.some((x) => x.channel.id === w.channelId))),
  );
  const allWindows = lanes.flatMap((l) => l.windows.map((x) => x.window));
  const start = Math.min(
    DEFAULT_START,
    ...allWindows.map((w) => minutesOf(w.start)),
  );
  const end = Math.max(DEFAULT_END, ...allWindows.map((w) => minutesOf(w.end)));
  const hasWindows = allWindows.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={weekday} onValueChange={(v) => setWeekday(v as Weekday)}>
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          {WEEKDAYS.map((w) => (
            <TabsTrigger key={w} value={w} className="h-9 px-3">
              {WEEKDAY_LABELS[w].slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {!hasWindows ? (
        <p className="text-muted-foreground text-sm">
          No TV windows on {WEEKDAY_LABELS[weekday]}. Add a channel to a child
          to see it here.
        </p>
      ) : (
        <>
          <div className="md:hidden">
            <Track
              lanes={lanes}
              weekday={weekday}
              start={start}
              end={end}
              overlapping={overlapping}
            />
          </div>
          <div className="hidden md:block">
            <Grid
              lanes={lanes}
              weekday={weekday}
              start={start}
              end={end}
              overlapping={overlapping}
            />
          </div>
        </>
      )}

      {warnings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {warnings.map((w) => (
            <WarningCard
              key={w.key}
              warning={w}
              primaryFirst={w.code === "W09"}
            />
          ))}
        </div>
      ) : (
        hasWindows && (
          <p className="text-muted-foreground text-sm">
            No conflicts on {WEEKDAY_LABELS[weekday]}.
          </p>
        )
      )}
      <Button
        variant="link"
        className="h-11 self-start px-1"
        render={<Link href="/schedule?view=library" />}
        nativeButton={false}
      >
        Open library
      </Button>
    </div>
  );
}

const HATCH =
  "repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in oklch, var(--muted-foreground) 25%, transparent) 6px 8px)";

function Track({
  lanes,
  weekday,
  start,
  end,
  overlapping,
}: {
  lanes: Lane[];
  weekday: Weekday;
  start: number;
  end: number;
  overlapping: Set<string>;
}) {
  const pxPerMin = 2;
  const width = (end - start) * pxPerMin;
  const hours: number[] = [];
  for (let m = Math.ceil(start / 60) * 60; m <= end; m += 60) hours.push(m);
  return (
    <ScrollArea className="rounded-xl border">
      <div style={{ width: width + 96 }} className="pb-2">
        <div className="relative ml-24 h-6" style={{ width }}>
          {hours.map((m) => (
            <span
              key={m}
              className="text-muted-foreground absolute top-1 -translate-x-1/2 text-xs tabular-nums"
              style={{ left: (m - start) * pxPerMin }}
            >
              {timeOf(m)}
            </span>
          ))}
        </div>
        {lanes.map(({ kid, windows }) => (
          <div key={kid.id} className="flex h-14 items-center border-t">
            <div className="bg-background sticky left-0 z-10 flex w-24 shrink-0 items-center gap-2 px-3 text-sm">
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  KID_COLOUR_CLASS[kid.colour],
                )}
              />
              <span className="truncate">{kid.name}</span>
            </div>
            <div className="relative h-full" style={{ width }}>
              {regionsFor(kid, weekday).map((r, i) => {
                const l = Math.max(r.start, start);
                const rEnd = Math.min(r.end, end);
                if (rEnd <= l) return null;
                return (
                  <div
                    key={i}
                    className="absolute inset-y-2 rounded-sm"
                    style={{
                      left: (l - start) * pxPerMin,
                      width: (rEnd - l) * pxPerMin,
                      backgroundImage: HATCH,
                    }}
                    title={r.title}
                  />
                );
              })}
              {windows.map(({ channel, window }) => (
                <Link
                  key={channel.id}
                  href={`/kids/${kid.id}/channels/${channel.id}`}
                  className={cn(
                    "absolute inset-y-3 flex items-center gap-1 overflow-hidden rounded-md border px-2 text-xs text-white",
                    KID_COLOUR_CLASS[kid.colour],
                    overlapping.has(channel.id) &&
                      "border-warning ring-warning ring-2",
                  )}
                  style={{
                    left: (minutesOf(window.start) - start) * pxPerMin,
                    width:
                      (minutesOf(window.end) - minutesOf(window.start)) *
                      pxPerMin,
                  }}
                >
                  <ChannelIcon
                    icon={channel.icon}
                    className="size-3.5 shrink-0"
                  />
                  <span className="truncate">{channel.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function Grid({
  lanes,
  weekday,
  start,
  end,
  overlapping,
}: {
  lanes: Lane[];
  weekday: Weekday;
  start: number;
  end: number;
  overlapping: Set<string>;
}) {
  const pxPerMin = 1.6;
  const top = 12;
  const height = (end - start) * pxPerMin + top * 2;
  const hours: number[] = [];
  for (let m = Math.ceil(start / 60) * 60; m <= end; m += 60) hours.push(m);
  return (
    <div className="rounded-xl border">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `56px repeat(${lanes.length}, minmax(140px, 1fr))`,
        }}
      >
        <div className="border-b" />
        {lanes.map(({ kid }) => (
          <div
            key={kid.id}
            className="flex h-11 items-center gap-2 border-b border-l px-3 text-sm font-medium"
          >
            <span
              className={cn(
                "size-2.5 rounded-full",
                KID_COLOUR_CLASS[kid.colour],
              )}
            />
            {kid.name}
          </div>
        ))}
        <div className="relative" style={{ height }}>
          {hours.map((m) => (
            <span
              key={m}
              className="text-muted-foreground absolute right-2 -translate-y-1/2 text-xs tabular-nums"
              style={{ top: (m - start) * pxPerMin + top }}
            >
              {timeOf(m)}
            </span>
          ))}
        </div>
        {lanes.map(({ kid, windows }) => (
          <div key={kid.id} className="relative border-l" style={{ height }}>
            {hours.map((m) => (
              <div
                key={m}
                className="border-border/60 absolute inset-x-0 border-t"
                style={{ top: (m - start) * pxPerMin + top }}
              />
            ))}
            {regionsFor(kid, weekday).map((r, i) => {
              const l = Math.max(r.start, start);
              const rEnd = Math.min(r.end, end);
              if (rEnd <= l) return null;
              return (
                <div
                  key={i}
                  className="absolute inset-x-1 rounded-sm"
                  style={{
                    top: (l - start) * pxPerMin + top,
                    height: (rEnd - l) * pxPerMin,
                    backgroundImage: HATCH,
                  }}
                  title={r.title}
                />
              );
            })}
            {windows.map(({ channel, window }) => (
              <Link
                key={channel.id}
                href={`/kids/${kid.id}/channels/${channel.id}`}
                className={cn(
                  "absolute inset-x-2 flex items-start gap-1.5 overflow-hidden rounded-md border px-2 py-1 text-xs text-white",
                  KID_COLOUR_CLASS[kid.colour],
                  overlapping.has(channel.id) &&
                    "border-warning ring-warning ring-2",
                )}
                style={{
                  top: (minutesOf(window.start) - start) * pxPerMin + top,
                  height:
                    (minutesOf(window.end) - minutesOf(window.start)) *
                    pxPerMin,
                }}
              >
                <ChannelIcon
                  icon={channel.icon}
                  className="mt-0.5 size-3.5 shrink-0"
                />
                <span className="truncate">
                  {channel.name} · {window.start} to {window.end}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
