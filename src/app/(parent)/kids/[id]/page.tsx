import { KidOverview } from "@/components/kid-overview";

export default async function KidPage({ params }: PageProps<"/kids/[id]">) {
  const { id } = await params;
  return <KidOverview id={id} />;
}
