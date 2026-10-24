import type { Tier } from "@/lib/types";

export type Flag = "onlineOrdering" | "reservations" | "adminMenu";

// Counter tier: a great static site. Higher tiers switch features on later.
const byTier: Record<Tier, Record<Flag, boolean>> = {
  counter: { onlineOrdering: false, reservations: false, adminMenu: false },
  table: { onlineOrdering: false, reservations: true, adminMenu: true },
  house: { onlineOrdering: true, reservations: true, adminMenu: true },
};

export const hasFlag = (tier: Tier, flag: Flag) => byTier[tier][flag];
