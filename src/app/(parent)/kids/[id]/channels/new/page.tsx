import { ChannelEditorScreen } from "@/components/tv/channel-editor-screen";

export default async function NewChannelPage({
  params,
}: PageProps<"/kids/[id]/channels/new">) {
  const { id } = await params;
  return <ChannelEditorScreen kidId={id} channelId={null} />;
}
