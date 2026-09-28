"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, ListChecks, Settings, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useHousehold } from "@/lib/household/provider";
import { useNow } from "@/lib/household/use-now";
import { visibleWarnings } from "@/lib/warnings/warnings";
import { cn } from "@/lib/utils";

// The four tabs of the parent app (docs/06-screen-specs.md §2). Kids are reached from Home.
const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/schedule", label: "TV", icon: Tv },
  { href: "/rules", label: "Rules", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="none" className="hidden h-dvh border-r md:flex">
      <SidebarHeader className="px-4 py-5">
        <span className="font-heading text-lg">Retro Household</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={isActive(pathname, href)}
                  render={<Link href={href} />}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// A plain nav, not a Tabs component: navigation needs no component change (design system §5).
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="bg-background fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t md:hidden"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Button
            key={href}
            variant="ghost"
            className={cn(
              "h-14 flex-col gap-0.5 rounded-none text-xs",
              active && "text-primary",
            )}
            aria-current={active ? "page" : undefined}
            nativeButton={false}
            render={<Link href={href} />}
          >
            <Icon className="size-6" />
            <span>{label}</span>
          </Button>
        );
      })}
    </nav>
  );
}

// The only header control is the bell, which opens the warnings list (D41).
export function TopBar({ title }: { title: string }) {
  const { household } = useHousehold();
  const now = useNow();
  const pathname = usePathname();
  const warningCount = household ? visibleWarnings(household, now).length : 0;
  // First run: nothing above the form but the product name (D36).
  if (household && household.kids.length === 0 && pathname === "/kids/new")
    return null;
  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 md:px-6">
      <h1 className="font-heading text-2xl">{title}</h1>
      <Button
        variant="ghost"
        size="icon"
        className="relative size-11"
        aria-label={
          warningCount
            ? `${warningCount} warnings need your attention`
            : "No warnings"
        }
        nativeButton={false}
        render={<Link href="/warnings" />}
      >
        <Bell className="size-5" />
        {warningCount > 0 && (
          <Badge className="absolute -top-0.5 -right-0.5 min-w-5 px-1 tabular-nums">
            {warningCount}
          </Badge>
        )}
      </Button>
    </header>
  );
}
