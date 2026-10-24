# LaunchGrid Restaurant Template: kickoff prompt

You are my lead engineer and design partner for LaunchGrid Studio. We are building a mock restaurant site that is also the reusable template for every restaurant client. Read `docs/business-plan.md` and the 90-day plan first: https://claude.ai/artifact/7KXxX6e33AovFVwC3JpAYz (sections "Restaurant MVP", "Template plan", "Offer and pricing").

## Who and constraints
- I'm Reytek, one-person studio (LaunchGrid Studio, a trade name of Keymacro LLC, Georgia). About 25 hours a week; my minimum is $30 an hour, so every feature must fit the tier's hour budget.
- Stack matches Funkharp: Next.js on Vercel, Supabase (one project per client), Resend for email. One codebase, one `clients/<slug>/` folder per client, one config file per client, a `CLIENT` setting per Vercel project.
- Be direct. If a feature is a distraction or blows the hours, say so. Look up current docs and prices instead of guessing and cite them. Mark estimates. Prefer small steps I can finish in one sitting. No legal or tax advice as fact.

## Goal
1. A shared restaurant backend and back office. Only the design and the enabled features change per client.
2. A labelled demo site ("Demo restaurant, not a real business") I can show owners.
3. Several themes viewable side by side, so an owner can pick a look before we build.

## Architecture requirements
- **Theme layer is separate from the backend.** A theme is design tokens (colors, fonts, radii, spacing), a hero variant, a menu layout variant (list, columns, cards), section components, and copy tone. Swapping a theme must not touch data or admin code.
- **Feature flags per tier** in the client config. Admin screens and public pages hide when a feature is off.
- **Per-client Supabase project**, migration files in the repo, a script that creates a new client folder and runs migrations and seed data. Row-level security on every table.
- **Back office** (auth login, mobile friendly, built for a busy owner): the weekly jobs come first.
- **Structured data**: Restaurant/LocalBusiness JSON-LD with opening hours (including `validFrom`/`validThrough` for closures), `menu` URL, `servesCuisine`; sitemap; Open Graph; fast pages; accessible; mobile first.
- **No** online ordering or payments, POS sync, delivery, loyalty, table management, review aggregation, or multi-location in this build. Order and reserve are configurable buttons that link to Toast, Square Online, DoorDash, OpenTable or Resy.

## Tiers (feature flags)
**Counter** (target 16 hours of client-specific work): Home, Menu, Hours and Location, Contact, Gallery; owner edits menu, prices, sold-out switch, hours, holiday closures; specials banner; order/reserve link buttons; structured data; contact form to email.

**Dine-In** (target 28 hours): everything in Counter plus Specials page with weekly scheduler, Events and Live Music (optional link to a band page), Catering and Private Events form with admin inbox, auto-reply and phone alert, reservation-request form for places with no booking tool, mailing list, 2 design rounds.

Design the flags so a later "Full Service" tier (multi-location, Square catalog sync) can be added without a rewrite.

## Suggested data model (improve it)
site_settings, menu_sections, menu_items (price, description, dietary tags, sold_out, image, sort order), hours_weekly, hours_exceptions, specials, events, inquiries (type: catering, private event, reservation, contact), subscribers, media, admin_users.

## Themes to build (fictional restaurants only, no real brands or copied designs)
1. Italian trattoria: warm, serif, cream and terracotta, handwritten accents.
2. Steakhouse: dark, high contrast, gold or brass accents, formal serif.
3. Taqueria / Mexican: bright, bold type, playful color blocking.
4. Sushi / Japanese: minimal, lots of white space, restrained palette.
5. Cafe / bakery: light, friendly, rounded shapes, photo-forward.
6. Barbecue / diner: textured, retro type, red and cream.

For each theme give: palette, font pairing (Google Fonts), hero style, menu layout, image treatment, and a sample menu and copy for a fictional restaurant. Use placeholder or properly licensed images and tell me where each image comes from. A `/demo/[theme]` route plus a theme switcher lets an owner flip between looks on the same data.

## How to work
1. **First reply only:** ask me no more than five questions, state your assumption for any I skip, then propose (a) the folder structure, (b) the schema, (c) the theme system design, (d) the feature-flag design, (e) a phased plan with hour estimates that fits 25 hours a week, and (f) what you would cut first if I fall behind. Do not write code until I approve the plan.
2. **Phases:** foundation and one theme with menu and hours back office first; then the remaining Counter features; then Dine-In features; then the other themes; then the labelled demo site.
3. Keep a running status at the top of the plan: done, next this week, blocked on me. Update it whenever I report progress. When I finish something, give me the next small step.
4. Commit in small steps, test the admin flows, and check mobile and accessibility before calling anything done.
