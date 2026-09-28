import { TopBar } from "@/components/app-shell";

export default function Page() {
  return (
    <>
      <TopBar title="Home" />
      <main className="mx-auto w-full max-w-[720px] px-4 py-6 md:px-6">
        <p className="text-muted-foreground">
          No kids yet. This is the shell from milestone M0; screens arrive from
          M5.
        </p>
      </main>
    </>
  );
}
