"use client";

import * as React from "react";
import Link from "next/link";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Plus } from "lucide-react";
import { TopBar } from "@/components/app-shell";
import { BudgetBar, BudgetCard } from "@/components/budget-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { WarningCard } from "@/components/warning-card";
import { getCap } from "@/content";
import { useHousehold } from "@/lib/household/provider";
import { kidView } from "@/lib/household/kid-view";
import { useNow } from "@/lib/household/use-now";
import { WEEKDAY_LABELS } from "@/lib/routine/routine";
import { programmeFor } from "@/lib/schedule/schedule";
import { ChannelIcon } from "./channel-icons";

/** S09: a kid's up to four channels, with the inline PIN ask before the first one (D31). */
export function ChannelsScreen({ id }: { id: string }) {
  const { household, update } = useHousehold();
  const now = useNow();
  const [pin, setPin] = React.useState("");
  const kid = household?.kids.find((k) => k.id === id);
  if (!household || !kid) return null;
  const v = kidView(household, kid, now);
  const closed = getCap(v.bracket).minutesPerDay === 0;
  const needsPin = kid.pin === null;
  const full = kid.channels.length >= 4;
  const warnings = v.warnings.filter(
    (w) => w.code === "W05" || w.code === "W11",
  );

  return (
    <>
      <TopBar title={`${kid.name}'s channels`} />
      <main className="mx-auto w-full max-w-[1080px] px-4 py-6 md:grid md:grid-cols-[minmax(0,720px)_320px] md:gap-6 md:px-6">
        <div className="flex flex-col gap-4 pb-32 md:pb-0">
          {needsPin && (
            <Card>
              <CardContent className="flex flex-col gap-3">
                <Label htmlFor="channels-pin">
                  Needed so the TV knows whose channels these are.
                </Label>
                <div className="flex flex-wrap items-center gap-3">
                  <InputOTP
                    id="channels-pin"
                    maxLength={4}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={pin}
                    onChange={setPin}
                    inputMode="numeric"
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="size-11 text-base"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  <Button
                    className="h-11"
                    disabled={pin.length !== 4}
                    onClick={() => {
                      update((h) => ({
                        ...h,
                        kids: h.kids.map((k) =>
                          k.id === kid.id ? { ...k, pin } : k,
                        ),
                      }));
                      setPin("");
                    }}
                  >
                    Set PIN
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {kid.channels.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col gap-2">
                <p>
                  No channels yet. A channel is a set of shows that plays at a
                  fixed time, like television used to.
                </p>
                {closed && (
                  <p className="text-muted-foreground text-sm">
                    No screen time is recommended under 3. You can still add a
                    channel; the app will show what it means.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {kid.channels.map((c) => {
                const win = c.windows[0];
                const unprogrammed = win
                  ? win.days.filter((d) => programmeFor(c, d).length === 0)
                      .length
                  : 0;
                return (
                  <Link
                    key={c.id}
                    href={`/kids/${kid.id}/channels/${c.id}`}
                    className="focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-3"
                  >
                    <Card className="hover:bg-accent/40 h-full py-4 transition-colors">
                      <CardContent className="flex flex-col gap-2 px-4">
                        <div className="flex items-center gap-2">
                          <ChannelIcon
                            icon={c.icon}
                            className="size-10 shrink-0"
                          />
                          <span className="truncate font-medium">{c.name}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {win
                            ? `${win.days.map((d) => WEEKDAY_LABELS[d].slice(0, 3)).join(" ")} · ${win.start} to ${win.end}`
                            : "No window yet"}
                        </span>
                        {unprogrammed > 0 && (
                          <Badge variant="secondary">
                            {unprogrammed} days with nothing to play
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="flex flex-col gap-3">
              {warnings.map((w) => (
                <WarningCard key={w.key} warning={w} />
              ))}
            </div>
          )}

          <div className="bg-background fixed inset-x-0 bottom-[7rem] z-20 border-t p-4 md:static md:border-0 md:bg-transparent md:p-0">
            <Button
              className="h-11 w-full md:w-auto"
              disabled={full || needsPin}
              render={<Link href={`/kids/${kid.id}/channels/new`} />}
              nativeButton={false}
            >
              <Plus /> Add channel
            </Button>
            {full && (
              <p className="text-muted-foreground mt-1 text-xs">
                Four channels is the limit.
              </p>
            )}
          </div>
        </div>
        <BudgetCard kid={kid} />
      </main>
      <BudgetBar kid={kid} />
    </>
  );
}
