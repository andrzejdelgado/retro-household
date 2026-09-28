"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ageOn, bracketFor, isBeyondScope } from "@/lib/bracket/bracket";
import { useHousehold } from "@/lib/household/provider";
import {
  bracketLabel,
  KID_COLOUR_CLASS,
  KID_COLOUR_NAMES,
} from "@/lib/household/kid-view";
import { useNow } from "@/lib/household/use-now";
import type { Kid } from "@/lib/model/types";
import { createKid } from "@/lib/routine/routine";
import { cn } from "@/lib/utils";

const COLOURS: Kid["colour"][] = [1, 2, 3, 4, 5, 6];

/** S03: name, birthdate with the live bracket line, colour, and an optional PIN (D31). */
export function KidForm({ kid }: { kid?: Kid }) {
  const { household, update } = useHousehold();
  const router = useRouter();
  const now = useNow();
  const firstRun = !kid && household?.kids.length === 0;

  const [name, setName] = React.useState(kid?.name ?? "");
  const [birthdate, setBirthdate] = React.useState(kid?.birthdate ?? "");
  const [colour, setColour] = React.useState<Kid["colour"]>(
    kid?.colour ?? ((((household?.kids.length ?? 0) % 6) + 1) as Kid["colour"]),
  );
  const [pin, setPin] = React.useState(kid?.pin ?? "");
  const [formKey, setFormKey] = React.useState(0);

  const validDate =
    /^\d{4}-\d{2}-\d{2}$/.test(birthdate) &&
    !Number.isNaN(Date.parse(birthdate));
  const pinOk = pin.length === 0 || pin.length === 4;
  const canSave = name.trim().length > 0 && validDate && pinOk;
  const age = validDate ? ageOn(birthdate, now) : null;
  const bracket = validDate ? bracketFor(birthdate, now) : null;
  const beyond = validDate && isBeyondScope(birthdate, now);

  function save(andAnother: boolean) {
    if (!canSave) return;
    const input = {
      name: name.trim(),
      birthdate,
      pin: pin.length === 4 ? pin : null,
      colour,
    };
    if (kid) {
      update((h) => ({
        ...h,
        kids: h.kids.map((k) => (k.id === kid.id ? { ...k, ...input } : k)),
      }));
      router.push(`/kids/${kid.id}`);
      return;
    }
    const created = createKid(input, now);
    update((h) => ({ ...h, kids: [...h.kids, created] }));
    if (andAnother) {
      setName("");
      setBirthdate("");
      setPin("");
      setColour(
        ((((household?.kids.length ?? 0) + 1) % 6) + 1) as Kid["colour"],
      );
      setFormKey((k) => k + 1);
    } else {
      router.push(`/kids/${created.id}`);
    }
  }

  function remove() {
    if (!kid) return;
    update((h) => ({ ...h, kids: h.kids.filter((k) => k.id !== kid.id) }));
    router.push("/");
  }

  return (
    <form
      key={formKey}
      className="mx-auto w-full max-w-[480px]"
      onSubmit={(e) => {
        e.preventDefault();
        save(false);
      }}
    >
      {firstRun && (
        <div className="mb-6">
          <h1 className="font-heading text-4xl">Retro Household</h1>
          <p className="text-muted-foreground mt-2">
            Routines, rules and a TV schedule for a household with children
            under 8, printed for the fridge.
          </p>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {kid
              ? `Edit ${kid.name}`
              : firstRun
                ? "Add your first child"
                : "Add a child"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="kid-name">Name</Label>
            <Input
              id="kid-name"
              className="h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="kid-birthdate">Birthdate</Label>
            <Input
              id="kid-birthdate"
              className="h-11"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
            />
            <p className="text-muted-foreground text-sm" aria-live="polite">
              {validDate && bracket
                ? beyond
                  ? "Retro Household covers children under 8. Saved as bracket 7 to 8."
                  : `${name.trim() || "This child"} is ${age} · ${bracketLabel(bracket)}`
                : "The age sets every default."}
            </p>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Colour</legend>
            <RadioGroup
              value={String(colour)}
              onValueChange={(v) => setColour(Number(v) as Kid["colour"])}
              className="grid grid-cols-6 justify-items-center"
              aria-label="Colour"
            >
              {COLOURS.map((c) => (
                <RadioGroupItem
                  key={c}
                  value={String(c)}
                  aria-label={KID_COLOUR_NAMES[c]}
                  className={cn(
                    "data-checked:border-foreground size-11 border-2 border-transparent data-checked:bg-transparent",
                    KID_COLOUR_CLASS[c],
                    "data-checked:ring-0",
                  )}
                  style={{ backgroundColor: `var(--kid-${c})` }}
                />
              ))}
            </RadioGroup>
          </fieldset>
          <div className="flex flex-col gap-2">
            <Label htmlFor="kid-pin">PIN, optional</Label>
            <InputOTP
              id="kid-pin"
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
            <p className="text-muted-foreground text-sm">
              {pin.length > 0 && pin.length < 4
                ? "A PIN has four digits."
                : "For the TV app. You can set it later."}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button type="submit" className="h-11 w-full" disabled={!canSave}>
              Save
            </Button>
            {!kid && (
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-full"
                disabled={!canSave}
                onClick={() => save(true)}
              >
                Save and add another
              </Button>
            )}
          </div>
          {kid && (
            <>
              <Separator />
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-11"
                    />
                  }
                >
                  Remove {kid.name}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {kid.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Their routines, channels and viewing log go with them.
                      Printed pages stay on the fridge.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={remove}>
                      Remove {kid.name}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
