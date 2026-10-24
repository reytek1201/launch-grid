# LaunchGrid Restaurants: feature catalog

Draft 1 · Oct 24, 2026 · Save as `docs/restaurant-feature-catalog.md`. Companion to `docs/restaurant-template-plan.md`.

Everything I could think of, so you can see the whole menu and pick. Hours are **estimates** for building it once in the template (client set-up not included). Nothing here is decided.

**Tier key:** **C** = Counter · **D** = Dine-In · **F** = Full Service (later tier) · **A** = paid add-on · **X** = not in this build (your no-list) · **?** = my suggestion, your call.

**POS and platform details are from my general knowledge and are not re-verified.** Before quoting any client on an integration, I'll check the vendor's current developer terms, approval requirements and fees, and cite them.

---

## 1. Public site

| Feature | What it is | Tier | Est. h | Notes |
| --- | --- | --- | --- | --- |
| Home, Menu, Hours and Location, Contact, Gallery | The core five pages | C | in plan | |
| Menu layouts | List, columns, cards per theme | C | in plan | Ship two first |
| Dietary tags | Owner-entered tags (vegetarian, gluten-free...) | C | 2 | No allergen claims; owner responsible |
| "Open now" badge and today's hours | Computed from hours and closures | C | 3 | Needs timezone in settings |
| Holiday closure notices | Banner plus structured data | C | in plan | |
| Specials banner | Top-of-page notice with dates | C | in plan | |
| Specials page and weekly scheduler | Recurring weekday specials | D | in plan | |
| Events and live music | Listings, optional band link | D | in plan | Bridge to your music clients |
| Seasonal menu scheduling | Menu or section switches on a date | ? D | 4 | Brunch vs dinner, summer menu |
| Daily "board" | Soup of the day, today's catch | ? D | 3 | Tiny admin form |
| Downloadable menu PDF | Generated from live menu | ? C | 4 | Owners ask for it; keep it generated, not uploaded |
| Print-friendly menu | Print stylesheet | ? C | 1 | |
| About / story page | Owner story, photos | ? C | 2 | Often the best-converting page |
| Team page | Chef and staff cards | A | 2 | |
| FAQ page | Parking, kids, dogs, dress code | ? C | 2 | Adds FAQ structured data |
| Press and reviews quotes | Owner-chosen quotes with links | A | 2 | Not aggregation (that's X) |
| Map and directions | Static map, "open in Maps" link | C | 1 | Avoid heavy embeds |
| Parking and accessibility info | Owner text block | C | 1 | |
| Gift card link | Button to the owner's existing gift cards | C | 0.5 | Selling cards is X |
| Careers / hiring page | Posts plus apply-by-email | A | 3 | |
| News / blog | Posts | A | 6 | Cut unless asked |
| Second language | Spanish or other, menu and key pages | A | 10+ | Per-client content cost, not just code |
| Announcement popup | Closed-for-event notice | ? C | 1 | Easy to abuse; make dismissible |

## 2. Interactive and scroll experience (your signature)

| Feature | What it is | Tier | Est. h | Notes |
| --- | --- | --- | --- | --- |
| Motion kit | Reveals, magnetic buttons, scroll ramps, page transitions, hide-on-scroll nav | C | 4 | Ported from Funkharp |
| Theme signature piece | One scroll-driven centerpiece per theme | D | 6-10 | Trattoria "A Meal in Scroll" |
| Theme metaphor | A touchable concept (corner table, cart rail, counter...) | D | in signature | See plan, interaction layer |
| Persistent "check" widget | Small order/reserve/call tray that follows you | ? D | 4 | Always real links, no animation dependency |
| Skippable intro | Short entrance, one-tap skip, once per visit | A | 3 | Never with sound |
| Scroll-told menu | Courses revealed in sequence | D | in signature | Plain list stays in DOM |
| Hover and press details | Item hover reveals, image tilt | C | 2 | Fine-pointer only |
| Video hero | Muted loop, poster fallback | A | 3 | Needs client video; watch size |
| Parallax photography | Layered food photos | ? D | 3 | Mobile cost; fallback needed |
| Custom cursor | Themed cursor on desktop | A | 2 | Your other sites have it |
| Ambient sound toggle | Off by default | A | 2 | Rare fit for restaurants |
| Custom signature piece for one client | Built from their own story | A | quote | $75/h for small jobs, as in the business plan |
| Reduced-motion and phone fallbacks | Plain layout when needed | C | in plan | Non-negotiable |

## 3. Back office (the owner's weekly jobs)

| Feature | What it is | Tier | Est. h | Notes |
| --- | --- | --- | --- | --- |
| Menu editor | Sections, items, prices, reorder | C | in plan | |
| Sold-out switch ("86 board") | One tap per item, mobile first | C | in plan | The single most-used screen |
| Hours and closures editor | Weekly, ranges, holiday presets | C | in plan | |
| Quick price change | Raise a section by a percent | ? C | 2 | Saves owners real time |
| Bulk menu import | CSV or paste | ? A | 4 | Speeds onboarding for you |
| Photo upload with resize | Auto crop and compress, required alt text | C | in plan | |
| Specials and events editors | | D | in plan | |
| Inbox | Catering, private events, reservations, contact | D | in plan | |
| Scheduled publishing | "Show this special Friday" | ? D | 3 | |
| Staff roles | Owner vs staff (staff can't change prices) | ? D | 3 | Roles table exists in plan |
| Change history and undo | Last edits per item | A | 6 | Cut first |
| Phone alerts | Web push for new inquiries | D | in plan | Reuses Funkharp |
| Weekly digest email | Inquiries, sign-ups, top pages | ? A | 4 | Good care-plan retention |
| Onboarding checklist | "Add 3 photos, confirm hours" | ? C | 2 | Cuts your support |
| Data export | Menu, inquiries, subscribers | C | 3 | Matches your "leaving" terms |
| Admin login protection | Attempt limits (from Funkharp) | C | 1 | |
| Two-step login | Email code or authenticator | A | 4 | |

## 4. Communication

| Feature | What it is | Tier | Est. h | Notes |
| --- | --- | --- | --- | --- |
| Contact form to email | | C | in plan | Spam protection included |
| Catering and private events form | Inbox plus auto-reply | D | in plan | |
| Reservation-request form | For places with no booking tool | D | in plan | Cut candidate |
| Mailing list and export | Sign-up, unsubscribe | D | in plan | Consent wording: ask a lawyer |
| Newsletter composer | Send to the list from the admin | A | 8 | Competes with Mailchimp; low priority |
| Text-message alerts to owner | SMS in addition to push | A | 3 | Per-message fees |
| Customer SMS list | Opt-in texts to guests | A | 8 | Carrier registration and consent rules are heavy |
| Auto-reply templates | Editable by owner | ? D | 2 | |
| Waitlist notify | Text/email when table is ready | X | | Table management |

## 5. Orders, reservations and POS

Think of it as four levels. Level 0 is the plan for this build.

| Level | What it means | Tier | Est. h |
| --- | --- | --- | --- |
| 0. Link-out | Buttons to the owner's Toast, Square Online, DoorDash, Uber Eats, Grubhub, ChowNow, OpenTable, Resy, Tock, or phone | C | in plan |
| 1. Embed | Booking or order widget shown inside the page | A | 2-4 each |
| 2. Read-only sync | Pull menu, prices and sold-out from the POS into the site | F | 20-40 each |
| 3. Transactions | Orders, payments, gift cards, loyalty on the site | X | 80+ and liability |

Specific integrations:

| Integration | Level | Tier | Est. h | Notes (verify before quoting) |
| --- | --- | --- | --- | --- |
| Square Online / Square link-out | 0 | C | 0.5 | |
| Toast Online Ordering link-out | 0 | C | 0.5 | |
| Delivery apps link-out | 0 | C | 0.5 | |
| OpenTable / Resy / Tock widget | 1 | A | 2-4 | Check each vendor's embed rules |
| Square catalog sync (menu, prices, sold-out) | 2 | F | ~30 | Public API with OAuth; best first POS because small restaurants use it |
| Toast menu sync | 2 | F | ? | Likely needs partner approval; check before promising |
| Clover, Lightspeed, Revel sync | 2 | F | ? | Skip until a paying client needs one |
| Sync sold-out from POS to site | 2 | F | in sync | The feature owners actually want |
| Own online ordering | 3 | X | | Your no-list |
| Stripe deposits for private events | 3 | X | | Payments; revisit later |
| Gift card sales | 3 | X | | |
| Loyalty, rewards | 3 | X | | |

## 6. Local search and marketing

| Feature | What it is | Tier | Est. h | Notes |
| --- | --- | --- | --- | --- |
| Restaurant structured data, hours, closures | | C | in plan | Verify rules against Google docs |
| Menu structured data | Menu and menu item markup | ? C | 3 | |
| Event structured data | | D | 2 | |
| Sitemap, Open Graph, robots | | C | in plan | |
| Generated share images | Per page, branded | ? C | 3 | |
| Google Business Profile setup | Checklist and hand-done set-up | C | 0 (service) | Sell as a one-time task |
| Google Business Profile hours sync | Update hours from the admin | A | ? | API access may need approval; check |
| Review links | "Leave a review" buttons | C | 0.5 | Aggregation is X |
| Click tracking | Call, order, directions clicks | ? D | 3 | Powers a monthly report |
| Analytics | Privacy-friendly stats | A | 2 | Cookie banner needed with some tools |
| Instagram section | Hand-picked posts, not live feed | A | 3 | Live feeds break often |
| Monthly report email | Visits, clicks, inquiries | ? A | 6 | Strong care-plan upsell |

## 7. Platform and operations (yours, not the client's)

| Feature | What it is | Tier | Est. h | Notes |
| --- | --- | --- | --- | --- |
| Per-client Supabase and RLS tests | | all | in plan | |
| `new-client` script and seed | | all | in plan | |
| Feature flags per tier | | all | in plan | |
| Staging site per client | Preview before launch | ? all | 2 | |
| Uptime monitor | Alert when a site is down | ? all | 1 | |
| Error reporting | | ? all | 2 | |
| Backups check | Scheduled export | ? all | 2 | Supabase plan matters; verify |
| Custom domain and email-sending set-up | | all | 0 (checklist) | |
| Client content intake form | Collect menu, photos, hours before the build | ? all | 3 | Biggest time saver on every build |
| Proposal and agreement templates | | business | outside the code | In your 90-day list |
| Care plan billing | Subscription invoices | business | outside the code | |

## 8. My top picks

If I had to choose what sells best per hour of work:

1. **86 board (sold-out switch) plus hours and closures.** Owners use it weekly; this is the reason they pay a care plan.
2. **Theme signature piece plus "check" widget.** This is what makes the site yours; it's the demo that gets calls.
3. **Quick price change** and **onboarding checklist**. Cheap, and they cut support.
4. **Monthly report email** (click tracking plus digest). Strong retention for a $29-49 plan.
5. **Square catalog sync** as the first Full Service feature, but only after a paying client asks.

Things I'd resist: customer SMS, newsletter composer, multi-language, and any ordering or payments, because the support and compliance cost can wipe out a $30/hour margin.

## 9. Pick list

Tell me which items to move up, down or off, and which tier each belongs in. I'll update the plan's hours and flags to match.
