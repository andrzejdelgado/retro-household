"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HouseholdChannelsScreen } from "./household-channels-screen";
import { LibraryScreen } from "./library-screen";
import { TimelineScreen } from "./timeline-screen";

/** The TV tab: Timeline (S11), Channels (S20) and Library (S12) as views (D42). */
export function ScheduleTab() {
  const params = useSearchParams();
  const router = useRouter();
  const view = params.get("view") ?? "timeline";
  return (
    <>
      <TopBar title="TV" />
      <main className="mx-auto w-full max-w-[1080px] px-4 py-6 md:px-6">
        <Tabs
          value={view}
          onValueChange={(v) => router.replace(`/schedule?view=${v}`)}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="timeline" className="h-9 px-3">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="channels" className="h-9 px-3">
              Channels
            </TabsTrigger>
            <TabsTrigger value="library" className="h-9 px-3">
              Library
            </TabsTrigger>
          </TabsList>
          <TabsContent value="timeline">
            <TimelineScreen />
          </TabsContent>
          <TabsContent value="channels">
            <HouseholdChannelsScreen />
          </TabsContent>
          <TabsContent value="library">
            <LibraryScreen embedded />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
