"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCap } from "@/content";
import { bracketFor } from "@/lib/bracket/bracket";
import { WEEKDAYS, weekdayOf } from "@/lib/clock/clock";
import { useHousehold } from "@/lib/household/provider";
import { KID_COLOUR_CLASS } from "@/lib/household/kid-view";
import { useNow } from "@/lib/household/use-now";
import type { Channel, Kid } from "@/lib/model/types";
import { WEEKDAY_LABELS } from "@/lib/routine/routine";
import { nowPlaying, windowFor } from "@/lib/schedule/schedule";
import { cn } from "@/lib/utils";
import { ChannelIcon } from "./channel-icons";

function nextOnAir(channel: Channel, now: Date): string | null {
  const today = weekdayOf(now);
  const idx = WEEKDAYS.indexOf(today);
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < 7; i++) {
    const w = WEEKDAYS[(idx + i) % 7];
    const win = windowFor(channel, w);
    if (!win) continue;
    const [h, m] = win.start.split(":").map(Number);
    if (i === 0 && h * 60 + m <= minutes) continue;
    return `${i === 0 ? "today" : i === 1 ? "tomorrow" : WEEKDAY_LABELS[w]} at ${win.start}`;
  }
  return null;
}

/** S20: every channel in the house with its on-air state, a tab per kid (D42). */
export function HouseholdChannelsScreen() {
  const { household } = useHousehold();
  const now = useNow();
  const [tab, setTab] = React.useState("all");
  if (!household) return null;
  const kids =
    tab === "all" ? household.kids : household.kids.filter((k) => k.id === tab);
  const total = household.kids.reduce((n, k) => n + k.channels.length, 0);

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="h-9 px-3">
            All
          </TabsTrigger>
          {household.kids.map((k) => (
            <TabsTrigger key={k.id} value={k.id} className="h-9 gap-2 px-3">
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  KID_COLOUR_CLASS[k.colour],
                )}
              />
              {k.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {total === 0 && (
        <p className="text-muted-foreground text-sm">
          No channels yet. A channel is a set of shows that plays at a fixed
          time, like television used to.
        </p>
      )}
      {kids.map((kid) => (
        <KidChannels key={kid.id} kid={kid} now={now} />
      ))}
    </div>
  );
}

function KidChannels({ kid, now }: { kid: Kid; now: Date }) {
  const { household } = useHousehold();
  const bracket = bracketFor(kid.birthdate, now);
  const closed = getCap(bracket).minutesPerDay === 0;
  const full = kid.channels.length >= 4;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-heading flex items-center gap-2 text-lg">
        <span
          className={cn("size-3 rounded-full", KID_COLOUR_CLASS[kid.colour])}
        />
        {kid.name}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kid.channels.map((c) => {
          const playing = nowPlaying(c, household!.shows, now);
          const show = playing
            ? household!.shows.find((s) => s.id === playing.showId)
            : null;
          const next = nextOnAir(c, now);
          const win = c.windows[0];
          return (
            <Link
              key={c.id}
              href={`/kids/${kid.id}/channels/${c.id}`}
              className="focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-3"
            >
              <Card
                className={cn(
                  "hover:bg-accent/40 h-full py-4 transition-colors",
                  !playing && "bg-muted/40",
                )}
              >
                <CardContent className="flex flex-col gap-2 px-4">
                  <div className="flex items-center gap-2">
                    <ChannelIcon icon={c.icon} className="size-10 shrink-0" />
                    <span className="truncate font-medium">{c.name}</span>
                  </div>
                  {win && (
                    <span className="text-muted-foreground text-xs">
                      {win.days
                        .map((d) => WEEKDAY_LABELS[d].slice(0, 3))
                        .join(" ")}{" "}
                      · {win.start} to {win.end}
                    </span>
                  )}
                  {playing ? (
                    <Badge className="h-auto whitespace-normal">
                      On air · {show?.title ?? "a show"}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="h-auto whitespace-normal"
                    >
                      Off air{next ? ` · next ${next}` : ""}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
        <Link
          href={full ? "#" : `/kids/${kid.id}/channels/new`}
          aria-disabled={full}
          className={cn(
            "focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-3",
            full && "pointer-events-none opacity-60",
          )}
        >
          <Card className="h-full border-dashed py-4">
            <CardContent className="text-muted-foreground flex h-full flex-col justify-center gap-1 px-4 text-sm">
              <span className="flex items-center gap-2">
                <Plus className="size-4" /> Add channel
              </span>
              {full && (
                <span className="text-xs">Four channels is the limit.</span>
              )}
              {!full && closed && (
                <span className="text-xs">
                  No screen time is recommended under 3. The app will show what
                  it means.
                </span>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}
