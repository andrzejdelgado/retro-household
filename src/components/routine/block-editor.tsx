"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICES, type BlockKind } from "@/content";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DayType, RoutineBlock } from "@/lib/model/types";
import { editBlock, insertBlock, type Result } from "@/lib/routine/routine";
import { KIND_LABELS } from "./kind-icons";

const CUSTOM_KINDS: BlockKind[] = [
  "care",
  "outdoors",
  "play",
  "reading",
  "chores",
  "independence",
  "emotional",
  "family",
  "screen",
  "away",
];

export type EditorTarget = {
  dayType: DayType;
  block: RoutineBlock | null;
  /** Prefilled times when adding into a gap. */
  start?: string;
  end?: string;
};

type Handlers = {
  onClose: () => void;
  onSave: (result: Result<DayType>) => boolean;
  onRemove: (blockId: string) => void;
};

/**
 * The block sheet: Drawer on mobile, Sheet on desktop (design system §3). Saving applies the
 * ripple rule (D28, D45); a refusal shows inline with its reason. The form is keyed on its
 * target so a new block or gap starts with fresh state.
 */
export function BlockEditor({
  target,
  ...handlers
}: { target: EditorTarget | null } & Handlers) {
  if (!target) return null;
  return (
    <BlockForm
      key={`${target.dayType.id}:${target.block?.id ?? "new"}:${target.start ?? ""}`}
      target={target}
      {...handlers}
    />
  );
}

function BlockForm({
  target,
  onClose,
  onSave,
  onRemove,
}: { target: EditorTarget } & Handlers) {
  const mobile = useIsMobile();
  const block = target.block;
  const [start, setStart] = React.useState(
    block?.start ?? target.start ?? "16:30",
  );
  const [end, setEnd] = React.useState(block?.end ?? target.end ?? "17:00");
  const [title, setTitle] = React.useState(block?.title ?? "");
  const [note, setNote] = React.useState(block?.note ?? "");
  const [kind, setKind] = React.useState<BlockKind>(block?.kind ?? "play");
  const [refused, setRefused] = React.useState<string | null>(null);
  const practice = block?.practiceId
    ? PRACTICES.find((p) => p.id === block.practiceId)
    : null;

  function save() {
    const result = block
      ? editBlock(target.dayType, block.id, {
          start,
          end,
          title: title.trim() || block.title,
          note: note || null,
        })
      : insertBlock(target.dayType, {
          start,
          end,
          title: title.trim() || KIND_LABELS[kind],
          kind,
          practiceId: null,
          note: note || null,
          fromTemplate: false,
        });
    if (!result.ok) {
      setRefused(result.refused);
      return;
    }
    if (onSave(result)) onClose();
  }

  const body = (
    <div className="flex flex-col gap-4 px-4 pb-6 md:px-0">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="block-start">Start</Label>
          <Input
            id="block-start"
            type="time"
            step={900}
            className="h-11"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="block-end">End</Label>
          <Input
            id="block-end"
            type="time"
            step={900}
            className="h-11"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="block-title">Title</Label>
        <Input
          id="block-title"
          className="h-11"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      {!block && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="block-kind">Kind</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as BlockKind)}>
            <SelectTrigger id="block-kind" className="h-11 w-full">
              <SelectValue>{KIND_LABELS[kind]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CUSTOM_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="block-note">Note</Label>
        <Textarea
          id="block-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>
      {practice && (
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">Why: </span>
          {practice.why} <span className="italic">({practice.duration})</span>
        </p>
      )}
      {refused && (
        <p className="text-sm" role="alert">
          {refused}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Button className="h-11" onClick={save}>
          Save
        </Button>
        {block && block.kind !== "sleep" && (
          <Button
            variant="ghost"
            className="h-11"
            onClick={() => onRemove(block.id)}
          >
            Remove block
          </Button>
        )}
      </div>
    </div>
  );

  const heading = block ? block.title : "Custom block";
  return mobile ? (
    <Drawer open onOpenChange={(o) => !o && onClose()} showSwipeHandle>
      <DrawerContent className="max-h-[90dvh]">
        <DrawerHeader>
          <DrawerTitle>{heading}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto">{body}</div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{heading}</SheetTitle>
        </SheetHeader>
        <div className="px-4">{body}</div>
      </SheetContent>
    </Sheet>
  );
}
