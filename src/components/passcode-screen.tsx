"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Skeleton } from "@/components/ui/skeleton";
import { useHousehold } from "@/lib/household/provider";
import { setUnlocked } from "@/lib/household/unlock";
import { emptyHousehold } from "@/lib/seed/empty";

/** S18: set mode on first run, enter mode afterwards (D40). Four to six digits. */
export function PasscodeScreen() {
  const { status, household, replace } = useHousehold();
  const router = useRouter();
  const [first, setFirst] = React.useState("");
  const [value, setValue] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);

  if (status === "loading") return <Skeleton className="h-64 w-full" />;
  const setMode = !household;
  const repeating = setMode && first.length > 0;

  async function submit(code: string) {
    if (setMode) {
      if (!repeating) {
        setFirst(code);
        setValue("");
        setMessage(null);
        return;
      }
      if (code !== first) {
        setFirst("");
        setValue("");
        setMessage("The two entries differ. Try again.");
        return;
      }
      await replace({ ...emptyHousehold(), passcode: code });
      setUnlocked(true);
      router.replace("/kids/new");
      return;
    }
    if (household!.passcode === null || code === household!.passcode) {
      setUnlocked(true);
      router.replace("/");
      return;
    }
    setValue("");
    setMessage("That is not the passcode.");
  }

  const title = setMode
    ? repeating
      ? "Repeat it"
      : "Choose a parent passcode"
    : "Enter the parent passcode";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-4xl">Retro Household</h1>
        <p className="text-muted-foreground mt-2">
          Routines, rules and a TV schedule for a household with children under
          8, printed for the fridge.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={value}
            onChange={setValue}
            inputMode="numeric"
            autoFocus
            aria-label={title}
            onComplete={(code: string) => {
              if (
                !setMode &&
                household?.passcode &&
                code.length === household.passcode.length
              )
                void submit(code);
            }}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="size-11 text-base" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {message ?? "Four to six digits."}
          </p>
          <Button
            className="h-11 w-full"
            disabled={value.length < 4}
            onClick={() => void submit(value)}
          >
            Continue
          </Button>
          {!setMode && (
            <Button
              variant="link"
              render={<Link href="/passcode/forgot" />}
              nativeButton={false}
            >
              Forgot the passcode?
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
