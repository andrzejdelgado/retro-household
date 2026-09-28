import { HouseholdProvider } from "@/lib/household/provider";

export default function PasscodeLayout({ children }: LayoutProps<"/passcode">) {
  return (
    <HouseholdProvider>
      <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col justify-center px-4 py-10">
        {children}
      </main>
    </HouseholdProvider>
  );
}
