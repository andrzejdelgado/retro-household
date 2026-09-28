import { newId, type Show, type ShowCategory } from "@/lib/model/types";
import type { HouseholdStore } from "@/lib/storage/store";

export const CATEGORY_LABELS: Record<ShowCategory, string> = {
  stories: "Stories",
  films: "Films",
  nature: "Nature",
  music: "Music",
  learning: "Learning",
  family: "Family videos",
  other: "Other",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as ShowCategory[];

/** Duration and a poster frame from a video file, read in the browser (D18). */
export function readVideo(
  file: File,
): Promise<{ durationSec: number; poster: Blob | null }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const done = (poster: Blob | null) => {
      const durationSec = Number.isFinite(video.duration)
        ? Math.round(video.duration)
        : 0;
      URL.revokeObjectURL(url);
      resolve({ durationSec, poster });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file type cannot be played in this browser."));
    };
    video.onloadedmetadata = () => {
      // Seek a second in for a frame that is not black.
      video.currentTime = Math.min(1, Math.max(0, video.duration / 2));
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height =
          Math.round((320 * video.videoHeight) / video.videoWidth) || 180;
        canvas
          .getContext("2d")
          ?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => done(blob), "image/jpeg", 0.8);
      } catch {
        done(null);
      }
    };
    video.src = url;
  });
}

/** Import one file into the library: blobs into the store, a Show record for the household. */
export async function importVideo(
  file: File,
  input: { title: string; category: ShowCategory; ages: [number, number] },
  store: HouseholdStore,
  now: Date = new Date(),
): Promise<Show> {
  const { durationSec, poster } = await readVideo(file);
  const id = newId();
  const fileKey = `video:${id}`;
  await store.putBlob(fileKey, file);
  let posterKey: string | null = null;
  if (poster) {
    posterKey = `poster:${id}`;
    await store.putBlob(posterKey, poster);
  }
  return {
    id,
    title: input.title.trim() || file.name.replace(/\.[^.]+$/, ""),
    durationSec,
    fileKey,
    posterKey,
    category: input.category,
    ages: input.ages,
    addedAt: now.toISOString(),
  };
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m} min` : `${m} min ${String(s).padStart(2, "0")} s`;
}
