// Splits a restaurant's name into the small line above and the big line, for the logo lockup:
// "Trattoria Cinque Lune" -> kicker "Trattoria", main "Cinque Lune". "Bella Notte" -> no kicker.
const KICKERS = ["Trattoria", "Osteria", "Ristorante", "Pizzeria", "Enoteca", "Taverna", "Cafe", "Café", "Bar", "Bistro", "Cantina"];

export function brandOf(name: string): { kicker?: string; main: string } {
  const [first, ...rest] = name.trim().split(/\s+/);
  if (rest.length && KICKERS.some((k) => k.toLowerCase() === first.toLowerCase())) return { kicker: first, main: rest.join(" ") };
  return { main: name.trim() };
}
