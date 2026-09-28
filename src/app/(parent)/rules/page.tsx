import { TopBar } from "@/components/app-shell";

export default function Page() {
  return (
    <>
      <TopBar title="Rules" />
      <main className="mx-auto w-full max-w-[720px] px-4 py-6 md:px-6">
        <p className="text-muted-foreground">
          Household rules and Wi-Fi hours arrive in M10.
        </p>
      </main>
    </>
  );
}
