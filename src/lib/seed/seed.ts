import { bracketFor } from "@/lib/bracket/bracket";
import { newId, type Household, type Show } from "@/lib/model/types";
import { createKid } from "@/lib/routine/routine";
import { defaultWindow } from "@/lib/schedule/schedule";
import { emptyHousehold } from "./empty";

/** An ISO birthdate `years` years and 100 days before `now`. */
function birthdate(now: Date, years: number): string {
  const d = new Date(now);
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() - 100);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Miranda and John's household from docs/02-personas.md P3: Grace 2, Henry 4, Ella 7, one TV,
 * overlapping default windows for the conflict helper (D26). Shows are metadata; the demo
 * adds real clips through the library.
 */
export function seedHousehold(now: Date = new Date()): Household {
  const h = emptyHousehold(now);
  h.name = "The Millers";
  h.passcode = "1234";

  const shows: Show[] = [
    ["Bear and the Boat", 12, "stories", [3, 6]],
    ["The Little Lighthouse", 15, "stories", [3, 6]],
    ["Rivers of the North", 20, "nature", [5, 8]],
    ["Grandpa's Workshop", 25, "family", [4, 8]],
  ].map(([title, minutes, category, ages]) => ({
    id: newId(),
    title: title as string,
    durationSec: (minutes as number) * 60,
    fileKey: null,
    posterKey: null,
    category: category as Show["category"],
    ages: ages as [number, number],
    addedAt: now.toISOString(),
  }));
  h.shows = shows;

  const grace = createKid(
    { name: "Grace", birthdate: birthdate(now, 2), pin: "1111", colour: 3 },
    now,
  );
  const henry = createKid(
    { name: "Henry", birthdate: birthdate(now, 4), pin: "2222", colour: 5 },
    now,
  );
  const ella = createKid(
    { name: "Ella", birthdate: birthdate(now, 7), pin: "3333", colour: 4 },
    now,
  );

  const henryWindow = defaultWindow(henry, bracketFor(henry.birthdate, now))!;
  henry.channels = [
    {
      id: newId(),
      name: "Stories",
      icon: "book",
      windows: [henryWindow],
      programme: [shows[0].id, shows[1].id],
      programmesByDay: null,
    },
  ];
  const ellaWindow = defaultWindow(ella, bracketFor(ella.birthdate, now))!;
  ella.channels = [
    {
      id: newId(),
      name: "Nature",
      icon: "leaf",
      windows: [ellaWindow],
      programme: [shows[2].id, shows[3].id],
      programmesByDay: null,
    },
    {
      id: newId(),
      name: "Films",
      icon: "film",
      windows: [{ days: ["sat"], start: "15:00", end: "16:00" }],
      programme: [shows[3].id, shows[2].id],
      programmesByDay: null,
    },
  ];

  h.kids = [grace, henry, ella];
  return h;
}
