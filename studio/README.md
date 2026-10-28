# LaunchGrid Studio site (`studio/`)

The marketing site for LaunchGrid Studio (launchgrid.studio). Brand, tokens and copy come from the Project doc `claude/launchgrid-brand.md`; decisions and status from `claude/launchgrid-site-plan.md`.

- Next 16, React 19 (React Compiler), Tailwind 4. No database client: the only database call is the form's server action.
- Vercel project `launchgrid-studio` (`prj_vgWZhbPpjwNoRRM9inobsEYFWStt`), root directory `studio`. Vercel Authentication is on for all deployments until launch, so only signed-in team members can open it.
- Database: schema `launchgrid_site` in the shared Reytek1201 project. Migrations in `studio/db/NNN_*.sql`, applied live with the same SQL. The table `inquiries` is closed to the browser; the only way in is `submit_inquiry()`. The schema must be listed in Supabase **Exposed schemas** for the form to work.
- Env vars: see `.env.example`. Email stays off until `RESEND_API_KEY` and `EMAIL_ALERTS_TO` are set; the copy to the sender also needs `EMAIL_FROM` on a verified domain.

## Test
`npm run qa` starts a stand-in database and `next dev`, checks every page on phone and desktop (status, axe, sideways scroll, page errors), steps through the launch sequence, flips the back-office demo, and walks the form (errors, a real send, a too-fast send). Screenshots in `/tmp/lg-qa/`. `next build` fails in the cloud sandbox because it cannot fetch Google Fonts; Vercel's build is fine. Use `npx tsc --noEmit` and `npx eslint app components lib`.

## Live

Launched Oct 27, 2026 at https://launchgrid.studio (SITE_LIVE=1, email alerts and sender copy on, Vercel Authentication on previews only).
Analytics: Vercel Web Analytics enabled Oct 27, 2026 (cookieless page views; custom events: Project form sent, Bay opened, Restaurant demo opened, Try the admin opened). Search Console: URL-prefix property, verified by public/googleaccbf8fa4e57ddd9.html.
