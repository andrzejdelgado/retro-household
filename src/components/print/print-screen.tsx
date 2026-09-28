"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Printer } from "lucide-react";
import { TopBar } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHousehold } from "@/lib/household/provider";
import { useNow } from "@/lib/household/use-now";
import { orderedDayTypes } from "@/lib/routine/routine";
import { KidDayPage, RulesPage } from "./pages";

/** A4 minus 16mm margins at 96dpi: the width the page is laid out at and the height one sheet holds (design system §7). */
const PAGE_WIDTH_PX = Math.round(((210 - 32) / 25.4) * 96);
const PAGE_HEIGHT_PX = Math.round(((297 - 32) / 25.4) * 96);

type PageRef = {
  key: string;
  label: string;
  kidId?: string;
  dayTypeId?: string;
};

/** S14: preview and print one page; overflow is reported, never shrunk (C3.3). */
export function PrintScreen() {
  const { household } = useHousehold();
  const now = useNow();
  const params = useSearchParams();
  const router = useRouter();
  const [overflow, setOverflow] = React.useState(false);
  const [scale, setScale] = React.useState(1);
  const [pageHeight, setPageHeight] = React.useState(0);
  const frameRef = React.useRef<HTMLDivElement>(null);

  // The page is laid out at A4 width and scaled to fit the frame; overflow is measured unscaled.
  React.useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(() => {
      const page = frame.querySelector<HTMLElement>("[data-slot=print-page]");
      setScale(Math.min(1, frame.clientWidth / PAGE_WIDTH_PX));
      setPageHeight(page?.scrollHeight ?? 0);
      if (!page) {
        setOverflow(false);
        return;
      }
      // The preview's own padding is not printed; the sheet's margins come from @page.
      const cs = getComputedStyle(page);
      const content =
        page.scrollHeight -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom);
      setOverflow(content > PAGE_HEIGHT_PX);
    });
    observer.observe(frame);
    const page = frame.querySelector("[data-slot=print-page]");
    if (page) observer.observe(page);
    return () => observer.disconnect();
  }, [params]);

  if (!household) return null;
  const pages: PageRef[] = [
    ...household.kids.flatMap((k) =>
      orderedDayTypes(k).map((d) => ({
        key: `${k.id}:${d.id}`,
        label: `${k.name} · ${d.label}`,
        kidId: k.id,
        dayTypeId: d.id,
      })),
    ),
    { key: "rules", label: "House rules" },
  ];
  const requested =
    params.get("page") === "rules"
      ? "rules"
      : params.get("kid")
        ? pages.find(
            (p) =>
              p.kidId === params.get("kid") &&
              (!params.get("day") || p.dayTypeId === params.get("day")),
          )?.key
        : null;
  const selected = pages.find((p) => p.key === requested) ?? pages[0];
  const select = (key: string) => {
    const p = pages.find((x) => x.key === key)!;
    router.replace(
      p.key === "rules"
        ? "/print?page=rules"
        : `/print?kid=${p.kidId}&day=${p.dayTypeId}`,
    );
  };
  const kid = selected.kidId
    ? household.kids.find((k) => k.id === selected.kidId)
    : null;
  const dayType = kid?.dayTypes.find((d) => d.id === selected.dayTypeId);

  return (
    <>
      <TopBar title="Print" />
      <main className="mx-auto w-full max-w-[1080px] px-4 py-6 md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 md:px-6">
        <div className="mb-4 md:mb-0">
          <div className="md:hidden">
            <Label htmlFor="print-page">Page</Label>
            <Select
              value={selected.key}
              onValueChange={(v) => select(String(v))}
            >
              <SelectTrigger id="print-page" className="mt-2 h-11 w-full">
                <SelectValue>{selected.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {pages.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <RadioGroup
            value={selected.key}
            onValueChange={(v) => select(String(v))}
            className="hidden gap-1 md:flex md:flex-col"
            aria-label="Page"
          >
            {pages.map((p) => (
              <Label
                key={p.key}
                className="hover:bg-accent/40 flex h-11 cursor-pointer items-center gap-2 rounded-md px-2"
              >
                <RadioGroupItem value={p.key} />
                {p.label}
              </Label>
            ))}
          </RadioGroup>
          <Button
            className="mt-4 hidden h-11 md:inline-flex"
            onClick={() => window.print()}
          >
            <Printer /> Print or save as PDF
          </Button>
        </div>
        <div className="flex flex-col gap-3 pb-24 md:pb-0">
          {overflow && (
            <p className="text-sm" role="status">
              {selected.key === "rules"
                ? "The rules page is too long for one sheet. Turn a rule off or shorten a custom one."
                : "This day has too many blocks for one page. Shorten notes or merge blocks."}
            </p>
          )}
          <div
            ref={frameRef}
            className="print-preview overflow-hidden rounded-xl border bg-white text-black shadow-sm"
          >
            <div
              className="print-sheet"
              style={{
                width: PAGE_WIDTH_PX,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                height: pageHeight ? pageHeight * scale : undefined,
              }}
            >
              {selected.key === "rules" ? (
                <RulesPage household={household} />
              ) : kid && dayType ? (
                <KidDayPage
                  household={household}
                  kid={kid}
                  dayType={dayType}
                  now={now}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <div className="bg-background fixed inset-x-0 bottom-14 z-20 border-t p-4 md:hidden">
        <Button className="h-11 w-full" onClick={() => window.print()}>
          <Printer /> Print or save as PDF
        </Button>
      </div>
    </>
  );
}
