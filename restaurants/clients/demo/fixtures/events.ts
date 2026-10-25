import type { EventsData } from "@/lib/types";

// Demo copy and prices. A real client replaces all of this.
export const events: EventsData = {
  intro:
    "Birthdays, rehearsal dinners, team dinners, a Sunday that deserves a long table. Tell us the night you have in mind and we will build the menu around it.",
  spaces: [
    {
      id: "tavola",
      name: "La Tavola Lunga",
      capacity: "10 to 24 guests",
      blurb: "The long communal oak table under the five lanterns, set family style with the oven glowing at the far end.",
      photo: "sp-03b",
    },
    {
      id: "forno",
      name: "Il Forno",
      capacity: "6 to 10 guests",
      blurb: "The corner by the wood-fired oven. Close enough to feel the heat and watch the peel.",
      photo: "sp-04",
      focal: "50% 40%",
    },
    {
      id: "locale",
      name: "Tutto il Locale",
      capacity: "up to 60 guests",
      blurb: "The whole trattoria to yourselves, from the olive-green door to the cellar stairs.",
      photo: "sp-11",
    },
  ],
  packages: [
    {
      id: "domenica",
      name: "La Domenica",
      blurb: "The Sunday sauce, served family style.",
      from: 5500,
      includes: ["Antipasti for the table", "Two pastas, the Sunday ragù among them", "One secondo to share", "Dolci and espresso"],
    },
    {
      id: "festa",
      name: "La Festa",
      blurb: "A longer table, a longer evening.",
      from: 7800,
      includes: ["Welcome spritz on arrival", "Four antipasti and two pastas", "Choice of two secondi", "Dolci, espresso and a bottle of wine for every four guests"],
    },
    {
      id: "cantina",
      name: "La Cantina",
      blurb: "Dinner paired with the cellar, course by course.",
      from: 11000,
      includes: ["Five courses from the kitchen", "A wine matched to each course", "A short walk through the cellar", "Dolci and digestivi"],
    },
  ],
  steps: [
    { title: "Tell us the night", text: "Date, guests and the occasion. A rough idea is plenty." },
    { title: "We call you back", text: "Within one working day, to talk menu, wine and any dietary needs." },
    { title: "We hold the table", text: "A deposit confirms the date and the room." },
    { title: "You arrive hungry", text: "Candles lit, table set, oven hot." },
  ],
  faqs: [
    { q: "Is there a minimum spend?", a: "Weekday evenings have no minimum for La Tavola Lunga. Fridays, Saturdays and the whole restaurant have a food and drink minimum, which we will tell you when we call." },
    { q: "How far ahead should we ask?", a: "Two to three weeks is comfortable. For the whole restaurant on a weekend, a month or more is better." },
    { q: "Can you cook for dietary needs?", a: "Yes. Vegetarian, vegan, gluten-free and allergies are part of the planning call. Tell us early and the kitchen will build around them." },
    { q: "Can we bring a cake?", a: "Of course. We will plate and serve it for you. We just ask to know in advance." },
    { q: "Is there a deposit?", a: "A deposit holds the date. It comes off your final bill and the call explains the terms. (This is a demo site, so no real policy applies.)" },
  ],
  occasions: ["Birthday", "Rehearsal dinner", "Team dinner", "Anniversary", "Family gathering", "Something else"],
};
