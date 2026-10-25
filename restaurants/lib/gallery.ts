/** The signs the gallery photos hang under, in the order they appear on the public Gallery page. */
export const CHAPTERS = [
  { id: "sala", title: "La sala", line: "The room, from the street to the long table." },
  { id: "cucina", title: "In cucina", line: "Where the sauce has been going since dawn." },
  { id: "cantina", title: "La cantina", line: "Down the stairs, and back up with a bottle." },
  { id: "tavola", title: "A tavola", line: "The best seat is the one you are in." },
  { id: "nuove", title: "Di recente", line: "Fresh from the room." },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];
export const isChapter = (v: string): v is ChapterId => CHAPTERS.some((c) => c.id === v);
