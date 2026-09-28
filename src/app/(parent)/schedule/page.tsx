import { Suspense } from "react";
import { ScheduleTab } from "@/components/tv/schedule-tab";

export default function SchedulePage() {
  return (
    <Suspense>
      <ScheduleTab />
    </Suspense>
  );
}
