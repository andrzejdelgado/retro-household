"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { TopBar } from "@/components/app-shell";
import { BudgetBar, BudgetCard } from "@/components/budget-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WarningCard } from "@/components/warning-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { bracketFor } from "@/lib/bracket/bracket";
import { timeOf, WEEKDAYS, type Weekday } from "@/lib/clock/clock";
import { useHousehold } from "@/lib/household/provider";
import { useNow } from "@/lib/household/use-now";
import { CATEGORY_LABELS, formatDuration } from "@/lib/media/media";
import { newId, type Channel, type Household } from "@/lib/model/types";
import { WEEKDAY_LABELS } from "@/lib/routine/routine";
import { defaultWindow, layout, programmeFor } from "@/lib/schedule/schedule";
import { visibleWarnings } from "@/lib/warnings/warnings";
import { cn } from "@/lib/utils";
import { CHANNEL_ICONS, ChannelIcon } from "./channel-icons";
import { Poster } from "./library-screen";

function withDraft(h: Household, kidId: string, draft: Channel): Household {
  return {
    ...h,
    kids: h.kids.map((k) =>
      k.id === kidId
        ? {
            ...k,
            channels: k.channels.some((c) => c.id === draft.id)
              ? k.channels.map((c) => (c.id === draft.id ? draft : c))
              : [...k.channels, draft],
          }
        : k,
    ),
  };
}

/** S10: when a channel is on air and what it plays. Warnings are derived from the draft. */
export function ChannelEditorScreen({
  kidId,
  channelId,
}: {
  kidId: string;
  channelId: string | null;
}) {
  const { household, update } = useHousehold();
  const now = useNow();
  const router = useRouter();
  const mobile = useIsMobile();
  const kid = household?.kids.find((k) => k.id === kidId);
  const existing = kid?.channels.find((c) => c.id === channelId) ?? null;
  const [draft, setDraft] = React.useState<Channel | null>(null);
  const [day, setDay] = React.useState<Weekday | null>(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  if (!household || !kid) return null;

  const bracket = bracketFor(kid.birthdate, now);
  const channel: Channel =
    draft ??
    existing ??
    (() => {
      const win = defaultWindow(kid, bracket);
      return {
        id: newId(),
        name: "",
        icon: "star",
        windows: win ? [win] : [{ days: [], start: "", end: "" }],
        programme: [],
        programmesByDay: null,
      };
    })();
  const win = channel.windows[0];
  const noDefault = !win || win.start === "" || win.end === "";
  const varying = channel.programmesByDay !== null;
  const selectedDay: Weekday | null = varying
    ? day && win.days.includes(day)
      ? day
      : (win.days[0] ?? null)
    : (win.days[0] ?? null);
  const previewDay = selectedDay ?? "mon";
  const draftHousehold = withDraft(household, kid.id, channel);
  const draftKid = draftHousehold.kids.find((k) => k.id === kid.id)!;
  const warnings = visibleWarnings(draftHousehold, now).filter(
    (w) =>
      w.kidId === kid.id &&
      (w.channelId === channel.id ||
        (w.channelId === null &&
          ["W01", "W02", "W03", "W04"].includes(w.code))),
  );
  const l = layout(channel, previewDay, household.shows);
  const programme = programmeFor(channel, previewDay);
  const canSave =
    channel.name.trim().length > 0 &&
    win.days.length > 0 &&
    win.start !== "" &&
    win.end !== "" &&
    win.end > win.start;

  const set = (patch: Partial<Channel>) => setDraft({ ...channel, ...patch });
  const setWin = (patch: Partial<Channel["windows"][number]>) =>
    set({ windows: [{ ...win, ...patch }] });
  const setProgramme = (ids: string[]) => {
    if (varying && selectedDay)
      set({
        programmesByDay: {
          ...(channel.programmesByDay ?? {}),
          [selectedDay]: ids,
        },
      });
    else set({ programme: ids });
  };

  function onFix(fix: {
    id: string;
    apply: (h: Household) => Household;
  }): boolean {
    if (fix.id === "remove") {
      if (existing) return false;
      router.push(`/kids/${kid!.id}/channels`);
      return true;
    }
    if (fix.id === "keep") return false;
    // Apply the fix to the draft household and keep editing.
    const next = fix
      .apply(draftHousehold)
      .kids.find((k) => k.id === kid!.id)
      ?.channels.find((c) => c.id === channel.id);
    if (next) setDraft(next);
    return true;
  }

  function save() {
    const final = { ...channel, name: channel.name.trim() };
    update((h) => withDraft(h, kid!.id, final));
    router.push(`/kids/${kid!.id}/channels`);
  }
  function remove() {
    update((h) => ({
      ...h,
      kids: h.kids.map((k) =>
        k.id === kid!.id
          ? { ...k, channels: k.channels.filter((c) => c.id !== channel.id) }
          : k,
      ),
    }));
    router.push(`/kids/${kid!.id}/channels`);
  }

  const picker = (
    <div className="flex flex-col gap-2 px-4 pb-6 md:px-0">
      {household.shows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Add videos to the library first, under TV, Library.
        </p>
      ) : (
        household.shows.map((s) => (
          <Button
            key={s.id}
            variant="ghost"
            className="h-auto justify-start gap-3 px-2 py-2 text-left whitespace-normal"
            onClick={() => {
              setProgramme([...programme, s.id]);
              setPickerOpen(false);
            }}
          >
            <div className="w-20 shrink-0">
              <Poster show={s} />
            </div>
            <span className="flex flex-col">
              <span>{s.title}</span>
              <span className="text-muted-foreground text-xs">
                {formatDuration(s.durationSec)} · {CATEGORY_LABELS[s.category]}{" "}
                · ages {s.ages[0]} to {s.ages[1]}
              </span>
            </span>
          </Button>
        ))
      )}
    </div>
  );

  return (
    <>
      <TopBar title={existing ? existing.name : "New channel"} />
      <main className="mx-auto w-full max-w-[1080px] px-4 py-6 md:grid md:grid-cols-[minmax(0,720px)_320px] md:gap-6 md:px-6">
        <div className="flex flex-col gap-6 pb-32 md:pb-0">
          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg">Channel</h2>
            <div className="flex flex-col gap-2">
              <Label htmlFor="channel-name">Name</Label>
              <Input
                id="channel-name"
                className="h-11"
                value={channel.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Stories"
              />
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Icon</legend>
              <ToggleGroup
                value={[channel.icon]}
                onValueChange={(v) => v[0] && set({ icon: String(v[0]) })}
                className="grid w-full grid-cols-6 gap-1"
                aria-label="Icon"
              >
                {Object.keys(CHANNEL_ICONS).map((key) => (
                  <ToggleGroupItem
                    key={key}
                    value={key}
                    className="h-11 w-full min-w-0 px-0"
                    aria-label={key}
                  >
                    <ChannelIcon icon={key} className="size-5" />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </fieldset>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg">On air</h2>
            {noDefault && (
              <p className="text-muted-foreground text-sm">
                Set when this channel is on air.
              </p>
            )}
            <ToggleGroup
              multiple
              value={win.days}
              onValueChange={(v) =>
                setWin({
                  days: WEEKDAYS.filter((w) => (v as Weekday[]).includes(w)),
                })
              }
              className="grid w-full grid-cols-7 gap-1"
              aria-label="Days on air"
            >
              {WEEKDAYS.map((w) => (
                <ToggleGroupItem
                  key={w}
                  value={w}
                  className="h-11 w-full min-w-0 px-0"
                >
                  {WEEKDAY_LABELS[w].slice(0, 3)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="window-start">Start</Label>
                <Input
                  id="window-start"
                  type="time"
                  step={900}
                  className="h-11"
                  value={win.start}
                  onChange={(e) => setWin({ start: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="window-end">End</Label>
                <Input
                  id="window-end"
                  type="time"
                  step={900}
                  className="h-11"
                  value={win.end}
                  onChange={(e) => setWin({ end: e.target.value })}
                />
              </div>
            </div>
            {warnings
              .filter((w) => w.code !== "W10" && w.code !== "W11")
              .map((w) => (
                <WarningCard key={w.key} warning={w} onFix={onFix} />
              ))}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg">Programme</h2>
              <Label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={varying}
                  onCheckedChange={(on) =>
                    set({ programmesByDay: on ? {} : null })
                  }
                />
                Vary by day
              </Label>
            </div>
            {varying && win.days.length > 0 && (
              <Tabs
                value={selectedDay ?? win.days[0]}
                onValueChange={(v) => setDay(v as Weekday)}
              >
                <TabsList className="h-auto w-full justify-start overflow-x-auto">
                  {win.days.map((w) => (
                    <TabsTrigger key={w} value={w} className="h-9 px-3">
                      {WEEKDAY_LABELS[w].slice(0, 3)}
                      {programmeFor(channel, w).length === 0 && (
                        <span
                          className="bg-warning ml-1 size-1.5 rounded-full"
                          aria-label="nothing to play"
                        />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
            {programme.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nothing to play yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {programme.map((id, i) => {
                  const show = household.shows.find((s) => s.id === id);
                  const placed = l.placed.find((p) => p.showId === id);
                  const refused = l.notPlaced.includes(id);
                  return (
                    <Card
                      key={`${id}-${i}`}
                      className={cn("py-2", refused && "border-warning")}
                    >
                      <CardContent className="flex items-center gap-3 px-3">
                        <span className="text-muted-foreground w-12 shrink-0 text-xs tabular-nums">
                          {placed
                            ? timeOf(Math.floor(placed.startSec / 60))
                            : "—"}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate">
                            {show?.title ?? "Unknown show"}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {show ? formatDuration(show.durationSec) : ""}
                            {refused ? " · does not fit" : ""}
                          </span>
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-11"
                          aria-label={`Remove ${show?.title ?? "show"}`}
                          onClick={() =>
                            setProgramme(programme.filter((_, j) => j !== i))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
                {l.window && l.offAirAtSec !== null && (
                  <p className="text-muted-foreground px-3 text-xs tabular-nums">
                    Off air from {timeOf(Math.floor(l.offAirAtSec / 60))} until{" "}
                    {l.window.end}
                  </p>
                )}
              </div>
            )}
            <Button
              variant="secondary"
              className="h-11 self-start"
              onClick={() => setPickerOpen(true)}
            >
              <Plus /> Add show
            </Button>
            {varying && win.days.length > 1 && selectedDay && (
              <Button
                variant="ghost"
                className="h-11 self-start"
                onClick={() => {
                  const byDay = { ...(channel.programmesByDay ?? {}) };
                  for (const w of win.days) byDay[w] = programme;
                  set({ programmesByDay: byDay });
                }}
              >
                Copy {WEEKDAY_LABELS[selectedDay]} to the other days
              </Button>
            )}
            {warnings
              .filter((w) => w.code === "W10" || w.code === "W11")
              .map((w) => (
                <WarningCard key={w.key} warning={w} onFix={onFix} />
              ))}
          </section>

          <div className="bg-background fixed inset-x-0 bottom-[7rem] z-20 flex gap-2 border-t p-4 md:static md:border-0 md:bg-transparent md:p-0">
            <Button
              className="h-11 flex-1 md:flex-none"
              disabled={!canSave}
              onClick={save}
            >
              Save
            </Button>
            {existing && (
              <Button variant="ghost" className="h-11" onClick={remove}>
                Remove channel
              </Button>
            )}
          </div>
        </div>
        <BudgetCard kid={draftKid} />
      </main>
      <BudgetBar kid={draftKid} />

      {mobile ? (
        <Drawer open={pickerOpen} onOpenChange={setPickerOpen} showSwipeHandle>
          <DrawerContent className="max-h-[85dvh]">
            <DrawerHeader>
              <DrawerTitle>Add a show</DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto">{picker}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
          <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Add a show</SheetTitle>
            </SheetHeader>
            <div className="px-4">{picker}</div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
