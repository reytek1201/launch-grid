import type { WineSection } from "@/lib/types";

// Real regions and grapes, invented producers: this is a demo list, not a real cellar.
export const cellar: WineSection[] = [
  {
    id: "bollicine",
    title: "Bollicine",
    note: "Cold, dry and made for salty things.",
    wines: [
      { id: "prosecco", name: "Prosecco Superiore Brut", producer: "Cantina Valdoro", region: "Veneto", grape: "Glera", glass: 1200, bottle: 4600, notes: "Green apple, white flowers, a clean dry finish.", pairs: ["bruschetta", "burrata"] },
      { id: "metodo-classico", name: "Metodo Classico Brut", producer: "Tenuta Ca' Lunga", region: "Lombardia", grape: "Chardonnay, Pinot Nero", vintage: 2019, bottle: 8400, notes: "Brioche, citrus peel and a fine, steady bubble.", pairs: ["vongole", "carpaccio"] },
    ],
  },
  {
    id: "bianchi",
    title: "Bianchi",
    note: "Crisp and mineral, from the coast and the hills.",
    wines: [
      { id: "vermentino", name: "Vermentino di Gallura", producer: "Podere Sole Basso", region: "Sardegna", grape: "Vermentino", vintage: 2024, glass: 1100, bottle: 4200, notes: "Sea breeze, lemon, a little salt on the finish.", pairs: ["vongole", "branzino", "finocchio"], pick: true },
      { id: "soave", name: "Soave Classico", producer: "Fattoria Monte Bianco", region: "Veneto", grape: "Garganega", vintage: 2023, glass: 1000, bottle: 3800, notes: "Almond and white peach. Soft and easy.", pairs: ["gnocchi", "pollo"] },
      { id: "gavi", name: "Gavi di Gavi", producer: "Cascina Rovere", region: "Piemonte", grape: "Cortese", vintage: 2023, glass: 1400, bottle: 5200, notes: "Green apple and wet stone, very clean.", pairs: ["burrata", "branzino"] },
      { id: "fiano", name: "Fiano di Avellino", producer: "Terre del Falco", region: "Campania", grape: "Fiano", vintage: 2022, bottle: 5800, organic: true, notes: "Hazelnut, ripe pear and a long finish.", pairs: ["pollo", "cacio"] },
    ],
  },
  {
    id: "rosati",
    title: "Rosato",
    wines: [
      { id: "cerasuolo", name: "Cerasuolo d'Abruzzo", producer: "Masseria Due Pini", region: "Abruzzo", grape: "Montepulciano", vintage: 2024, glass: 1000, bottle: 3800, notes: "Cherry and strawberry, dry and bright.", pairs: ["polpette", "bruschetta"] },
    ],
  },
  {
    id: "rossi",
    title: "Rossi",
    note: "From light and easy to big and serious.",
    wines: [
      { id: "chianti", name: "Chianti Classico", producer: "Castello di Vallecorta", region: "Toscana", grape: "Sangiovese", vintage: 2021, glass: 1300, bottle: 5000, notes: "Sour cherry and leather. Made for tomato sauce.", pairs: ["tagliatelle", "polpette", "melanzane"], pick: true },
      { id: "barbera", name: "Barbera d'Asti", producer: "Cantina dei Tigli", region: "Piemonte", grape: "Barbera", vintage: 2022, glass: 1200, bottle: 4600, notes: "Ripe plum, bright acidity, soft tannins.", pairs: ["cacio", "melanzane"] },
      { id: "montepulciano", name: "Montepulciano d'Abruzzo", producer: "Masseria Due Pini", region: "Abruzzo", grape: "Montepulciano", vintage: 2022, glass: 1000, bottle: 3800, notes: "Dark fruit, round and generous.", pairs: ["polpette", "lasagna"] },
      { id: "ripasso", name: "Valpolicella Ripasso", producer: "Fattoria Monte Bianco", region: "Veneto", grape: "Corvina", vintage: 2020, glass: 1500, bottle: 6400, notes: "Dried cherry, cocoa and a warm finish.", pairs: ["tagliata", "ossobuco"] },
      { id: "nero-davola", name: "Nero d'Avola", producer: "Tenuta Sabbia Rossa", region: "Sicilia", grape: "Nero d'Avola", vintage: 2021, bottle: 5400, notes: "Black plum, pepper and sun.", pairs: ["tagliata", "melanzane"] },
      { id: "barolo", name: "Barolo", producer: "Cascina Rovere", region: "Piemonte", grape: "Nebbiolo", vintage: 2018, bottle: 14800, notes: "Roses, tar and firm tannins. Give it time in the glass.", pairs: ["ossobuco", "tagliatelle"], pick: true },
      { id: "brunello", name: "Brunello di Montalcino", producer: "Poggio Alto", region: "Toscana", grape: "Sangiovese", vintage: 2016, bottle: 16800, notes: "Dark cherry, spice and cedar.", soldOut: true },
      {
        id: "amarone",
        name: "Amarone della Valpolicella Classico Riserva, Vigna Vecchia dei Cinque Fratelli",
        producer: "Tenuta dei Cinque Fratelli",
        region: "Veneto",
        grape: "Corvina, Rondinella, Corvinone",
        vintage: 2015,
        bottle: 19500,
        notes: "A deliberately long name, to test wrapping on a phone: raisined fruit, dark chocolate and a very long finish.",
        pairs: ["ossobuco"],
      },
    ],
  },
  {
    id: "dolci",
    title: "Dolci e digestivi",
    note: "To finish.",
    wines: [
      { id: "vin-santo", name: "Vin Santo del Chianti", producer: "Castello di Vallecorta", region: "Toscana", grape: "Trebbiano, Malvasia", glass: 1400, bottle: 6200, notes: "Honey, dried apricot and toasted nuts. Good with cannoli.", pairs: ["cannoli", "tiramisu"] },
      { id: "moscato", name: "Moscato d'Asti", producer: "Cantina dei Tigli", region: "Piemonte", grape: "Moscato", glass: 1000, bottle: 3600, notes: "Lightly sparkling, peach and orange blossom.", pairs: ["panna"] },
      { id: "amaro", name: "Amaro della casa", producer: "House", region: "Made here", glass: 900, notes: "Bitter orange, gentian and a little smoke." },
      { id: "limoncello", name: "Limoncello", producer: "House", region: "Made here", glass: 800, notes: "Served ice cold." },
      { id: "grappa", name: "Grappa di Nebbiolo", producer: "Distilleria Monte Rosso", region: "Piemonte", glass: 1200, notes: "Clear, grapey and warm. Good after the affogato.", pairs: ["affogato"] },
    ],
  },
];
