"use client";

import * as React from "react";
import { Power } from "lucide-react";
import { ChannelIcon } from "@/components/tv/channel-icons";
import { useBlobUrl } from "@/lib/media/use-blob-url";
import type { Channel, Kid, Show } from "@/lib/model/types";
import { nowPlaying } from "@/lib/schedule/schedule";
import { cn } from "@/lib/utils";

function Tile({
  channel,
  show,
  onAir,
  focused,
  onSelect,
}: {
  channel: Channel;
  show: Show | null;
  onAir: boolean;
  focused: boolean;
  onSelect: () => void;
}) {
  const poster = useBlobUrl(onAir ? (show?.posterKey ?? null) : null);
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (focused) ref.current?.focus();
  }, [focused]);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={cn(
        "focus-visible:border-primary flex w-[400px] flex-col overflow-hidden rounded-2xl border-4 border-transparent outline-none",
        onAir ? "bg-card" : "bg-muted",
      )}
      aria-label={onAir ? `${channel.name}, on air` : `${channel.name}, off`}
    >
      <div className="relative aspect-video w-full">
        {onAir && poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {onAir ? (
              <ChannelIcon
                icon={channel.icon}
                className="text-foreground size-24"
              />
            ) : (
              <Power className="text-muted-foreground size-10" aria-hidden />
            )}
          </div>
        )}
        <ChannelIcon
          icon={channel.icon}
          className={cn(
            "absolute top-3 left-3 size-12",
            onAir ? "text-foreground drop-shadow" : "text-muted-foreground",
          )}
        />
      </div>
      <span
        className={cn(
          "px-4 py-3 text-left text-[40px] leading-tight",
          onAir ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {channel.name}
      </span>
    </button>
  );
}

/** T02: up to four tiles, chosen with the eyes; off-air tiles dim (C4.4). Arrows and Enter (C4.7). */
export function Picker({
  kid,
  shows,
  now,
  focus,
  onSelect,
}: {
  kid: Kid;
  shows: Show[];
  now: Date;
  focus: number;
  onSelect: (i: number) => void;
}) {
  if (kid.channels.length === 0) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="bg-muted flex w-[400px] flex-col items-center justify-center rounded-2xl p-12">
          <Power className="text-muted-foreground size-10" aria-hidden />
        </div>
      </main>
    );
  }
  return (
    <main className="flex min-h-dvh flex-wrap items-center justify-center gap-8 p-12">
      {kid.channels.map((c, i) => {
        const playing = nowPlaying(c, shows, now);
        const show = playing
          ? (shows.find((s) => s.id === playing.showId) ?? null)
          : null;
        return (
          <Tile
            key={c.id}
            channel={c}
            show={show}
            onAir={Boolean(playing)}
            focused={focus === i}
            onSelect={() => onSelect(i)}
          />
        );
      })}
    </main>
  );
}
