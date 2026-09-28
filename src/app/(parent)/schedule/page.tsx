import { TopBar } from "@/components/app-shell";

export default function Page() {
  return (
    <>
      <TopBar title="TV" />
      <main className="mx-auto w-full max-w-[720px] px-4 py-6 md:px-6">
        <p className="text-muted-foreground">
          Timeline, channels and library arrive in M8 and M9.
        </p>
      </main>
    </>
  );
}
