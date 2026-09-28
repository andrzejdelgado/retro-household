import { ScreenTimeScreen } from "@/components/screen-time-screen";

export default async function ScreenTimePage({
  params,
}: PageProps<"/kids/[id]/screen-time">) {
  const { id } = await params;
  return <ScreenTimeScreen id={id} />;
}
