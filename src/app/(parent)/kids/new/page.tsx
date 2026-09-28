import { TopBar } from "@/components/app-shell";
import { KidForm } from "@/components/kid-form";

export default function NewKidPage() {
  return (
    <>
      <TopBar title="Add a child" />
      <main className="mx-auto w-full max-w-[720px] px-4 py-6 md:px-6">
        <KidForm />
      </main>
    </>
  );
}
