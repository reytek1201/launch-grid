import type { StoryData } from "@/lib/types";

// A fictional family, written for the demo. A real client's story replaces this.
export const story: StoryData = {
  headline: "Five generations, one Sunday sauce",
  intro:
    "Every restaurant says it is a family one. This one began as a pot on a stove, a long table and a grandmother who would not let anyone leave hungry.",
  chapters: [
    {
      year: "1924",
      title: "A pantry in the hills",
      text: "Nonna Lucia keeps a pantry the size of a small room: tomatoes put up in August, pasta dried on strings, lemons from the tree by the door. Whoever comes by is fed.",
      photo: "sp-09",
      caption: "The first pantry, as we remember it",
    },
    {
      year: "1951",
      title: "The sauce gets a name",
      text: "Her daughter Marta writes the Sunday ragù down for the first time. Beef, pork, six hours, no hurry. It has not changed since.",
      photo: "sp-06",
      focal: "50% 45%",
      caption: "Pasta by hand, the way Marta taught it",
    },
    {
      year: "1978",
      title: "A long table, far from home",
      text: "The family crosses an ocean with two suitcases and a recipe. The first thing they buy is a table long enough for everyone.",
      photo: "sp-05",
      caption: "Every place set, even the empty ones",
    },
    {
      year: "2003",
      title: "A fire of our own",
      text: "A brick oven, built by hand over one hot summer. The kitchen finally has a heart, and the neighbours start knocking.",
      photo: "sp-04",
      focal: "50% 40%",
      caption: "The oven that started it all",
    },
    {
      year: "Today",
      title: "Cinque Lune",
      text: "Five generations, five moons over the door, and the same rule Nonna Lucia had: sit down, nobody leaves hungry.",
      photo: "sp-11",
      caption: "Five lanterns, five moons",
    },
  ],
  values: [
    { title: "Pasta by hand, every morning", text: "Flour, eggs, a wooden pin. Nothing comes out of a box." },
    { title: "A wood fire, never in a hurry", text: "The oven is lit before the doors open and never really goes out." },
    { title: "The table is for staying", text: "We do not turn tables. Order another bottle." },
  ],
  recipe: {
    title: "La ricetta della domenica",
    lines: ["Beef and pork shoulder, browned slowly", "San Marzano tomatoes, put up in August", "One onion, one carrot, one stalk of celery", "A glass of red, a bay leaf, six hours"],
    note: "The rest stays in the family. Ask nicely on a Sunday.",
  },
};
