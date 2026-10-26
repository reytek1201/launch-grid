import { Shantell_Sans, Source_Sans_3, Source_Serif_4 } from "next/font/google";

/** Funkharp's own type, loaded only on the Musicians page for the Funkharp section. */
export const fhDisplay = Shantell_Sans({ subsets: ["latin"], variable: "--font-shantell", display: "swap" });
export const fhSerif = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-source-serif", display: "swap" });
export const fhSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap" });
