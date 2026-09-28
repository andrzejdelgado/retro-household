import { Suspense } from "react";
import { PrintScreen } from "@/components/print/print-screen";

export default function PrintPage() {
  return (
    <Suspense>
      <PrintScreen />
    </Suspense>
  );
}
