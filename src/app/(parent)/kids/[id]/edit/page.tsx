import { EditKid } from "@/components/edit-kid";

export default async function EditKidPage({
  params,
}: PageProps<"/kids/[id]/edit">) {
  const { id } = await params;
  return <EditKid id={id} />;
}
