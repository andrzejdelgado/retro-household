import { ChannelsScreen } from "@/components/tv/channels-screen";

export default async function ChannelsPage({
  params,
}: PageProps<"/kids/[id]/channels">) {
  const { id } = await params;
  return <ChannelsScreen id={id} />;
}
