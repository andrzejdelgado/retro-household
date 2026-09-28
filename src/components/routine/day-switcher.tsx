"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Kid } from "@/lib/model/types";
import { orderedDayTypes } from "@/lib/routine/routine";

/** The day switcher (design system §3): one tab per day type, weekday names under the label. */
export function DaySwitcher({
  kid,
  selected,
  onSelect,
  onSplit,
  onCopy,
  onMerge,
}: {
  kid: Kid;
  selected: string;
  onSelect: (dayTypeId: string) => void;
  onSplit: (kind: "weekday" | "weekend") => void;
  onCopy: () => void;
  onMerge: (kind: "weekday" | "weekend") => void;
}) {
  const dayTypes = orderedDayTypes(kid);
  const current = dayTypes.find((d) => d.id === selected);
  const weekdaySplit = dayTypes.filter((d) => d.kind === "weekday").length > 1;
  const weekendSplit = dayTypes.filter((d) => d.kind === "weekend").length > 1;
  return (
    <div className="flex items-center gap-2 md:justify-end">
      <Tabs
        value={selected}
        onValueChange={(v) => onSelect(String(v))}
        className="min-w-0 flex-1 md:hidden"
      >
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          {dayTypes.map((d) => (
            <TabsTrigger key={d.id} value={d.id} className="h-9 px-3">
              {d.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Day actions"
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!weekdaySplit && (
            <DropdownMenuItem onClick={() => onSplit("weekday")}>
              Split weekdays
            </DropdownMenuItem>
          )}
          {!weekendSplit && (
            <DropdownMenuItem onClick={() => onSplit("weekend")}>
              Split weekend
            </DropdownMenuItem>
          )}
          {(weekdaySplit || weekendSplit) && current && (
            <DropdownMenuItem onClick={onCopy}>
              Copy this day to…
            </DropdownMenuItem>
          )}
          {weekdaySplit && (
            <DropdownMenuItem onClick={() => onMerge("weekday")}>
              Merge weekdays back
            </DropdownMenuItem>
          )}
          {weekendSplit && (
            <DropdownMenuItem onClick={() => onMerge("weekend")}>
              Merge weekend back
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
