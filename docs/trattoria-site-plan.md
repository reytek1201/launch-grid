# Trattoria site plan (theme #1)

Oct 24, 2026 · Save as `docs/trattoria-site-plan.md`. Part of `restaurant-build-plan.md`.

A fictional restaurant for the demo: warm, family-run, serif, cream and terracotta, handwritten accents. **The name and details are placeholders.** Before the public demo goes up, I'll search the name so it doesn't collide with a real business.

## 1. The restaurant (fictional)

- **Name:** Trattoria Cinque Lune ("five moons")
- **Tagline:** "Sunday sauce, every night."
- **Story:** a family kitchen with five generations of recipes, a wood-fired oven, a long communal table. About 55 seats.
- **Address and phone:** placeholders only (for example 118 Fig Alley, Anytown, GA 30000 and (404) 555-0142; 555-01xx numbers are reserved for fiction).
- **Hours (fixture):** Tue-Thu 5-9:30 pm, Fri-Sat 5-10:30 pm, Sun 4-9 pm, closed Monday; Sunday also 12-3 pm lunch (shows the two-interval case); closure example: Thanksgiving Day.
- **Voice:** warm, short sentences, a little Italian, never precious. "Come hungry. Stay a while." Buttons say "Reserve a table", "Order for pickup", "Call us".

## 2. Look

| | |
| --- | --- |
| Palette | Cream `#F6EEDD`, paper `#FBF6EA`, espresso `#2B1D14` (text), terracotta `#B9532F` (large type, shapes, graphics), deep terracotta `#9A3F20` (small text and links), olive `#4F5E2F`, wine `#6E2233` (rare accent) |
| Contrast (checked) | espresso on cream 14.1:1; deep terracotta on cream 5.9:1; olive on cream 6.1:1; wine on cream 9.4:1. Plain terracotta on cream is only 4.2:1, so it never carries small text |
| Fonts (Google Fonts, to confirm when wired) | Fraunces (headings, warm soft serif), Source Sans 3 (body; Funkharp already uses the Source family), Caveat (handwritten accents: course names, "finito", signatures) |
| Shapes | Slightly rounded, paper edges, hand-drawn underlines and arrows; checkered tablecloth pattern used sparingly |
| Imagery | Ink-line SVG illustrations (plate, fork, knife, glass, bread, olive branch, door, lantern) with terracotta fills; photos where the food needs to be real |
| Image sources | Illustrations: drawn by me as SVG, owned by you. Photos for the demo: AI-generated in Fal (Nano Banana 2), logged per file in `restaurants/clients/demo/assets/image-log.md`, labelled "AI-generated". Unsplash or Pexels only as a fallback, license checked per file. Placeholders (tinted blocks) for any slot without a photo |

## 3. Pages

| Page | Idea |
| --- | --- |
| Home | The scroll story, "A Meal in Scroll" (section 4) |
| Menu | The plain, fast, readable menu. Handwritten course headings, sticky course nav, sold-out items struck through with a handwritten "finito", dietary tags |
| Hours and Location | Styled as a receipt. The door sign says Aperto or Chiuso from the real hours; closures listed; "open in Maps" and parking note |
| Contact | A postcard-style form to email; phone and address beside it |
| Gallery | Polaroids pinned to a wall with slight rotation, keyboard-friendly lightbox, required alt text |
| Always visible | **The check tray**: a small waiter's-check card holding Reserve, Order and Call. Plain links that work without animation. Collapses to a bottom bar on phones |

Counter tier only for now. Specials, events, catering and the rest come from the catalog at checkpoint 3.

## 4. The signature: "A Meal in Scroll"

The page is a meal. A left-edge tracker (Antipasti, Primi, Secondi, Dolci, Il Conto) follows your scroll.

| Scene | What happens | Placement idea |
| --- | --- | --- |
| 0. La Porta (hero) | (Photo: `sp-01-exterior-dusk`; the SP-02 door close-up was cut.) A doorway with a lantern and a hanging sign that flips to Aperto or Chiuso from the real hours. Restaurant name, tagline, the check tray | Sign swings in on load; one tap to skip nothing, since there is no intro to skip |
| 1. Antipasti | The table is laid as you scroll: plate, fork, knife, glass and bread draw in with SVG strokes. Two or three starter dishes arrive as handwritten tickets | Pinned scene about 120% of screen height on desktop |
| 2. Primi | Pasta dishes slide in as plates along a long table. On desktop the table scrolls sideways while the page is pinned; on phones it is a normal vertical stack | The one sideways moment |
| 3. Secondi | Mains rise onto a wooden board with a short story line from the chef | |
| 4. Dolci | Dessert plates and a coffee cup; steam lines animate | |
| 5. Il Conto | The check arrives: hours as receipt lines, address, and the Reserve / Order / Call buttons large and clear | The final call to action |
| Footer | A handwritten "Grazie" signs itself | |

**Data-driven:** scenes come from the menu's courses, so if an owner adds, hides or renames a course, the scenes follow. With no courses it falls back to a plain menu section. The full menu is always on the Menu page as plain HTML; the scroll story only highlights a few dishes.

**Rules for the piece**
- Hours, phone, address and the buttons are real HTML, visible without scrolling the story and without JavaScript animation.
- Reduced-motion: the table is already laid, no pinning, no sideways scroll.
- Phones: shorter scenes, no sideways scroll; tested at 390px on a real phone.
- The scroll code lives in `themes/trattoria/signature/`, is loaded lazily, and falls back to the plain layout if it fails or the device is slow.
- Scroll math follows Funkharp's `useRamp` method, with progress as one value that scenes read (the same idea as `--prog` in your lanes script).
- No sound. No intro screen.

## 5. Sample menu (fictional fixture, 22 items)

Prices in dollars; tags: V vegetarian, VG vegan, GF gluten-free (owner-entered).

**Antipasti**
- Burrata con pomodori arrostiti, 14, V
- Bruschetta al pomodoro, 9, VG
- Carpaccio di manzo, rucola, parmigiano, 16, GF
- Polpette della nonna, 12
- Insalata di finocchio e arance, 11, VG, GF

**Primi**
- Tagliatelle al ragù domenicale (the "Sunday sauce"), 21
- Cacio e pepe, 19, V
- Gnocchi al pesto di basilico, 20, V
- Risotto ai funghi porcini, 23, V, GF
- Spaghetti alle vongole, 25
- Lasagna della casa (sold out in the fixture), 22

**Secondi**
- Pollo al limone, 24, GF
- Ossobuco con polenta, 36, GF
- Branzino al forno, 32, GF
- Melanzane alla parmigiana, 21, V
- Tagliata di manzo, 38, GF

**Dolci**
- Tiramisù, 10, V
- Panna cotta ai frutti di bosco, 9, V, GF
- Cannoli siciliani, 9, V
- Affogato al caffè, 8, V, GF

**Bevande** (a short drinks section to test a non-course section)
- Aperol spritz, 12
- House red or white, glass 10, bottle 38

Edge-case items added to the fixture: one dish with a very long name and description; one dish with market price ("MP"); an empty section (to test the data-driven scenes); one item with no photo.

## 6. Build steps (one sitting each, hours are estimates)

| Step | Work | Hours |
| --- | --- | --- |
| T1 | Tokens, fonts, base layout, nav, footer, check tray, photo-slot component with placeholders | 4 |
| T2 | Home as a static page (no motion) from fixtures: hero, course sections, Il Conto | 3 |
| T3 | Menu page: list layout, sticky course nav, sold-out "finito", dietary tags | 2.5 |
| T4 | Hours and Location page, receipt styling, open-now logic, door sign (static first) | 2 |
| T5 | Contact (form UI only for now) and Gallery with lightbox | 2.5 |
| T6 | Motion kit applied: reveals, page transitions, magnetic buttons, hide-on-scroll nav | 4 |
| T6b | Hover vocabulary and candle cursor (Part 2 of the space-and-interaction doc) | 3 |
| T7a | Illustration assets: door, lantern, plate, fork, knife, glass, bread, cup, "Grazie" path | 3 |
| T7b | Scroll choreography for scenes 0-5 and the course tracker | 5 |
| T7c | Phone layout, reduced-motion fallback, lazy loading, performance and accessibility pass | 2 |
| | **Total** | **31** |

T1-T6b are Phase 1 (about 21 h with the ported kit); T7 is Phase 2 (10 h). It is also within the earlier estimate (theme 8 + signature 10 + public pages 3 + Contact/Gallery from Phase 2).

## 7. Decisions (Oct 24)

1. Name "Trattoria Cinque Lune" and the tagline: **kept**.
2. Sideways-scrolling table: **kept for now**; reassess when you see it at checkpoint 1.
3. Photos: **generated by you in Fal AI** from prompts we write; the space comes first. See `trattoria-space-and-interaction.md`, Part 1.
4. Interaction: everything should feel connected on hover and scroll. See the same file, Part 2 ("Candlelight and ink").

## 8. Built so far (Oct 24 evening)

- Tagline is "Sunday sauce, every night."; address and phone are the placeholders from section 1. Hours match section 1 (Sunday 12-3 and 4-9).
- Menu fixture is the 22 items in section 5 plus Bevande, a market-price item (Pesce del giorno, MP), a very long dish name, a sold-out Lasagna and an empty "Specials" section that pages hide.
- Home is a static draft (hero, room, lantern strip, four dishes, hand-rolled pasta, Il Conto). **It will be rebuilt around the scroll story in T7**, so don't polish it.
- Phones: header is not sticky, the bottom bar shows "Call to reserve" and "Menu" and hides on scroll down. Reserve is a phone call at the Counter tier.
- Accessibility checks and what was skipped are listed in `restaurant-build-plan.md` (Status).
- Bar to beat, from your feedback: the first pass reads as a template. T7 and the illustrations are where that changes; the calmer pages (Menu, Hours, Contact) stay plain on purpose but pick up the illustrations and type.

## 9. T7 raised to the Funkharp level (Oct 24, your call)

The first pass read as a template; the scroll story is where that changes. Funkharp sets itself apart with **pinned, scroll-scrubbed scenes** (`CaseHero`, `InkQuote`, `FeaturedReel`) and **parallax layers** (`VideoWall`, `StageStrip`). T7 now targets that level:

| Scene | What happens on scroll |
| --- | --- |
| La Porta (pinned) | The dusk exterior zooms toward the door, light floods in, it dissolves into the dining room (SP-03), then the room warms to evening (SP-03b). A giant outlined "Cinque Lune" drifts behind. Name, open sign and buttons are on the first frame |
| Lantern strip | The five lanterns drift against the page; they glow near the pointer |
| Antipasti, Secondi, Dolci (pinned) | Course photo drifts behind; dish tickets set down one by one; ink illustrations (plate, cutlery, glass, olive branch, cup) draw themselves in the foreground and move faster than the photo |
| Primi (pinned, desktop) | The one sideways moment: plates travel along a long oak table as you scroll down. Phones get a vertical stack |
| Il Conto | Candle photo drifts, hours receipt and buttons stay still (never animated), "Grazie" writes itself |
| Course tracker | Left edge on desktop, follows the meal |

Phones keep the zoom, crossfades and parallax with shorter scenes; the sideways table becomes vertical. Reduced motion shows the final frames with no pinning. Scenes come from the menu data, so courses can change.

Estimate: about 14 h instead of 10 (the illustration layers). This replaces the "about 24px drift, no heavy parallax" line in `trattoria-space-and-interaction.md` 2.5.
