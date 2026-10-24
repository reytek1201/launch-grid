import type { MenuSection, SiteData } from "@/lib/types";
import { demoConfig } from "../config";

const menu: MenuSection[] = [
  {
    id: "antipasti",
    title: "Antipasti",
    items: [
      { id: "burrata", name: "Burrata con pomodori arrostiti", description: "Roasted cherry tomatoes, basil, olive oil", price: 1400, tags: ["vegetarian"], photo: "d-01" },
      { id: "bruschetta", name: "Bruschetta al pomodoro", description: "Grilled bread, chopped tomato, garlic, basil", price: 900, tags: ["vegan"], photo: "d-02" },
      { id: "carpaccio", name: "Carpaccio di manzo", description: "Rocket, shaved parmigiano", price: 1600, tags: ["gluten-free"], photo: "d-12" },
      { id: "polpette", name: "Polpette della nonna", description: "Grandmother's meatballs in tomato", price: 1200 },
      { id: "finocchio", name: "Insalata di finocchio e arance", description: "Shaved fennel, orange, olives", price: 1100, tags: ["vegan", "gluten-free"] },
    ],
  },
  {
    id: "primi",
    title: "Primi",
    note: "Pasta made by hand each morning.",
    items: [
      { id: "tagliatelle", name: "Tagliatelle al ragù domenicale", description: "The Sunday sauce: slow-cooked beef and pork, parmigiano", price: 2100, photo: "d-03" },
      { id: "cacio", name: "Cacio e pepe", description: "Spaghetti, pecorino romano, cracked black pepper", price: 1900, tags: ["vegetarian"], photo: "d-04" },
      { id: "gnocchi", name: "Gnocchi al pesto di basilico", description: "Potato gnocchi, basil pesto, pine nuts", price: 2000, tags: ["vegetarian"], photo: "d-09" },
      { id: "risotto", name: "Risotto ai funghi porcini", description: "Carnaroli rice, porcini, parmigiano", price: 2300, tags: ["vegetarian", "gluten-free"], photo: "d-10" },
      { id: "vongole", name: "Spaghetti alle vongole", description: "Clams, white wine, garlic, chili", price: 2500, tags: ["spicy"], photo: "d-11" },
      { id: "lasagna", name: "Lasagna della casa", description: "Layered with ragù and béchamel", price: 2200, soldOut: true },
      {
        id: "long-name",
        name: "Pappardelle with slow-braised wild boar, juniper, red wine and orange zest",
        description: "A deliberately long name and description, to test wrapping on a phone: braised for six hours, finished with a little of the cooking liquor and a spoon of ricotta salata.",
        price: 2600,
      },
    ],
  },
  {
    id: "secondi",
    title: "Secondi",
    items: [
      { id: "pollo", name: "Pollo al limone", description: "Roast chicken, lemon, rosemary", price: 2400, tags: ["gluten-free"] },
      { id: "ossobuco", name: "Ossobuco con polenta", description: "Braised veal shank, polenta, gremolata", price: 3600, tags: ["gluten-free"], photo: "d-05" },
      { id: "branzino", name: "Branzino al forno", description: "Whole roasted sea bass, lemon, rosemary", price: 3200, tags: ["gluten-free"], photo: "d-06" },
      { id: "melanzane", name: "Melanzane alla parmigiana", description: "Baked eggplant, tomato, mozzarella", price: 2100, tags: ["vegetarian"] },
      { id: "tagliata", name: "Tagliata di manzo", description: "Sliced sirloin, rocket, parmigiano", price: 3800, tags: ["gluten-free"] },
      { id: "pesce", name: "Pesce del giorno", description: "Ask your server what came in today", price: null },
    ],
  },
  {
    id: "dolci",
    title: "Dolci",
    items: [
      { id: "tiramisu", name: "Tiramisù", description: "Mascarpone, espresso, cocoa", price: 1000, tags: ["vegetarian"], photo: "d-07" },
      { id: "panna", name: "Panna cotta ai frutti di bosco", description: "Vanilla, wild berry compote", price: 900, tags: ["vegetarian", "gluten-free"] },
      { id: "cannoli", name: "Cannoli siciliani", description: "Ricotta cream, pistachio", price: 900, tags: ["vegetarian"], photo: "d-08" },
      { id: "affogato", name: "Affogato al caffè", description: "Vanilla gelato, hot espresso", price: 800, tags: ["vegetarian", "gluten-free"] },
    ],
  },
  {
    id: "bevande",
    title: "Bevande",
    items: [
      { id: "spritz", name: "Aperol spritz", price: 1200 },
      { id: "house-wine", name: "House red or white", description: "By the glass. Bottle $38", price: 1000 },
    ],
  },
  // Empty on purpose: pages must hide a section with no items.
  { id: "stagionale", title: "Specials", note: "Nothing on the list this week.", items: [] },
];

export const trattoria: SiteData = {
  name: "Trattoria Cinque Lune",
  tagline: "Sunday sauce, every night.",
  blurb:
    "A family kitchen with five generations of recipes, a wood-fired oven and one long communal table. Come hungry. Stay a while.",
  address: { street: "118 Fig Alley", city: "Anytown", state: "GA", zip: "30000" },
  phone: "(404) 555-0142",
  email: "ciao@example.com",
  timezone: "America/New_York",
  hours: [
    { day: 0, intervals: [{ open: "12:00", close: "15:00" }, { open: "16:00", close: "21:00" }] },
    { day: 1, intervals: [] },
    { day: 2, intervals: [{ open: "17:00", close: "21:30" }] },
    { day: 3, intervals: [{ open: "17:00", close: "21:30" }] },
    { day: 4, intervals: [{ open: "17:00", close: "21:30" }] },
    { day: 5, intervals: [{ open: "17:00", close: "22:30" }] },
    { day: 6, intervals: [{ open: "17:00", close: "22:30" }] },
  ],
  closures: [{ date: "2026-11-26", label: "Thanksgiving Day" }],
  menu,
  tier: demoConfig.tier,
  isDemo: demoConfig.isDemo,
};
