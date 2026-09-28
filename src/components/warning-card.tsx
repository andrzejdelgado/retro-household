"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useHousehold } from "@/lib/household/provider";
import { dismiss, type Warning } from "@/lib/warnings/warnings";

/**
 * One sentence, consequence first, then the fixes, then dismiss (docs/06-screen-specs.md §1).
 * `primaryFirst` styles the first fix as the card's primary, for screens with no primary of their own (D32).
 */
export function WarningCard({
  warning,
  primaryFirst = false,
}: {
  warning: Warning;
  primaryFirst?: boolean;
}) {
  const { update } = useHousehold();
  return (
    <Alert className="border-l-warning border-l-4">
      <AlertDescription className="text-foreground">
        {warning.message}
      </AlertDescription>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {warning.fixes.map((fix, i) => (
          <span key={fix.id} className="flex flex-col gap-0.5">
            <Button
              size="sm"
              variant={primaryFirst && i === 0 ? "default" : "secondary"}
              disabled={Boolean(fix.disabled)}
              onClick={() => update((h) => fix.apply(h))}
            >
              {fix.label}
            </Button>
            {fix.disabled && (
              <span className="text-muted-foreground text-xs">
                {fix.disabled}
              </span>
            )}
          </span>
        ))}
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
          onClick={() => update((h) => dismiss(h, warning.key))}
        >
          Dismiss
        </Button>
      </div>
    </Alert>
  );
}
