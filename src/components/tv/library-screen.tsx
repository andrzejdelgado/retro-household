"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHousehold } from "@/lib/household/provider";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  formatDuration,
  importVideo,
} from "@/lib/media/media";
import { useBlobUrl } from "@/lib/media/use-blob-url";
import type { Show, ShowCategory } from "@/lib/model/types";
import { cn } from "@/lib/utils";

function Poster({ show, className }: { show: Show; className?: string }) {
  const url = useBlobUrl(show.posterKey);
  return (
    <div
      className={cn(
        "bg-muted aspect-video w-full overflow-hidden rounded-md",
        className,
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
          {show.fileKey ? "No poster" : "No file"}
        </div>
      )}
    </div>
  );
}

/** S12: the household's videos, filtered by category and age (D43), with the add dialog. */
export function LibraryScreen({ embedded = false }: { embedded?: boolean }) {
  const { household, update, store } = useHousehold();
  const mobile = useIsMobile();
  const [category, setCategory] = React.useState<string>("all");
  const [ages, setAges] = React.useState<[number, number]>([0, 8]);
  const [ageOpen, setAgeOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [progress, setProgress] = React.useState<
    { name: string; done: boolean; error?: string }[]
  >([]);
  if (!household) return null;

  const shows = household.shows.filter(
    (s) =>
      (category === "all" || s.category === category) &&
      s.ages[0] < ages[1] &&
      ages[0] < s.ages[1],
  );
  const usedBy = (show: Show) =>
    household.kids.flatMap((k) =>
      k.channels
        .filter(
          (c) =>
            c.programme.includes(show.id) ||
            Object.values(c.programmesByDay ?? {}).some((p) =>
              p?.includes(show.id),
            ),
        )
        .map((c) => `${c.name} (${k.name})`),
    );

  async function addFiles(
    files: File[],
    meta: { title: string; category: ShowCategory; ages: [number, number] },
  ) {
    setAddOpen(false);
    setProgress(files.map((f) => ({ name: f.name, done: false })));
    for (const [i, file] of files.entries()) {
      try {
        const show = await importVideo(
          file,
          {
            ...meta,
            title:
              files.length === 1
                ? meta.title
                : file.name.replace(/\.[^.]+$/, ""),
          },
          store,
        );
        update((h) => ({ ...h, shows: [...h.shows, show] }));
        setProgress((p) =>
          p.map((x, j) => (j === i ? { ...x, done: true } : x)),
        );
      } catch (e) {
        setProgress((p) =>
          p.map((x, j) =>
            j === i ? { ...x, done: true, error: (e as Error).message } : x,
          ),
        );
      }
    }
  }

  const addForm = (
    <AddForm onSubmit={addFiles} onCancel={() => setAddOpen(false)} />
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        !embedded && "mx-auto w-full max-w-[1080px] px-4 py-6 md:px-6",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          value={[category]}
          onValueChange={(v) => setCategory(String(v[0] ?? "all"))}
          className="flex-wrap"
        >
          <ToggleGroupItem value="all" className="h-11 px-3">
            All
          </ToggleGroupItem>
          {CATEGORIES.map((c) => (
            <ToggleGroupItem key={c} value={c} className="h-11 px-3">
              {CATEGORY_LABELS[c]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button className="h-11 md:ml-auto" onClick={() => setAddOpen(true)}>
          <Plus /> Add videos
        </Button>
      </div>
      <Collapsible open={ageOpen} onOpenChange={setAgeOpen}>
        <CollapsibleTrigger
          render={<Button variant="ghost" className="h-11 px-2" />}
        >
          Ages {ages[0]} to {ages[1]}
        </CollapsibleTrigger>
        <CollapsibleContent className="max-w-sm px-2 pt-2">
          <Slider
            min={0}
            max={8}
            step={1}
            value={ages}
            onValueChange={(v) => setAges(v as [number, number])}
            aria-label="Age range"
          />
          <div className="text-muted-foreground mt-1 flex justify-between text-xs tabular-nums">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {progress.length > 0 && (
        <div className="flex flex-col gap-2">
          {progress.map((p) => (
            <Card key={p.name} className="py-3">
              <CardContent className="flex flex-col gap-2 px-4 text-sm">
                <span className="truncate">{p.name}</span>
                {p.error ? (
                  <span className="text-destructive">{p.error}</span>
                ) : (
                  <Progress
                    value={p.done ? 100 : 40}
                    aria-label={`Importing ${p.name}`}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {household.shows.length === 0 ? (
        <Card>
          <CardContent>
            <p>
              Add the films and episodes you have already watched and chosen.
              Short clips are best for a demo.
            </p>
          </CardContent>
        </Card>
      ) : shows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing in this category for these ages.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {shows.map((show) => {
            const used = usedBy(show);
            return (
              <Card key={show.id} className="gap-2 py-3">
                <CardContent className="flex flex-col gap-2 px-3">
                  <Poster show={show} />
                  <span className="truncate font-medium">{show.title}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {formatDuration(show.durationSec)} ·{" "}
                    {CATEGORY_LABELS[show.category]} · ages {show.ages[0]} to{" "}
                    {show.ages[1]}
                  </span>
                  {used.length > 0 && (
                    <span className="text-muted-foreground truncate text-xs">
                      Used by {used.join(", ")}
                    </span>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-11 justify-start px-1"
                          disabled={used.length > 0}
                        />
                      }
                    >
                      <Trash2 /> {used.length > 0 ? "In a programme" : "Delete"}
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete &quot;{show.title}&quot;?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          The video leaves this browser. There is no undo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={async () => {
                            if (show.fileKey)
                              await store.deleteBlob(show.fileKey);
                            if (show.posterKey)
                              await store.deleteBlob(show.posterKey);
                            update((h) => ({
                              ...h,
                              shows: h.shows.filter((s) => s.id !== show.id),
                            }));
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {mobile ? (
        <Drawer open={addOpen} onOpenChange={setAddOpen} showSwipeHandle>
          <DrawerContent className="max-h-[90dvh]">
            <DrawerHeader>
              <DrawerTitle>Add videos</DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-6">{addForm}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add videos</DialogTitle>
            </DialogHeader>
            {addForm}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AddForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (
    files: File[],
    meta: { title: string; category: ShowCategory; ages: [number, number] },
  ) => void;
  onCancel: () => void;
}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<ShowCategory>("stories");
  const [ages, setAges] = React.useState<[number, number]>([3, 8]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-4">
      <div
        className="hover:bg-accent/40 flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const dropped = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("video/"),
          );
          setFiles(dropped);
          if (dropped.length === 1)
            setTitle(dropped[0].name.replace(/\.[^.]+$/, ""));
        }}
      >
        <span>Drop video files here</span>
        <span className="text-muted-foreground text-xs">
          Anything this browser can play. Short clips for a demo.
        </span>
        <Button
          variant="secondary"
          className="h-11"
          onClick={() => inputRef.current?.click()}
        >
          Select files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          className="sr-only"
          aria-label="Video files"
          onChange={(e) => {
            const chosen = Array.from(e.target.files ?? []);
            setFiles(chosen);
            if (chosen.length === 1)
              setTitle(chosen[0].name.replace(/\.[^.]+$/, ""));
          }}
        />
        {files.length > 0 && (
          <span className="text-xs">
            {files.length === 1 ? files[0].name : `${files.length} files`}
          </span>
        )}
      </div>
      {files.length === 1 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="show-title">Title</Label>
          <Input
            id="show-title"
            className="h-11"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="show-category">Category</Label>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as ShowCategory)}
        >
          <SelectTrigger id="show-category" className="h-11 w-full">
            <SelectValue>{CATEGORY_LABELS[category]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>
          Ages {ages[0]} to {ages[1]}
        </Label>
        <Slider
          min={0}
          max={8}
          step={1}
          value={ages}
          onValueChange={(v) => setAges(v as [number, number])}
          aria-label="Ages the video suits"
        />
        <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" className="h-11" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="h-11"
          disabled={files.length === 0}
          onClick={() => onSubmit(files, { title, category, ages })}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export { Poster };
