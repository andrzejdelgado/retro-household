import { ChannelEditorScreen } from "@/components/tv/channel-editor-screen";

export default async function ChannelPage({
  params,
}: PageProps<"/kids/[id]/channels/[channelId]">) {
  const { id, channelId } = await params;
  return <ChannelEditorScreen kidId={id} channelId={channelId} />;
}
