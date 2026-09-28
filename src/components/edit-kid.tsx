"use client";

import { TopBar } from "@/components/app-shell";
import { KidForm } from "@/components/kid-form";
import { useHousehold } from "@/lib/household/provider";

export function EditKid({ id }: { id: string }) {
  const { household } = useHousehold();
  const kid = household?.kids.find((k) => k.id === id);
  if (!kid) return null;
  return (
    <>
      <TopBar title={`Edit ${kid.name}`} />
      <main className="mx-auto w-full max-w-[720px] px-4 py-6 md:px-6">
        <KidForm kid={kid} />
      </main>
    </>
  );
}
