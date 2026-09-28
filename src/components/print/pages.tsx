"use client";

import { MAJOR_RULES } from "@/content";
import { KIND_ICONS } from "@/components/routine/kind-icons";
import { ageOn } from "@/lib/bracket/bracket";
import { WEEKDAYS, type Weekday } from "@/lib/clock/clock";
import type { DayType, Household, Kid, Window } from "@/lib/model/types";
import { screenBlock, weekdaysOf, WEEKDAY_LABELS } from "@/lib/routine/routine";
import { windowFor } from "@/lib/schedule/schedule";

const dayList = (days: Weekday[]) =>
  days.map((d) => WEEKDAY_LABELS[d]).join(" · ");
const shortDays = (days: Weekday[]) =>
  days.map((d) => WEEKDAY_LABELS[d].slice(0, 3)).join(" ");

function wifiLine(windows: Window[]): string {
  return windows
    .map(
      (w) =>
        `${shortDays(w.days)} ${w.start} to ${w.end === "24:00" ? "morning" : w.end}`,
    )
    .join(" · ");
}

/** One kid's day on one page (design system §7): the rhythm as a timeline, the TV window, Wi-Fi off hours. */
export function KidDayPage({
  household,
  kid,
  dayType,
  now,
}: {
  household: Household;
  kid: Kid;
  dayType: DayType;
  now: Date;
}) {
  const days = weekdaysOf(kid, dayType.id);
  const blocks = [...dayType.blocks].sort((a, b) =>
    a.start.localeCompare(b.start),
  );
  const slot = screenBlock(dayType);
  const tv = kid.channels
    .flatMap((c) => days.map((d) => ({ c, w: windowFor(c, d) })))
    .filter((x) => x.w)
    .map((x) => `${x.c.name} ${x.w!.start} to ${x.w!.end}`);
  const tvLine = [...new Set(tv)].join(" · ");
  return (
    <article className="print-page" data-slot="print-page">
      <header className="print-header">
        <h1 className="print-title">{kid.name}</h1>
        <p className="print-subtitle">{dayList(days)}</p>
        <p className="print-muted">Age {ageOn(kid.birthdate, now)}</p>
      </header>
      <table className="print-table">
        <tbody>
          {blocks.map((b) => {
            const Icon = KIND_ICONS[b.kind];
            return (
              <tr key={b.id}>
                <td className="print-time">
                  {b.start}
                  {b.end !== "24:00" && (
                    <span className="print-muted"> to {b.end}</span>
                  )}
                </td>
                <td>
                  <span className="print-row">
                    <Icon className="print-icon" aria-hidden />
                    <span>{b.title}</span>
                  </span>
                  {b.note && <div className="print-note">{b.note}</div>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {(slot || tvLine) && (
        <p className="print-line">
          <strong>TV</strong> {tvLine || `${slot!.start} to ${slot!.end}`}
        </p>
      )}
      {household.wifiOffWindows.length > 0 && (
        <p className="print-footer">
          Wi-Fi off: {wifiLine(household.wifiOffWindows)}
        </p>
      )}
    </article>
  );
}

/** The household rules page: the rules, Wi-Fi off windows, each kid's TV hours. */
export function RulesPage({ household }: { household: Household }) {
  const rules = household.rules.filter((r) => r.enabled);
  return (
    <article className="print-page" data-slot="print-page">
      <header className="print-header">
        <h1 className="print-title">{household.name}</h1>
        <p className="print-subtitle">House rules</p>
      </header>
      <ol className="print-rules">
        {rules.map((r) => {
          const major = r.ruleId
            ? MAJOR_RULES.find((m) => m.id === r.ruleId)
            : null;
          return (
            <li key={r.id}>
              <strong>{major ? major.title : r.customText}</strong>
              {major && (
                <div className="print-note">
                  {major.detail.replace(/^,\s*/, "")}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {household.wifiOffWindows.length > 0 && (
        <>
          <h2 className="print-h2">Wi-Fi off</h2>
          <table className="print-table">
            <tbody>
              {household.wifiOffWindows.map((w, i) => (
                <tr key={i}>
                  <td className="print-time">{shortDays(w.days)}</td>
                  <td>
                    {w.start} to {w.end === "24:00" ? "morning" : w.end}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {household.kids.some((k) => k.channels.length > 0) && (
        <>
          <h2 className="print-h2">TV hours</h2>
          <table className="print-table">
            <tbody>
              {household.kids.map((k) =>
                k.channels.map((c) =>
                  c.windows.map((w, i) => (
                    <tr key={`${c.id}-${i}`}>
                      <td className="print-time">{k.name}</td>
                      <td>
                        {c.name} · {shortDays(w.days)} · {w.start} to {w.end}
                      </td>
                    </tr>
                  )),
                ),
              )}
            </tbody>
          </table>
        </>
      )}
      <p className="print-footer">
        {WEEKDAYS.length === 7
          ? "Both parents run the same rules. Disagreements are settled away from the child."
          : ""}
      </p>
    </article>
  );
}
