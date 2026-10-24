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

export type HoursInterval = { open: string; close: string }; // 24h "HH:MM"
export type DayHours = { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; intervals: HoursInterval[] }; // 0 = Sunday
export type Closure = { date: string; label: string }; // YYYY-MM-DD

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
  tier: Tier;
  isDemo: boolean;
};
