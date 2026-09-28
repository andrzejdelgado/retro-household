"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { budgetLeft } from "@/lib/accumulator/accumulator";
import { useHousehold } from "@/lib/household/provider";
import { KID_COLOUR_CLASS } from "@/lib/household/kid-view";
import type { Kid } from "@/lib/model/types";
import { cn } from "@/lib/utils";

/** T05: the parent records who else is watching (Cmd+K). The only TV surface with words. */
export function CoWatch({
  open,
  onOpenChange,
  host,
  kids,
  value,
  onChange,
  now,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  host: Kid;
  kids: Kid[];
  value: string[];
  onChange: (ids: string[]) => void;
  now: Date;
}) {
  const { household } = useHousehold();
  const others = kids.filter((k) => k.id !== host.id);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-[40px] leading-tight">
            Who is watching with {host.name}?
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {others.length === 0 && (
            <p className="text-muted-foreground text-[24px]">
              No other children in the household.
            </p>
          )}
          {others.map((k, i) => {
            const b = budgetLeft(k, household?.viewingLog ?? [], now);
            const note =
              b.capPerDay === 0
                ? `${k.name} has no screen budget at ${b.bracket.split("-")[0]}. Minutes here count as overage.`
                : b.leftToday <= 5
                  ? `${k.name} has ${Math.max(0, Math.round(b.leftToday))} minutes left today.`
                  : null;
            const on = value.includes(k.id);
            return (
              <Label
                key={k.id}
                className="flex items-center justify-between gap-4 rounded-xl border px-4 py-4"
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "size-6 rounded-full",
                      KID_COLOUR_CLASS[k.colour],
                    )}
                  />
                  <span className="flex flex-col">
                    <span className="text-[32px] leading-tight">{k.name}</span>
                    {note && (
                      <span className="text-muted-foreground text-[20px]">
                        {note}
                      </span>
                    )}
                  </span>
                </span>
                <Switch
                  autoFocus={i === 0}
                  className="scale-150"
                  checked={on}
                  onCheckedChange={(checked) =>
                    onChange(
                      checked
                        ? [...value, k.id]
                        : value.filter((id) => id !== k.id),
                    )
                  }
                />
              </Label>
            );
          })}
          <Button
            size="lg"
            className="h-14 self-end px-8 text-[24px]"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
