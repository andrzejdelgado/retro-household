import type { Domain, Practice } from "./types";

const source = "household-routine-elements.md";

// The file's framing line per domain, used as the one-line why (D24).
export const DOMAIN_WHY: Record<Domain, string> = {
  outdoors: "No bad weather, only bad clothing.",
  play: "Child-led, parent nearby, not directing.",
  reading: "Language grows from being read to and talked with, every day.",
  chores: "Children as members of the household, not guests.",
  independence:
    "Sandseter's six categories: height, speed, tools, elements, rough play, being out of sight.",
  emotional: "The Danish model: empathy, reframing, no ultimatums, honesty.",
  family: "Planned activity stays under a quarter of the child's free time.",
};

export const DOMAIN_TITLES: Record<Domain, string> = {
  outdoors: "Outdoors and movement",
  play: "Free play and toys",
  reading: "Reading and language",
  chores: "Chores and contribution",
  independence: "Independence and risky play",
  emotional: "Emotional education",
  family: "Family time and rituals",
};

type Row = { ages: [number, number]; detail: string; duration: string };

// best-parctices/household-routine-elements.md, one row per table row, text as written.
const rows: Record<Domain, Row[]> = {
  outdoors: [
    {
      ages: [0, 1],
      detail:
        "Outside every day in all weather. Tummy time spread across the day. Floor freedom. Bouncers, swings and seats only when unavoidable",
      duration:
        "Outside 60 min a day. Tummy time 30 min a day total. Containers under 30 min a day beyond the car",
    },
    {
      ages: [1, 3],
      detail:
        "Walks instead of pram once the child can manage the distance. Mud, water, sand, slopes. Playground daily",
      duration:
        "Outside 2 h a day weekday, 3 h weekend. Physical activity 180 min spread through the day",
    },
    {
      ages: [3, 5],
      detail:
        "Climbing, balancing, running. One nature outing a week to forest, beach or park",
      duration:
        "Outside 2 h weekday including kindergarten, 4 h weekend. 180 min activity of which 60 min energetic. Nature outing 2 h",
    },
    {
      ages: [5, 8],
      detail:
        "Bike or walk to school where the route allows. Sunday family walk or hike. At most one club or sport, never two",
      duration:
        "Outside 90 min weekday after school, 4 h weekend. 60 min energetic a day. Hike 2 to 3 h",
    },
  ],
  play: [
    {
      ages: [0, 1],
      detail:
        "Face-to-face floor play. Answer every sound and gesture, the serve-and-return pattern. Household objects over toys",
      duration: "Some floor play every waking hour",
    },
    {
      ages: [1, 3],
      detail:
        "Open-ended toys only: blocks, dolls, vehicles, kitchen, sand, water. No battery, light-up or sound toys. Toys out of sight rotated monthly",
      duration:
        "Unstructured play 2 h a day. At most 20 toys visible. Parent not directing for at least half",
    },
    {
      ages: [3, 5],
      detail:
        "Boredom rule: when the child says they are bored the parent offers nothing for 15 min. Drawing, building and dress-up materials always reachable. Structured classes at most one a week or none",
      duration:
        "Unstructured play 3 h weekday, 5 h weekend. At most 30 toys visible, rotated monthly",
    },
    {
      ages: [5, 8],
      detail:
        "Boredom rule extends to 30 min. One club or sport at most. One weekend day each week with nothing organised by adults. Peer play at home or outside",
      duration:
        "Unstructured play 2 h weekday, 5 h weekend. Peer play at least 3 times a week",
    },
  ],
  reading: [
    {
      ages: [0, 1],
      detail:
        "Narrate care aloud. Sing daily. Board books from 6 months. No background TV or talk radio ever",
      duration: "Read aloud 10 to 15 min a day",
    },
    {
      ages: [1, 3],
      detail:
        "Two read-aloud sessions a day. Ask a question and wait 5 seconds before speaking again. Library visit every two weeks",
      duration: "Read aloud 20 min a day. At least 30 books at home",
    },
    {
      ages: [3, 5],
      detail:
        "Child tells the story back. Rhymes and songs. One bedtime story a week told without a book. A second language comes through people, never apps",
      duration: "Read aloud 20 to 30 min a day",
    },
    {
      ages: [5, 8],
      detail:
        "Read aloud continues even after the child reads. Own reading from 6 or 7. Books in every room. Weekend morning reading hour",
      duration:
        "Read aloud 20 min a day. Own reading 15 to 20 min a day. Reading hour 60 min on one weekend morning",
    },
  ],
  chores: [
    {
      ages: [1, 3],
      detail:
        "Put toys away with the parent, carry own plate, laundry in basket",
      duration: "5 min daily",
    },
    {
      ages: [3, 5],
      detail:
        "Set and clear table, water plants, sort laundry, tidy own room. Saturday family cleaning hour. No payment for chores",
      duration: "10 min daily, 45 min Saturday",
    },
    {
      ages: [5, 8],
      detail:
        "Make bed, load dishwasher, take out bin, vacuum one room, help with groceries. Fixed weekly pocket money from 6, not tied to chores, the Danish lommepenge model",
      duration: "15 min daily, 60 min Saturday",
    },
  ],
  independence: [
    {
      ages: [0, 1],
      detail:
        "Let the child struggle before helping. A safe-enough home instead of constant no",
      duration: "Wait 30 seconds before helping",
    },
    {
      ages: [1, 3],
      detail:
        "If they climbed up alone they can be there. Uneven ground, walls, slopes. Own spoon and cup and the mess that follows. Choice between two outfits",
      duration: "Wait 10 seconds before helping",
    },
    {
      ages: [3, 5],
      detail:
        "Real tools with an adult: peeler, small knife, hammer, saw, the Norwegian kindergarten norm from 4. Trees to the child's own limit. Play out of sight in garden or courtyard. Dresses self including outdoor gear. Sleeps at grandparents",
      duration: "Out of sight 15 to 30 min. Tools weekly",
    },
    {
      ages: [5, 8],
      detail:
        "Walk or bike to school or a friend's alone from 6 or 7 after five accompanied runs. Shop with a list from 7. Outside unsupervised with a check-in time. Cooks with a knife. Lights a fire with an adult. Stays home alone briefly from 7 or 8",
      duration: "Unsupervised outside 1 to 2 h a day. Home alone 20 to 30 min",
    },
  ],
  emotional: [
    {
      ages: [0, 1],
      detail:
        "Respond to crying quickly. Name feelings aloud. Co-regulate rather than leave to cry",
      duration: "Response within a minute",
    },
    {
      ages: [1, 3],
      detail:
        "Name the feeling before the behaviour. Stay with the child in a tantrum, low voice, no bargaining. No ultimatums, threats or time-outs. Undivided one-on-one time per child",
      duration: "5 min daily one-on-one, per child, per parent",
    },
    {
      ages: [3, 5],
      detail:
        "Child chooses the one-on-one activity. Talk about characters' feelings in stories. Parent apologises when wrong and repairs the same day",
      duration: "15 min daily one-on-one",
    },
    {
      ages: [5, 8],
      detail:
        "Weekly family meeting where the child has a say. Coach peer conflict rather than solve it. Praise effort, never reward charts",
      duration:
        "15 to 20 min daily one-on-one. Family meeting 15 min on Sunday",
    },
  ],
  family: [
    {
      ages: [1, 3],
      detail:
        "Friday cosy evening with candles, a treat and music, the Swedish fredagsmys. Sunday outing. Same greeting and farewell ritual daily",
      duration: "Friday 60 min. Sunday 2 h",
    },
    {
      ages: [3, 5],
      detail:
        "Weekly baking. Saturday slow start with no alarm. Monthly bigger outing to forest, sea or museum",
      duration: "Baking 45 min. Outing half a day",
    },
    {
      ages: [5, 8],
      detail:
        "Board game evening. Sunday hike. Seasonal traditions on the Nordic calendar such as Advent, midsummer and first snow. Child plans one family activity a month",
      duration: "Game evening 45 min. Hike 2 to 3 h",
    },
  ],
};

function firstSentence(text: string): string {
  const m = text.match(/^(.+?[.:])(\s|$)/);
  return (m ? m[1] : text).replace(/[.:]$/, "");
}

export const PRACTICES: Practice[] = (
  Object.entries(rows) as [Domain, Row[]][]
).flatMap(([domain, list]) =>
  list.map((row) => ({
    id: `${domain}-${row.ages[0]}-${row.ages[1]}`,
    domain,
    ages: row.ages,
    title: firstSentence(row.detail),
    detail: row.detail,
    duration: row.duration,
    why: DOMAIN_WHY[domain],
    source,
  })),
);
