"use client";

import * as React from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { TopBar } from "@/components/app-shell";
import { BudgetBar, BudgetCard } from "@/components/budget-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WarningCard } from "@/components/warning-card";
import {
  getCap,
  getTechStages,
  opensAt,
  type CountableTech,
  type Tech,
  resolvedDepth,
} from "@/content";
import { WEEKDAYS, type Weekday } from "@/lib/clock/clock";
import { useHousehold } from "@/lib/household/provider";
import { kidView } from "@/lib/household/kid-view";
import { useNow } from "@/lib/household/use-now";
import type { Allowance, Kid } from "@/lib/model/types";
import { WEEKDAY_LABELS } from "@/lib/routine/routine";
import { logFor } from "@/lib/viewing/viewing";

/** The age a countable technology first has an allowance, from its rows. */
function opensForCountable(tech: Tech): number | null {
  return tech.rows.find((r) => r.allowance)?.ages[0] ?? opensAt(tech);
}

/** S08: every technology for this kid's age against the cap, with inline warnings (R2). */
export function ScreenTimeScreen({ id }: { id: string }) {
  const { household, update } = useHousehold();
  const now = useNow();
  const kid = household?.kids.find((k) => k.id === id);
  const [draft, setDraft] = React.useState<Allowance[] | null>(null);
  if (!household || !kid) return null;

  const v = kidView(household, kid, now);
  const cap = getCap(v.bracket);
  const stages = getTechStages(v.bracket);
  const allowances = draft ?? kid.allowances;
  const dirty = draft !== null;
  const warnings = v.warnings.filter((w) =>
    ["W01", "W02", "W03", "W04", "W05"].includes(w.code),
  );
  const log = logFor(household, kid.id);

  function setAllowance(tech: CountableTech, patch: Partial<Allowance>) {
    setDraft((d) =>
      (d ?? kid!.allowances).map((a) =>
        a.tech === tech ? { ...a, ...patch } : a,
      ),
    );
  }
  function save() {
    if (!draft) return;
    update((h) => ({
      ...h,
      kids: h.kids.map((k: Kid) =>
        k.id === kid!.id ? { ...k, allowances: draft } : k,
      ),
    }));
    setDraft(null);
  }

  return (
    <>
      <TopBar title={`${kid.name}'s screen time`} />
      <main className="mx-auto w-full max-w-[1080px] px-4 py-6 md:grid md:grid-cols-[minmax(0,720px)_320px] md:gap-6 md:px-6">
        <div className="flex flex-col gap-4 pb-32 md:pb-0">
          <p className="flex items-start gap-2">
            <span>
              {cap.minutesPerDay === 0
                ? `No screen time is recommended at ${v.age}.`
                : `At ${v.age} the recommended ceiling is ${cap.minutesPerDay} minutes a day and ${cap.minutesPerWeek / 60} hours a week, on at most ${cap.maxDaysPerWeek} days${cap.noConsecutiveDays ? ", never two days in a row" : ""}.`}
            </span>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-11 shrink-0"
                    aria-label="Why"
                  />
                }
              >
                <Info className="size-5" />
              </PopoverTrigger>
              <PopoverContent className="max-w-xs text-sm">
                The total screen budget is a hard ceiling across every screen
                technology combined. Video calls and screen-free audio do not
                count. The weekly cap wins over the daily cap.{" "}
                <Link
                  href="/sources"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sources
                </Link>
              </PopoverContent>
            </Popover>
          </p>

          <div className="flex flex-col gap-3">
            {stages.map(({ tech, row }) => {
              const countable = tech.countsAs;
              const allowance = countable
                ? allowances.find((a) => a.tech === countable)
                : null;
              const open = row?.allowance !== undefined;
              const opens = countable ? opensForCountable(tech) : opensAt(tech);
              const closed =
                !row || row.duration === "0" || row.duration === "0 at home";
              return (
                <Card key={tech.id} className="py-4">
                  <CardContent className="flex flex-col gap-2 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tech.title}</span>
                      {closed && opens !== null && (
                        <Badge variant="secondary" className="ml-auto">
                          opens at {opens}
                        </Badge>
                      )}
                      {closed && opens === null && (
                        <Badge variant="secondary" className="ml-auto">
                          not in childhood
                        </Badge>
                      )}
                    </div>
                    {row && (
                      <p className="text-muted-foreground text-sm">
                        {resolvedDepth(tech, row)}
                        {row.duration && !closed ? ` · ${row.duration}` : ""}
                      </p>
                    )}
                    {countable === "longform" && !closed && (
                      <p className="text-sm">
                        Set by the TV schedule.{" "}
                        <Link
                          href={`/kids/${kid.id}/channels`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          Channels
                        </Link>
                      </p>
                    )}
                    {countable &&
                      countable !== "longform" &&
                      open &&
                      allowance && (
                        <div className="flex flex-col gap-3 pt-1">
                          <p className="text-sm">
                            Recommended up to {row?.allowance?.minutesPerDay}{" "}
                            min on {row?.allowance?.daysPerWeek} days a week.
                            Starts at none until you plan it.
                          </p>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`${tech.id}-minutes`}>
                              Minutes a day
                            </Label>
                            <Input
                              id={`${tech.id}-minutes`}
                              type="number"
                              inputMode="numeric"
                              min={0}
                              step={5}
                              className="h-11 w-32 tabular-nums"
                              value={allowance.minutesPerDay}
                              onChange={(e) =>
                                setAllowance(countable, {
                                  minutesPerDay: Math.max(
                                    0,
                                    Number(e.target.value) || 0,
                                  ),
                                })
                              }
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Days</Label>
                            <ToggleGroup
                              multiple
                              value={allowance.days}
                              onValueChange={(v) =>
                                setAllowance(countable, {
                                  days: v as Weekday[],
                                })
                              }
                              className="grid w-full grid-cols-7 gap-1"
                              aria-label={`Days for ${tech.title}`}
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
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {warnings.length > 0 && (
            <div className="flex flex-col gap-3">
              {warnings.map((w) => (
                <WarningCard key={w.key} warning={w} />
              ))}
            </div>
          )}

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg">Viewing log</h2>
            {log.length === 0 ? (
              <p className="text-muted-foreground text-sm">No viewing yet.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm tabular-nums">
                {log.map((e) => {
                  const show = household.shows.find((s) => s.id === e.showId);
                  return (
                    <li key={e.id} className="flex gap-3">
                      <span className="text-muted-foreground w-24">
                        {e.date}
                      </span>
                      <span className="flex-1 truncate">
                        {show?.title ?? "Unknown show"}
                      </span>
                      <span>{Math.round(e.seconds / 60)} min</span>
                      {e.coWatch && (
                        <span className="text-muted-foreground">together</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="bg-background fixed inset-x-0 bottom-[7rem] z-20 border-t p-4 md:static md:border-0 md:bg-transparent md:p-0">
            <Button
              className="h-11 w-full md:w-auto"
              disabled={!dirty}
              onClick={save}
            >
              Save
            </Button>
          </div>
        </div>
        <BudgetCard kid={kid} />
      </main>
      <BudgetBar kid={kid} />
    </>
  );
}
