import { Alfa_Slab_One, Barlow_Condensed, Caveat, Fraunces, Nunito, Young_Serif } from "next/font/google";

/** Cinque Lune's type (Fraunces) and the chalkboard hand (Caveat), loaded only on the Restaurants page. */
export const clDisplay = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["SOFT", "WONK", "opsz"] });
export const chalk = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat", display: "swap" });

/** Low & Rolling (demo BBQ truck): a loud slab for the sign, condensed for the board. */
export const lrSlab = Alfa_Slab_One({ subsets: ["latin"], weight: "400", variable: "--font-alfa", display: "swap" });
export const lrCond = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-barlow", display: "swap" });
/** Sparrow & Skillet (demo brunch café): a friendly serif and a round sans. */
export const ssSerif = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-young", display: "swap" });
export const ssSans = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
