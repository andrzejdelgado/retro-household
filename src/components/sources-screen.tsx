"use client";

import { TopBar } from "@/components/app-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SOURCES } from "@/content";

const FILES: [string, string][] = [
  ["household-tech-access-stages.md", "Tech access stages"],
  ["parent-tech-concerns.md", "Parent tech concerns"],
  ["household-routine-elements.md", "Routine elements"],
  ["household-rhythms.md", "Household rhythms"],
  ["household-major-rules.md", "Major rules"],
];

/** S16: where the defaults come from. */
export function SourcesScreen() {
  return (
    <>
      <TopBar title="Sources" />
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 py-6 md:px-6">
        <p className="text-muted-foreground text-sm">
          Every default in the app comes from five practice documents. Where
          sources disagree, the stricter guidance wins.
        </p>
        <Accordion>
          {FILES.map(([file, title]) => {
            const items = SOURCES.filter((s) => s.usedBy.includes(file));
            if (items.length === 0) return null;
            return (
              <AccordionItem key={file} value={file}>
                <AccordionTrigger className="font-heading text-lg">
                  {title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col gap-2">
                    {items.map((s) => (
                      <li key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        <p className="text-muted-foreground text-sm">
          Routine elements, rhythms and the major rules draw on Danish and
          Norwegian practice and on Peter Gray, Kim John Payne, Ellen Sandseter
          and Jessica Alexander; their sources are the same research listed
          above.
        </p>
      </main>
    </>
  );
}
