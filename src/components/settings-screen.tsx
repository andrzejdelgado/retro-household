"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { TopBar } from "@/components/app-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHousehold } from "@/lib/household/provider";
import { setUnlocked } from "@/lib/household/unlock";
import { seedHousehold } from "@/lib/seed/seed";

/** S15: the few switches the household has. */
export function SettingsScreen() {
  const { household, update, replace } = useHousehold();
  const router = useRouter();
  const [name, setName] = React.useState<string | null>(null);
  const [newCode, setNewCode] = React.useState("");
  const [repeat, setRepeat] = React.useState("");
  const [codeMessage, setCodeMessage] = React.useState<string | null>(null);
  if (!household) return null;
  const nameValue = name ?? household.name;

  function savePasscode() {
    if (newCode.length < 4) return;
    if (newCode !== repeat) {
      setCodeMessage("The two entries differ. Try again.");
      return;
    }
    update((h) => ({ ...h, passcode: newCode }));
    setNewCode("");
    setRepeat("");
    setCodeMessage("Passcode changed.");
  }

  return (
    <>
      <TopBar title="Settings" />
      <main className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-4 py-6 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Household</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Label htmlFor="household-name">Name</Label>
            <div className="flex gap-2">
              <Input
                id="household-name"
                className="h-11"
                value={nameValue}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                className="h-11"
                disabled={
                  name === null || name.trim() === "" || name === household.name
                }
                onClick={() => {
                  update((h) => ({ ...h, name: nameValue.trim() }));
                  setName(null);
                }}
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="flex items-center justify-between gap-3">
              <span className="flex flex-col">
                <span>Hide all warnings</span>
                <span className="text-muted-foreground text-sm font-normal">
                  Budgets are still shown.
                </span>
              </span>
              <Switch
                checked={household.settings.warningsMuted}
                onCheckedChange={(checked) =>
                  update((h) => ({
                    ...h,
                    settings: { ...h.settings, warningsMuted: checked },
                  }))
                }
              />
            </Label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Passcode</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Label>New passcode</Label>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={newCode}
              onChange={setNewCode}
              inputMode="numeric"
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="size-11 text-base"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Label>Repeat it</Label>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={repeat}
              onChange={setRepeat}
              inputMode="numeric"
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="size-11 text-base"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {codeMessage && (
              <p className="text-muted-foreground text-sm">{codeMessage}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                className="h-11"
                disabled={newCode.length < 4 || repeat.length < 4}
                onClick={savePasscode}
              >
                Change passcode
              </Button>
              <Button
                variant="secondary"
                className="h-11"
                onClick={() => {
                  setUnlocked(false);
                  router.replace("/passcode");
                }}
              >
                Lock now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Demo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="demo-clock">Demo clock</Label>
              <div className="flex gap-2">
                <Input
                  id="demo-clock"
                  type="datetime-local"
                  className="h-11"
                  value={household.settings.demoClock ?? ""}
                  onChange={(e) =>
                    update((h) => ({
                      ...h,
                      settings: {
                        ...h.settings,
                        demoClock: e.target.value || null,
                      },
                    }))
                  }
                />
                <Button
                  variant="ghost"
                  className="h-11"
                  disabled={!household.settings.demoClock}
                  onClick={() =>
                    update((h) => ({
                      ...h,
                      settings: { ...h.settings, demoClock: null },
                    }))
                  }
                >
                  Clear
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Shown as a banner on every screen while set.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="secondary" className="h-11" />}
              >
                Load demo household
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Replace everything with the demo household?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Miranda and John, with Grace (2), Henry (4) and Ella (7),
                    channels and rules. The passcode becomes 1234. Your current
                    data is deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep mine</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await replace(seedHousehold(new Date()));
                      router.push("/");
                    }}
                  >
                    Load the demo household
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="destructive" className="h-11" />}
              >
                Reset everything
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete everything?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Every kid, routine, channel and video in this browser is
                    deleted. There is no undo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep everything</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={async () => {
                      await replace(null);
                      setUnlocked(false);
                      router.replace("/passcode");
                    }}
                  >
                    Delete everything and start over
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-sm">
          <Link
            href="/sources"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sources
          </Link>{" "}
          · Retro Household keeps everything in this browser. Nothing leaves it.
        </p>
      </main>
    </>
  );
}
