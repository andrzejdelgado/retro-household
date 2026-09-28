import { Suspense } from "react";
import { PracticesScreen } from "@/components/routine/practices-screen";

export default async function PracticesPage({
  params,
}: PageProps<"/kids/[id]/routine/practices">) {
  const { id } = await params;
  return (
    <Suspense>
      <PracticesScreen id={id} />
    </Suspense>
  );
}
