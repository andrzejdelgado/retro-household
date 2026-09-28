"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useHousehold } from "@/lib/household/provider";
import { setUnlocked } from "@/lib/household/unlock";

/** S19: says plainly what can and cannot be done. */
export function ForgotPasscode() {
  const { replace } = useHousehold();
  const router = useRouter();
  async function reset() {
    await replace(null);
    setUnlocked(false);
    router.replace("/passcode");
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          Forgot the passcode
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>
          The passcode lives only in this browser and nothing can verify who is
          asking. The only way past it is to reset everything, which deletes
          every kid, routine, channel and video.
        </p>
        <Button
          variant="secondary"
          className="h-11"
          render={<Link href="/passcode" />}
          nativeButton={false}
        >
          Back
        </Button>
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
                onClick={() => void reset()}
              >
                Delete everything and start over
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
