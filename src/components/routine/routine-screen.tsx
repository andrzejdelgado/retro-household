"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { TopBar } from "@/components/app-shell";
import { BudgetBar, BudgetCard } from "@/components/budget-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WarningCard } from "@/components/warning-card";
import { WEEKDAYS, type Weekday } from "@/lib/clock/clock";
import { useHousehold } from "@/lib/household/provider";
import { useNow } from "@/lib/household/use-now";
import type { DayType, Kid, RoutineBlock } from "@/lib/model/types";
import {
  copyDayTo,
  gapsOf,
  mergeBack,
  orderedDayTypes,
  removeBlock,
  splitDays,
  weekdaysOf,
  WEEKDAY_LABELS,
  type Result,
} from "@/lib/routine/routine";
import { visibleWarnings } from "@/lib/warnings/warnings";
import { cn } from "@/lib/utils";
import { BlockEditor, type EditorTarget } from "./block-editor";
import { DaySwitcher } from "./day-switcher";
import { KIND_ICONS } from "./kind-icons";
import { ScheduleGrid } from "./schedule-grid";

/** S06: build and edit one kid's rhythm per day type. */
export function RoutineScreen({ id }: { id: string }) {
  const { household, update } = useHousehold();
  const now = useNow();
  const params = useSearchParams();
  const kid = household?.kids.find((k) => k.id === id);
  const [selected, setSelected] = React.useState<string | null>(
    params.get("day"),
  );
  const [editor, setEditor] = React.useState<EditorTarget | null>(null);
  const [undo, setUndo] = React.useState<{
    dayType: DayType;
    removed: string[];
  } | null>(null);
  const [copyOpen, setCopyOpen] = React.useState(false);
  const [copyTargets, setCopyTargets] = React.useState<Weekday[]>([]);

  if (!household || !kid) return null;
  const dayTypes = orderedDayTypes(kid);
  const current = dayTypes.find((d) => d.id === selected) ?? dayTypes[0];
  const warnings = visibleWarnings(household, now).filter(
    (w) => w.kidId === kid.id && ["W06", "W07", "W08"].includes(w.code),
  );

  function setKid(fn: (k: Kid) => Kid) {
    update((h) => ({
      ...h,
      kids: h.kids.map((k) => (k.id === kid!.id ? fn(k) : k)),
    }));
  }
  function setDayType(next: DayType) {
    setKid((k) => ({
      ...k,
      dayTypes: k.dayTypes.map((d) => (d.id === next.id ? next : d)),
    }));
  }
  function onSave(result: Result<DayType>): boolean {
    if (!result.ok) return false;
    if (result.removed && result.removed.length > 0)
      setUndo({
        dayType: current,
        removed: result.removed.map((b) => b.title),
      });
    else setUndo(null);
    setDayType(result.value);
    return true;
  }

  const blocks = [...current.blocks].sort((a, b) =>
    a.start.localeCompare(b.start),
  );
  const gaps = gapsOf(current);

  return (
    <>
      <TopBar title={`${kid.name}'s routine`} />
      <main className="mx-auto w-full max-w-[1080px] px-4 py-6 md:grid md:grid-cols-[minmax(0,1fr)_320px] md:gap-6 md:px-6">
        <div className="flex flex-col gap-4 pb-44 md:pb-0">
          <DaySwitcher
            kid={kid}
            selected={current.id}
            onSelect={setSelected}
            onSplit={(kind) => setKid((k) => splitDays(k, kind))}
            onCopy={() => {
              setCopyTargets([]);
              setCopyOpen(true);
            }}
            onMerge={(kind) => {
              setKid((k) => mergeBack(k, kind));
              setSelected(null);
            }}
          />

          {undo && (
            <p className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
              Removed: {undo.removed.join(", ")}.
              <Button
                variant="link"
                className="h-11 px-1"
                onClick={() => {
                  setDayType(undo.dayType);
                  setUndo(null);
                }}
              >
                Undo
              </Button>
            </p>
          )}

          <div className="md:hidden">
            <Timeline
              blocks={blocks}
              gaps={gaps}
              onOpen={(b) => setEditor({ dayType: current, block: b })}
              onAddAt={(start, end) =>
                setEditor({ dayType: current, block: null, ...{ start, end } })
              }
            />
          </div>
          <div className="hidden md:block">
            <ScheduleGrid
              columns={dayTypes}
              selected={current.id}
              onSelectColumn={setSelected}
              onOpenBlock={(d, b) => setEditor({ dayType: d, block: b })}
            />
          </div>

          {warnings.length > 0 && (
            <div className="flex flex-col gap-3">
              {warnings.map((w) => (
                <WarningCard key={w.key} warning={w} />
              ))}
            </div>
          )}

          <div className="fixed inset-x-0 bottom-[7.25rem] z-20 px-4 md:static md:px-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button className="h-11 w-full shadow-sm md:w-auto" />}
              >
                <Plus /> Add block
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  render={
                    <Link
                      href={`/kids/${kid.id}/routine/practices?day=${current.id}`}
                    />
                  }
                >
                  From practices
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setEditor({ dayType: current, block: null })}
                >
                  Custom block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <BudgetCard kid={kid} />
      </main>
      <BudgetBar kid={kid} />

      <BlockEditor
        target={editor}
        onClose={() => setEditor(null)}
        onSave={onSave}
        onRemove={(blockId) => {
          setDayType(removeBlock(current, blockId));
          setEditor(null);
        }}
      />

      <Dialog open={copyOpen} onOpenChange={setCopyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy {current.label} to…</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            The chosen days become this day, edited in one place.
          </p>
          <ToggleGroup
            multiple
            value={copyTargets}
            onValueChange={(v) => setCopyTargets(v as Weekday[])}
            className="flex-wrap"
          >
            {WEEKDAYS.filter(
              (w) => !weekdaysOf(kid, current.id).includes(w),
            ).map((w) => (
              <ToggleGroupItem key={w} value={w} className="h-11 px-3">
                {WEEKDAY_LABELS[w]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <DialogFooter>
            <Button
              className="h-11"
              disabled={copyTargets.length === 0}
              onClick={() => {
                setKid((k) => copyDayTo(k, current.id, copyTargets));
                setCopyOpen(false);
              }}
            >
              Copy to {copyTargets.length}{" "}
              {copyTargets.length === 1 ? "day" : "days"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Timeline({
  blocks,
  gaps,
  onOpen,
  onAddAt,
}: {
  blocks: RoutineBlock[];
  gaps: { start: string; end: string }[];
  onOpen: (b: RoutineBlock) => void;
  onAddAt: (start: string, end: string) => void;
}) {
  const rows: React.ReactNode[] = [];
  blocks.forEach((b, i) => {
    const Icon = KIND_ICONS[b.kind];
    rows.push(
      <button
        key={b.id}
        type="button"
        onClick={() => onOpen(b)}
        className="focus-visible:ring-ring/50 w-full rounded-xl text-left outline-none focus-visible:ring-3"
      >
        <Card className={cn("py-3", b.kind === "screen" && "border-primary")}>
          <CardContent className="flex items-center gap-3 px-4">
            <span className="text-muted-foreground w-16 shrink-0 text-xs tabular-nums">
              {b.start}
              <br />
              {b.end === "24:00" ? "" : b.end}
            </span>
            <Icon className="text-muted-foreground size-5 shrink-0" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{b.title}</span>
              {b.kind === "screen" && (
                <span className="text-muted-foreground text-xs">
                  TV window follows this slot
                </span>
              )}
              {b.note && (
                <span className="text-muted-foreground truncate text-xs">
                  {b.note}
                </span>
              )}
            </span>
            <ChevronRight className="text-muted-foreground size-4 shrink-0" />
          </CardContent>
        </Card>
      </button>,
    );
    const gap = gaps.find((g) => g.start === b.end);
    if (gap && i < blocks.length - 1) {
      rows.push(
        <Button
          key={`gap-${gap.start}`}
          variant="ghost"
          className="text-muted-foreground h-11 w-full justify-start border border-dashed"
          onClick={() => onAddAt(gap.start, gap.end)}
        >
          <Plus /> {gap.start} to {gap.end}, free
        </Button>,
      );
    }
  });
  return <div className="flex flex-col gap-2">{rows}</div>;
}
