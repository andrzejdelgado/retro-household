import { Suspense } from "react";
import { RoutineScreen } from "@/components/routine/routine-screen";

export default async function RoutinePage({
  params,
}: PageProps<"/kids/[id]/routine">) {
  const { id } = await params;
  return (
    <Suspense>
      <RoutineScreen id={id} />
    </Suspense>
  );
}
