"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Printer, Trash2 } from "lucide-react";
import { TopBar } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MAJOR_RULES } from "@/content";
import { WEEKDAYS, type Weekday } from "@/lib/clock/clock";
import { useHousehold } from "@/lib/household/provider";
import { newId, type Window } from "@/lib/model/types";
import { WEEKDAY_LABELS } from "@/lib/routine/routine";

/** S13: the household's rules as selection tiles (D44), custom rules, and Wi-Fi off windows. */
export function RulesScreen() {
  const { household, update } = useHousehold();
  const [custom, setCustom] = React.useState("");
  if (!household) return null;
  const enabled = household.rules.filter((r) => r.enabled).map((r) => r.id);

  function setEnabled(ids: string[]) {
    update((h) => ({
      ...h,
      rules: h.rules.map((r) => ({ ...r, enabled: ids.includes(r.id) })),
    }));
  }
  function addCustom() {
    const text = custom.trim();
    if (!text) return;
    update((h) => ({
      ...h,
      rules: [
        ...h.rules,
        { id: newId(), ruleId: null, customText: text, enabled: true },
      ],
    }));
    setCustom("");
  }
  function setWifi(i: number, patch: Partial<Window>) {
    update((h) => ({
      ...h,
      wifiOffWindows: h.wifiOffWindows.map((w, j) =>
        j === i ? { ...w, ...patch } : w,
      ),
    }));
  }

  return (
    <>
      <TopBar title="Rules" />
      <main className="mx-auto w-full max-w-[1080px] px-4 py-6 pb-28 md:grid md:grid-cols-2 md:gap-6 md:px-6 md:pb-6">
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg">House rules</h2>
          <ToggleGroup
            multiple
            value={enabled}
            onValueChange={(v) => setEnabled(v as string[])}
            className="grid w-full grid-cols-1 gap-3"
            spacing={0}
            aria-label="House rules"
          >
            {household.rules.map((r) => {
              const major = r.ruleId
                ? MAJOR_RULES.find((m) => m.id === r.ruleId)
                : null;
              return (
                <ToggleGroupItem
                  key={r.id}
                  value={r.id}
                  className="bg-card data-pressed:border-primary data-pressed:bg-accent/40 h-auto w-full flex-col items-start gap-1 rounded-xl border p-4 text-left whitespace-normal"
                >
                  <span className="flex w-full items-start gap-2">
                    <span className="flex-1 font-medium">
                      {major ? major.title : r.customText}
                    </span>
                    {!major && (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="Remove rule"
                        className="text-muted-foreground hover:text-foreground -m-2 p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          update((h) => ({
                            ...h,
                            rules: h.rules.filter((x) => x.id !== r.id),
                          }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            update((h) => ({
                              ...h,
                              rules: h.rules.filter((x) => x.id !== r.id),
                            }));
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </span>
                    )}
                  </span>
                  {major && (
                    <span className="text-muted-foreground text-sm">
                      {major.detail.replace(/^,\s*/, "")}
                    </span>
                  )}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
          <div className="flex gap-2">
            <Input
              className="h-11"
              placeholder="Add a rule of your own"
              aria-label="Custom rule"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
            />
            <Button
              variant="secondary"
              className="h-11"
              disabled={!custom.trim()}
              onClick={addCustom}
            >
              <Plus /> Add
            </Button>
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-3 md:mt-0">
          <h2 className="font-heading text-lg">Wi-Fi off</h2>
          <p className="text-muted-foreground text-sm">
            Hours with the Wi-Fi off make &quot;work stops at pick-up&quot; and
            &quot;no phone overnight&quot; physical. Printed on the rules page.
          </p>
          {household.wifiOffWindows.map((w, i) => (
            <Card key={i} className="py-4">
              <CardContent className="flex flex-col gap-3 px-4">
                <ToggleGroup
                  multiple
                  value={w.days}
                  onValueChange={(v) =>
                    setWifi(i, {
                      days: WEEKDAYS.filter((d) =>
                        (v as Weekday[]).includes(d),
                      ),
                    })
                  }
                  className="grid w-full grid-cols-7 gap-1"
                  aria-label="Days"
                >
                  {WEEKDAYS.map((d) => (
                    <ToggleGroupItem
                      key={d}
                      value={d}
                      className="h-11 w-full min-w-0 px-0"
                    >
                      {WEEKDAY_LABELS[d].slice(0, 3)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`wifi-start-${i}`}>From</Label>
                    <Input
                      id={`wifi-start-${i}`}
                      type="time"
                      step={900}
                      className="h-11"
                      value={w.start}
                      onChange={(e) => setWifi(i, { start: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`wifi-end-${i}`}>Until</Label>
                    <Input
                      id={`wifi-end-${i}`}
                      type="time"
                      step={900}
                      className="h-11"
                      value={w.end === "24:00" ? "23:59" : w.end}
                      onChange={(e) =>
                        setWifi(i, {
                          end:
                            e.target.value === "23:59"
                              ? "24:00"
                              : e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-11"
                    aria-label="Remove window"
                    onClick={() =>
                      update((h) => ({
                        ...h,
                        wifiOffWindows: h.wifiOffWindows.filter(
                          (_, j) => j !== i,
                        ),
                      }))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="secondary"
            className="h-11 self-start"
            onClick={() =>
              update((h) => ({
                ...h,
                wifiOffWindows: [
                  ...h.wifiOffWindows,
                  { days: [...WEEKDAYS], start: "22:00", end: "24:00" },
                ],
              }))
            }
          >
            <Plus /> Add window
          </Button>
        </section>
      </main>
      <div className="bg-background fixed inset-x-0 bottom-14 z-20 border-t p-4 md:static md:mx-auto md:max-w-[1080px] md:border-0 md:bg-transparent md:px-6 md:pb-6">
        <Button
          className="h-11 w-full md:w-auto"
          render={<Link href="/print?page=rules" />}
          nativeButton={false}
        >
          <Printer /> Print rules page
        </Button>
      </div>
    </>
  );
}
