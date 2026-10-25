export type Tier = "counter" | "table" | "house";

export type Photo = { id: string; src: string; alt: string; width: number; height: number; focal: string };

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  /** cents; null means market price */
  price: number | null;
  tags?: ("vegetarian" | "vegan" | "gluten-free" | "spicy")[];
  soldOut?: boolean;
  photo?: string; // key into images.json
};

export type MenuSection = { id: string; title: string; note?: string; items: MenuItem[] };

export type Wine = {
  id: string;
  name: string;
  producer: string;
  region: string;
  grape?: string;
  vintage?: number; // omit for non-vintage
  /** cents; omit when not sold that way */
  glass?: number;
  bottle?: number;
  notes?: string;
  /** menu item ids this wine goes with */
  pairs?: string[];
  organic?: boolean;
  soldOut?: boolean;
  /** shown on the "Il Consiglio" board */
  pick?: boolean;
};
export type WineSection = { id: string; title: string; note?: string; wines: Wine[] };

export type HoursInterval = { open: string; close: string }; // 24h "HH:MM"
export type DayHours = { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; intervals: HoursInterval[] }; // 0 = Sunday
export type Closure = { date: string; label: string }; // YYYY-MM-DD

export type ReservationRules = {
  /** largest party the online request accepts; bigger goes to private events */
  maxParty: number;
  /** last seating is this many minutes before closing */
  lastSeatingMins: number;
  /** earliest bookable time from now, in hours */
  leadHours: number;
  /** how far ahead a date can be picked */
  daysAhead: number;
};

export type EventSpace = { id: string; name: string; capacity: string; blurb: string; photo: string; focal?: string };
export type EventPackage = { id: string; name: string; blurb: string; /** cents per guest */ from: number; includes: string[] };
export type EventsData = {
  intro: string;
  spaces: EventSpace[];
  packages: EventPackage[];
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  occasions: string[];
};

export type StoryChapter = { year: string; title: string; text: string; photo: string; focal?: string; caption: string };
export type StoryData = {
  headline: string;
  intro: string;
  chapters: StoryChapter[];
  values: { title: string; text: string }[];
  recipe: { title: string; lines: string[]; note: string };
};

export type SiteData = {
  name: string;
  tagline: string;
  blurb: string;
  address: { street: string; city: string; state: string; zip: string };
  phone: string;
  email: string;
  timezone: string;
  hours: DayHours[];
  closures: Closure[];
  menu: MenuSection[];
  cellar: WineSection[];
  reservations: ReservationRules;
  events?: EventsData;
  story?: StoryData;
  tier: Tier;
  isDemo: boolean;
};
