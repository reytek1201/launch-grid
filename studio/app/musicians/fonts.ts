import { Anton, Archivo, Courier_Prime, Libre_Caslon_Display, Libre_Caslon_Text, Shantell_Sans, Source_Sans_3, Source_Serif_4 } from "next/font/google";

/** Funkharp's own type, loaded only on the Musicians page for the Funkharp section. */
export const fhDisplay = Shantell_Sans({ subsets: ["latin"], variable: "--font-shantell", display: "swap" });
export const fhSerif = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-source-serif", display: "swap" });
export const fhSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap" });

/** Kaeso Vance (demo artist): condensed poster headlines and a sturdy grotesk. */
export const kvDisplay = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
export const kvSans = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });

/** Josie Calloway (demo artist): letterpress display, a book serif and a typewriter for labels. */
export const jcDisplay = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", variable: "--font-caslon-display", display: "swap" });
export const jcText = Libre_Caslon_Text({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-caslon-text", display: "swap" });
export const jcType = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-courier", display: "swap" });
