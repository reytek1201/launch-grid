// LaunchGrid Studio test kit: npm run qa
// Starts a stand-in database (answers submit_inquiry, keeps nothing) and `next dev`, then checks every page on
// phone and desktop (status, axe, sideways scroll, page errors) and walks the Start a project form.
// Screenshots land in /tmp/lg-qa/. Needs Playwright (preinstalled in the cloud workspace).
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(require.resolve("playwright", { paths: [process.env.NODE_PATH ?? "", "/usr/lib/node_modules", "/usr/local/lib/node_modules"] }));
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const PORT = Number(process.env.QA_PORT ?? 3211), FAKE = 54399, BASE = `http://localhost:${PORT}`;
const SHOTS = "/tmp/lg-qa"; mkdirSync(SHOTS, { recursive: true });
const PHONE = { name: "phone", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const DESKTOP = { name: "desktop", viewport: { width: 1280, height: 800 } };

const received = [];
const fake = createServer((req, res) => {
  let body = ""; req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (req.url?.endsWith("/rpc/submit_inquiry")) { received.push({ schema: req.headers["content-profile"], body: JSON.parse(body) }); res.setHeader("Content-Type", "application/json"); res.end("true"); return; }
    res.statusCode = 404; res.end("{}");
  });
}).listen(FAKE);

const dev = spawn("npx", ["next", "dev", "-p", String(PORT)], {
  env: { ...process.env, SUPABASE_URL: `http://localhost:${FAKE}`, SUPABASE_ANON_KEY: "sb_publishable_fake", SUPABASE_SCHEMA: "launchgrid_site", SPAM_SALT: "qa", NEXT_PUBLIC_SITE_URL: BASE },
  stdio: ["ignore", "pipe", "pipe"],
  detached: true,
});
let devLog = ""; dev.stdout.on("data", (d) => (devLog += d)); dev.stderr.on("data", (d) => (devLog += d));
const stop = (code) => { try { process.kill(-dev.pid, "SIGTERM"); } catch {} fake.close(); process.exit(code); };
process.on("uncaughtException", (e) => { console.error(e); stop(1); });
process.on("unhandledRejection", (e) => { console.error(e); stop(1); });

for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`${BASE}/privacy`); if (r.ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 2000));
}

const browser = await chromium.launch();
let bad = 0;
const ctx = (d) => browser.newContext({ viewport: d.viewport, deviceScaleFactor: d.deviceScaleFactor, isMobile: d.isMobile, hasTouch: d.hasTouch });

async function check(page, route, expect = 200) {
  const errors = []; const onErr = (e) => errors.push(e.message); page.on("pageerror", onErr);
  const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.addScriptTag({ content: axeSource });
  const violations = (await page.evaluate(() => axe.run())).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  const overflow = Math.max(0, width - page.viewportSize().width);
  page.off("pageerror", onErr);
  return { status: res?.status(), ok: res?.status() === expect && !violations.length && !overflow && !errors.length, violations, overflow, errors };
}

for (const d of [PHONE, DESKTOP]) {
  const page = await (await ctx(d)).newPage();
  for (const [r, s] of [["/", 200], ["/start", 200], ["/start?kind=restaurant", 200], ["/musicians", 200], ["/privacy", 200], ["/no-such-page", 404]]) {
    const x = await check(page, r, s);
    if (!x.ok) bad++;
    console.log(`${x.ok ? "ok  " : "FAIL"} ${d.name.padEnd(7)} ${r}`, x.ok ? "" : JSON.stringify(x));
  }
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${SHOTS}/${d.name}-home-top.png` });
  await page.screenshot({ path: `${SHOTS}/${d.name}-home-full.png`, fullPage: true });
  // the launch sequence at each beat
  const seq = await page.evaluate(() => { const el = document.querySelector(".seq"); return { top: el.offsetTop, h: el.offsetHeight }; });
  for (const [i, f] of [[0, 0.05], [2, 0.5], [3, 0.7], [4, 0.95]]) {
    await page.evaluate(([t, h, f]) => window.scrollTo(0, t + f * (h - innerHeight)), [seq.top, seq.h, f]);
    await page.waitForTimeout(1400);
    const beat = await page.evaluate(() => document.querySelector(".stage")?.dataset.beat);
    if (Number(beat) !== i) { bad++; console.log(`FAIL ${d.name} sequence: expected beat ${i}, got ${beat}`); }
    await page.screenshot({ path: `${SHOTS}/${d.name}-beat${i}.png` });
  }
  console.log(`ok   ${d.name.padEnd(7)} launch sequence beats`);
  // back office demo: a sold-out switch changes the preview
  await page.locator("#back-office").scrollIntoViewIfNeeded();
  await page.getByRole("switch", { name: "Cacio e pepe sold out" }).click();
  // the change lands on the site after the lift-off flight (under a second)
  const sold = await page.locator(".pv .dish", { hasText: "Cacio e pepe" }).locator(".pill").waitFor({ timeout: 5000 }).then(() => 1, () => 0);
  if (sold !== 1) { bad++; console.log(`FAIL ${d.name} back office demo`); } else console.log(`ok   ${d.name.padEnd(7)} back office demo`);
  await page.locator("#back-office").screenshot({ path: `${SHOTS}/${d.name}-back-office.png` });
}

// the form: empty send shows errors; a real send reaches the database function and shows "Received."
{
  const page = await (await ctx(PHONE)).newPage();
  await page.goto(BASE + "/start?ref=qa-site", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Start a project" }).click();
  await page.waitForSelector("#name-err");
  const errs = await page.locator(".err").count();
  await page.screenshot({ path: `${SHOTS}/form-errors.png`, fullPage: true });
  const a = await check(page, "/start?ref=qa-site"); // axe on the clean form again
  await page.goto(BASE + "/start?ref=qa-site", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Start a project" }).click();
  await page.waitForSelector("#name-err");
  await page.addScriptTag({ content: axeSource });
  const errViolations = (await page.evaluate(() => axe.run())).violations.map((v) => v.id);
  await page.getByLabel("Your name").fill("Dana Reyes");
  await page.getByLabel("Email").fill("dana@example.com");
  await page.locator(".kind", { hasText: "A restaurant" }).click();
  await page.getByLabel("Name of the band, restaurant or business").fill("Example Bistro");
  await page.getByLabel("What do you need?").fill("A new site with our menu and hours that I can change from my phone.");
  await page.getByLabel("When would you like to launch?").selectOption("Within a month");
  await page.waitForTimeout(3200);
  await page.getByRole("button", { name: "Start a project" }).click();
  await page.waitForSelector("text=Received.");
  await page.waitForTimeout(1900);
  await page.screenshot({ path: `${SHOTS}/form-sent.png` });
  const got = received.at(-1);
  const okFlow = errs >= 5 && a.ok && !errViolations.length && got?.schema === "launchgrid_site" && got.body.p_kind === "restaurant" && got.body.p_ref === "qa-site" && got.body.p_client?.length === 32;
  if (!okFlow) bad++;
  console.log(`${okFlow ? "ok  " : "FAIL"} form flow`, okFlow ? "" : JSON.stringify({ errs, a, errViolations, got }));

  // a send within 3 seconds is treated as a script: shown as sent, never stored
  const before = received.length;
  await page.goto(BASE + "/start", { waitUntil: "networkidle" });
  await page.getByLabel("Your name").fill("Bot");
  await page.getByLabel("Email").fill("bot@example.com");
  await page.locator(".kind", { hasText: "Something else" }).click();
  await page.getByLabel("Name of the band, restaurant or business").fill("Bot Co");
  await page.getByLabel("What do you need?").fill("Buy cheap things now, a very long message here.");
  await page.getByRole("button", { name: "Start a project" }).click();
  await page.waitForSelector("text=Received.");
  const okFast = received.length === before;
  if (!okFast) bad++;
  console.log(`${okFast ? "ok  " : "FAIL"} too-fast send is dropped quietly`);
}

// Musicians: Funkharp's booking letter lands on the band's phone (demo only, nothing is sent)
for (const d of [PHONE, DESKTOP]) {
  const page = await (await ctx(d)).newPage();
  await page.goto(BASE + "/musicians", { waitUntil: "networkidle" });
  await page.getByLabel("Your name").fill("QA Tester");
  await page.getByLabel("Venue or event").fill("The QA Room");
  await page.getByLabel("Your email").fill("qa@example.com");
  await page.getByRole("button", { name: /Seal it and send/ }).click();
  const okLetter = await page.locator(".fh-phone li", { hasText: "QA Tester" }).first().waitFor({ timeout: 9000 }).then(() => true, () => false)
    && page.url().endsWith("/musicians") && await page.getByText("Thanks, QA.").isVisible();
  if (!okLetter) bad++;
  console.log(`${okLetter ? "ok  " : "FAIL"} ${d.name.padEnd(7)} booking letter lands in the band's inbox`);
}

await browser.close();
if (bad) console.log("dev server log tail:\n" + devLog.slice(-2000));
console.log(`screenshots: ${SHOTS}`);
stop(bad ? 1 : 0);
