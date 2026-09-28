import { AppSidebar, BottomNav } from "@/components/app-shell";
import { HouseholdProvider } from "@/lib/household/provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function ParentLayout({ children }: LayoutProps<"/">) {
  return (
    <HouseholdProvider>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="pb-16 md:pb-0">{children}</SidebarInset>
          <BottomNav />
        </SidebarProvider>
      </TooltipProvider>
    </HouseholdProvider>
  );
}
