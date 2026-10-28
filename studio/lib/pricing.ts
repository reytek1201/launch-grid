/** One source for every price on the site (the /pricing page, the form pre-fill and the page's structured data).
 *  Band prices: docs/business-plan.md. Restaurant prices: Reytek, Oct 27, 2026. Change a number here, nowhere else. */
export const PRICES_AS_OF = "October 27, 2026";

export type Tier = {
  id: string;
  kind: "band" | "restaurant";
  name: string;
  blurb: string;
  price: number;
  /** a build can be paid as this many equal monthly payments (bands only) */
  split?: number;
  care: number;
  note?: string;
  facts: [label: string, value: string][];
};

export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export const BAND_TIERS: Tier[] = [
  {
    id: "stage", kind: "band", name: "Stage", blurb: "A clean, fast site in your colors. I keep it current for you.",
    price: 900, split: 3, care: 25,
    facts: [
      ["Pages", "Home, Music, Shows, Videos, Contact"],
      ["Look", "A template styled with your colors, fonts, logo and photos"],
      ["Music player", "Keeps playing as people move around the site"],
      ["Booking form", "Sends to your email"],
      ["Mailing list", "A sign-up form"],
      ["Shows, songs, videos", "I update them for you, within your care plan"],
      ["Design changes", "1 round"],
      ["Typical timeline", "2 weeks"],
    ],
  },
  {
    id: "headliner", kind: "band", name: "Headliner", blurb: "A look built from your art, with one piece people remember.",
    price: 1800, split: 3, care: 35, note: "Most artists land here",
    facts: [
      ["Pages", "Home, Music, Shows, Videos, Contact"],
      ["Look", "Built from your art, plus one signature piece (like the Funkharp turntable)"],
      ["Music player", "Keeps playing as people move around the site"],
      ["Booking form", "Sends to your email"],
      ["Mailing list", "A sign-up form"],
      ["Shows, songs, videos", "I update them for you, within your care plan"],
      ["Design changes", "2 rounds"],
      ["Typical timeline", "4 weeks"],
    ],
  },
  {
    id: "tour", kind: "band", name: "Tour", blurb: "Everything in Headliner, and a back office you run yourself.",
    price: 2700, split: 3, care: 50,
    facts: [
      ["Pages", "Home, Music, Shows, Videos, Contact"],
      ["Look", "Built from your art, plus one signature piece (like the Funkharp turntable)"],
      ["Music player", "Keeps playing as people move around the site"],
      ["Booking form", "A back office inbox, phone alerts and an auto-reply"],
      ["Mailing list", "A back office list with export and a welcome email"],
      ["Shows, songs, videos", "You update them yourself, in the back office"],
      ["Design changes", "2 rounds"],
      ["Typical timeline", "5 to 6 weeks"],
    ],
  },
];

export const RESTAURANT_TIERS: Tier[] = [
  {
    id: "counter", kind: "restaurant", name: "Counter", blurb: "Your menu, hours and photos, with a back office for the weekly jobs.",
    price: 1500, care: 49,
    facts: [
      ["Pages", "Home, Menu, Hours and location, Contact, Gallery"],
      ["Look", "One of the template themes, styled to your place"],
      ["Back office", "Menu and prices, a sold-out switch, hours and closures, a specials banner, photos"],
      ["Contact", "A contact form that emails you"],
      ["Ordering and booking", "Buttons to the services you already use: Toast, Square, delivery apps, OpenTable or your phone"],
      ["Found on Google", "Local search basics: hours, sitemap and share images"],
    ],
  },
  {
    id: "dine-in", kind: "restaurant", name: "Dine-In", blurb: "Counter, plus guest requests and a scroll piece that feels like your room.",
    price: 2800, care: 79,
    facts: [
      ["Pages", "Everything in Counter, plus Reserve and Private events"],
      ["Look", "A theme styled to your place, plus a scroll-driven centerpiece (like Trattoria's “A Meal in Scroll”)"],
      ["Back office", "Everything in Counter, plus an inbox for requests"],
      ["Requests", "Reservation, private-event and contact requests, with an email alert for each"],
      ["Ordering and booking", "Buttons to the services you already use: Toast, Square, delivery apps, OpenTable or your phone"],
      ["Found on Google", "Local search basics: hours, sitemap and share images"],
    ],
  },
];

export const ALL_TIERS = [...BAND_TIERS, ...RESTAURANT_TIERS];

/** `/start?tier=headliner` pre-fills the form so Reytek knows what the visitor looked at. */
export function tierIntro(id: string): { kind: Tier["kind"]; text: string } | null {
  const t = ALL_TIERS.find((x) => x.id === id);
  if (!t) return null;
  return { kind: t.kind, text: `I’m interested in the ${t.name} package (${usd(t.price)}). ` };
}

export const FAQ: [string, string][] = [
  ["Is the price really fixed?", "Yes. Your written proposal states the price and the launch date before any work starts. If you ask for more later, I quote it first. You are never surprise-billed."],
  ["What does the build price include?", "The design, the pages, loading your content, the back office for your tier, connecting your domain, launch, and a written owner’s guide so you know where everything is."],
  ["Why is there a monthly care plan?", "It keeps the site online, secure, updated and backed up, keeps your forms and back office working, and covers up to an hour a month of small changes. You can cancel with 30 days’ notice."],
  ["Can I pay in parts?", "Builds are 50% to start and 50% at launch. For bands on a tight budget, the build can instead be split into 3 equal monthly payments, with launch after the last one."],
  ["Who owns the site?", "You own your domain, photos, words, music, menu and lists. I own the template and code behind it and license it to you for as long as you’re on a care plan. If you leave, I export your lists, bookings and media and point your domain wherever you want."],
  ["What if I run something else?", "The same build and back office can be shaped to other small businesses. Tell me what you run and I’ll quote it in writing."],
];
