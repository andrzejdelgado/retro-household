"use client";

import * as React from "react";
import { ChannelIcon } from "@/components/tv/channel-icons";
import { useHousehold } from "@/lib/household/provider";
import { useBlobUrl } from "@/lib/media/use-blob-url";
import type { Channel, Kid, Show } from "@/lib/model/types";
import type { NowPlaying } from "@/lib/schedule/schedule";
import { logSeconds } from "@/lib/viewing/viewing";

/**
 * T03: the show plays from the broadcast offset (C4.1); no controls the child could use (I15).
 * Every playing second is written to the log for the kid and each co-watcher (C4.5).
 */
export function Playback({
  kid,
  channel,
  playing,
  shows,
  coWatchers,
  now,
}: {
  kid: Kid;
  channel: Channel;
  playing: NonNullable<NowPlaying>;
  shows: Show[];
  coWatchers: string[];
  now: Date;
}) {
  const { update } = useHousehold();
  const show = shows.find((s) => s.id === playing.showId) ?? null;
  const url = useBlobUrl(show?.fileKey ?? null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [badge, setBadge] = React.useState(true);
  const pending = React.useRef(0);
  const nowRef = React.useRef(now);
  const watchersRef = React.useRef(coWatchers);
  React.useEffect(() => {
    nowRef.current = now;
    watchersRef.current = coWatchers;
  });

  // Seek to the broadcast offset when the file is ready; the offset is where the clock says we are.
  const offsetRef = React.useRef(playing.offsetSec);
  React.useEffect(() => {
    offsetRef.current = playing.offsetSec;
  });
  const onLoaded = () => {
    const v = videoRef.current;
    if (v)
      v.currentTime = Math.min(
        offsetRef.current,
        Math.max(0, v.duration - 0.5),
      );
  };

  // The channel badge fades after two seconds; a channel change shows it again.
  React.useEffect(() => {
    const id = setTimeout(() => setBadge(false), 2000);
    return () => {
      clearTimeout(id);
    };
  }, [channel.id]);

  // Count seconds and flush to the household every five, and on leaving.
  React.useEffect(() => {
    const flush = () => {
      const seconds = pending.current;
      if (seconds === 0) return;
      pending.current = 0;
      update((h) =>
        logSeconds(h, {
          hostKidId: kid.id,
          coWatcherIds: watchersRef.current,
          channelId: channel.id,
          showId: playing.showId,
          at: nowRef.current,
          seconds,
        }),
      );
    };
    const tick = setInterval(() => {
      pending.current += 1;
      if (pending.current >= 5) flush();
    }, 1000);
    return () => {
      clearInterval(tick);
      flush();
    };
  }, [kid.id, channel.id, playing.showId, update]);

  return (
    <main className="bg-background relative min-h-dvh">
      {url ? (
        <video
          ref={videoRef}
          key={`${playing.showId}-${url}`}
          src={url}
          className="h-dvh w-full object-contain"
          autoPlay
          playsInline
          onLoadedMetadata={onLoaded}
          onEnded={() => {
            /* The next placed show starts at its placed time; the clock decides (schedule.nowPlaying). */
          }}
        />
      ) : (
        <div className="flex h-dvh items-center justify-center">
          <ChannelIcon
            icon={channel.icon}
            className="text-muted-foreground size-24"
          />
        </div>
      )}
      <div
        aria-hidden={!badge}
        className={`bg-card/80 absolute top-8 left-8 flex items-center gap-3 rounded-2xl px-5 py-3 text-[40px] transition-opacity duration-500 ${badge ? "opacity-100" : "opacity-0"}`}
      >
        <ChannelIcon icon={channel.icon} className="size-10" />
        <span>{channel.name}</span>
      </div>
    </main>
  );
}
