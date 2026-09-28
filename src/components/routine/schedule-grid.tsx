"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { minutesOf } from "@/lib/clock/clock";
import type { DayType, RoutineBlock } from "@/lib/model/types";
import { cn } from "@/lib/utils";
import { KIND_ICONS } from "./kind-icons";

const DAY_START = 6 * 60;
const DAY_END = 21 * 60;
const PX_PER_MIN = 1;
const TOP = 12;

/** Desktop: time rows by day-type columns, blocks as cards in the cells (D44, design system §6 S06). */
export function ScheduleGrid({
  columns,
  selected,
  onSelectColumn,
  onOpenBlock,
}: {
  columns: DayType[];
  selected: string;
  onSelectColumn: (id: string) => void;
  onOpenBlock: (dayType: DayType, block: RoutineBlock) => void;
}) {
  const hours = Array.from(
    { length: (DAY_END - DAY_START) / 60 + 1 },
    (_, i) => DAY_START + i * 60,
  );
  const height = (DAY_END - DAY_START) * PX_PER_MIN + TOP * 2;
  return (
    <ScrollArea className="h-[70vh] rounded-xl border">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `56px repeat(${columns.length}, minmax(160px, 1fr))`,
        }}
      >
        <div className="bg-background sticky top-0 z-10 border-b" />
        {columns.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelectColumn(d.id)}
            className={cn(
              "bg-background sticky top-0 z-10 h-11 border-b border-l px-3 text-left text-sm font-medium",
              d.id === selected && "text-primary",
            )}
          >
            {d.label}
          </button>
        ))}
        <div className="relative" style={{ height }}>
          {hours.map((h) => (
            <span
              key={h}
              className="text-muted-foreground absolute right-2 -translate-y-1/2 text-xs tabular-nums"
              style={{ top: (h - DAY_START) * PX_PER_MIN + TOP }}
            >
              {String(h / 60).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        {columns.map((d) => (
          <div key={d.id} className="relative border-l" style={{ height }}>
            {hours.map((h) => (
              <div
                key={h}
                className="border-border/60 absolute inset-x-0 border-t"
                style={{ top: (h - DAY_START) * PX_PER_MIN + TOP }}
              />
            ))}
            {d.blocks.map((b) => {
              const top =
                Math.max(0, minutesOf(b.start) - DAY_START) * PX_PER_MIN;
              const bottom = Math.min(DAY_END, minutesOf(b.end)) - DAY_START;
              const h = bottom * PX_PER_MIN + TOP - top;
              if (h <= 0) return null;
              const Icon = KIND_ICONS[b.kind];
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onOpenBlock(d, b)}
                  className={cn(
                    "bg-card hover:bg-accent/40 absolute inset-x-1 flex items-start gap-1.5 overflow-hidden rounded-md border px-2 py-1 text-left text-xs",
                    b.kind === "screen" && "border-primary",
                    b.kind === "sleep" && "bg-muted",
                  )}
                  style={{ top, height: h }}
                >
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span className="truncate">{b.title}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
