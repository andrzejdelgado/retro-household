import { ParentChrome } from "@/components/parent-chrome";
import { HouseholdProvider } from "@/lib/household/provider";

export default function ParentLayout({ children }: LayoutProps<"/">) {
  return (
    <HouseholdProvider>
      <ParentChrome>{children}</ParentChrome>
    </HouseholdProvider>
  );
}
