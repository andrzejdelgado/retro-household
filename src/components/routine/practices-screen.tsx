"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { TopBar } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DOMAIN_TITLES,
  PRACTICES,
  bracketsInRange,
  getPractices,
  type Domain,
} from "@/content";
import { bracketFor } from "@/lib/bracket/bracket";
import { useHousehold } from "@/lib/household/provider";
import { useNow } from "@/lib/household/use-now";
import type { DayType, Kid } from "@/lib/model/types";
import { addPractice } from "@/lib/routine/routine";

const DOMAINS = Object.keys(DOMAIN_TITLES) as Domain[];

/** S07: pick best practice for this kid's age as selection tiles, "Add (n selected)" (D44). */
export function PracticesScreen({ id }: { id: string }) {
  const { household, update } = useHousehold();
  const now = useNow();
  const router = useRouter();
  const params = useSearchParams();
  const kid = household?.kids.find((k) => k.id === id);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [allAges, setAllAges] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  if (!household || !kid) return null;

  const dayType: DayType =
    kid.dayTypes.find((d) => d.id === params.get("day")) ?? kid.dayTypes[0];
  const bracket = bracketFor(kid.birthdate, now);
  const age = Number(bracket.split("-")[0]);
  const inRoutine = new Set(
    dayType.blocks.map((b) => b.practiceId).filter(Boolean),
  );
  const back = `/kids/${kid.id}/routine?day=${dayType.id}`;

  function add() {
    let dt = dayType;
    for (const pid of selected) {
      const practice = PRACTICES.find((p) => p.id === pid)!;
      const r = addPractice(dt, practice);
      if (!r.ok) {
        setMessage(r.refused);
        break;
      }
      dt = r.value;
    }
    const next = dt;
    update((h) => ({
      ...h,
      kids: h.kids.map((k: Kid) =>
        k.id === kid!.id
          ? {
              ...k,
              dayTypes: k.dayTypes.map((d) => (d.id === next.id ? next : d)),
            }
          : k,
      ),
    }));
    router.push(back);
  }

  return (
    <>
      <TopBar title="Practices" />
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 py-6 pb-32 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            For {kid.name}, age {age}, on {dayType.label}.{" "}
            <Link
              href={back}
              className="text-primary underline-offset-4 hover:underline"
            >
              Back to the routine
            </Link>
          </p>
          <Label className="flex items-center gap-2 text-sm">
            <Switch checked={allAges} onCheckedChange={setAllAges} />
            Show all ages
          </Label>
        </div>
        <Tabs defaultValue={DOMAINS[0]}>
          <TabsList className="h-auto w-full justify-start overflow-x-auto">
            {DOMAINS.map((d) => (
              <TabsTrigger key={d} value={d} className="h-11 px-3">
                {DOMAIN_TITLES[d]}
              </TabsTrigger>
            ))}
          </TabsList>
          {DOMAINS.map((d) => {
            const items = allAges
              ? PRACTICES.filter((p) => p.domain === d)
              : getPractices(bracket, d);
            return (
              <TabsContent key={d} value={d} className="pt-3">
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nothing recommended in this domain before age{" "}
                    {Math.min(
                      ...PRACTICES.filter((p) => p.domain === d).map(
                        (p) => p.ages[0],
                      ),
                    )}
                    .
                  </p>
                ) : (
                  <ToggleGroup
                    multiple
                    value={selected}
                    onValueChange={(v) => setSelected(v as string[])}
                    className="grid w-full grid-cols-1 gap-3 md:grid-cols-3"
                    spacing={0}
                  >
                    {items.map((p) => {
                      const added = inRoutine.has(p.id);
                      const fits = bracketsInRange(p.ages).includes(bracket);
                      return (
                        <ToggleGroupItem
                          key={p.id}
                          value={p.id}
                          disabled={added}
                          className="bg-card data-pressed:border-primary data-pressed:bg-accent/40 h-auto w-full flex-col items-start gap-1 rounded-xl border p-4 text-left whitespace-normal"
                        >
                          <span className="flex w-full items-start gap-2">
                            <span className="flex-1 font-medium">
                              {p.title}
                            </span>
                            {added && (
                              <Check className="text-primary size-4 shrink-0" />
                            )}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {p.duration}
                            {!fits && ` · ages ${p.ages[0]} to ${p.ages[1]}`}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {p.detail}
                          </span>
                          <span className="text-xs">
                            <span className="font-medium">Why: </span>
                            {p.why}{" "}
                            <Link
                              href="/sources"
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              Source
                            </Link>
                          </span>
                        </ToggleGroupItem>
                      );
                    })}
                  </ToggleGroup>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
        {message && (
          <p className="text-sm" role="alert">
            {message}
          </p>
        )}
      </main>
      <div className="bg-background fixed inset-x-0 bottom-14 z-20 border-t p-4 md:static md:border-0 md:bg-transparent md:p-0 md:px-6">
        <Button
          className="h-11 w-full md:w-auto"
          disabled={selected.length === 0}
          onClick={add}
        >
          Add ({selected.length} selected)
        </Button>
      </div>
    </>
  );
}
