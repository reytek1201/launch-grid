// Try the admin: the sandbox on phone and desktop. Page checks (axe, overflow, errors), then the three guided
// jobs land in the site preview, Reset puts it back, and the fake Supabase logged no writes at all.
const fs = require('fs');
const { chromium, PHONE, DESKTOP, context, check } = require('./lib');
const writes = () => { try { return (fs.readFileSync('/tmp/qa-fake.log', 'utf8').match(/^(PATCH|INSERT|UPLOAD|DELETE|POST)/gm) || []).length; } catch { return 0; } };
(async () => {
  const browser = await chromium.launch();
  let bad = 0;
  const say = (ok, msg, extra = '') => { if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`, ok ? '' : extra); };
  const before = writes();
  for (const device of [PHONE, DESKTOP]) {
    const d = device.name.padEnd(7);
    const page = await (await context(browser, device)).newPage();
    for (const r of ['/try/site', '/try']) {
      const x = await check(page, r, { shot: `/tmp/qa-try-${device.name}${r.replace(/\//g, '-')}.png` });
      say(x.status === 200 && !x.violations.length && !x.overflow && !x.errors.length, `${d} ${r} loads clean`, JSON.stringify(x));
    }
    const site = page.frameLocator('iframe[title*="site preview"]');
    const showSite = async () => { if (device === PHONE) await page.getByRole('button', { name: 'See the site' }).first().click(); };
    const showAdmin = async () => { if (device === PHONE) await page.getByRole('button', { name: 'Back to the admin' }).click(); };

    // 1. sold out
    await page.getByRole('navigation', { name: 'Admin' }).locator('visible=true').getByRole('button', { name: 'Menu' }).click();
    const sw = page.locator('main li button[aria-pressed="false"]').first();
    const dish = (await sw.locator('.sr-only').innerText()).replace(/:\s*$/, '');
    await sw.click();
    await showSite();
    const okSold = await site.locator('li', { hasText: dish }).filter({ hasText: 'finito' }).first().waitFor({ timeout: 8000 }).then(() => true, () => false);
    say(okSold, `${d} sold-out "${dish}" shows "finito" on the site`);
    await showAdmin();

    // 2. banner
    await page.getByRole('navigation', { name: 'Admin' }).locator('visible=true').getByRole('button', { name: 'Home' }).click();
    await page.getByLabel(/^Message/).fill('QA special: lemon ricotta tonight');
    const box = page.getByLabel('Show it on the site');
    if (!(await box.isChecked())) await box.check();
    await page.getByRole('button', { name: 'Save banner' }).click();
    await showSite();
    const okBanner = await site.getByRole('status').filter({ hasText: 'QA special: lemon ricotta tonight' }).first().waitFor({ timeout: 8000 }).then(() => true, () => false);
    say(okBanner, `${d} banner shows across the top of the site`);
    await showAdmin();

    // 3. closure
    await page.getByRole('navigation', { name: 'Admin' }).locator('visible=true').getByRole('button', { name: 'Hours' }).click();
    await page.getByLabel('Date').fill('2031-12-25');
    await page.getByLabel('Name').fill('QA Holiday');
    await page.getByRole('button', { name: 'Add closure' }).click();
    await showSite();
    const okClosure = await site.getByText(/QA Holiday/).first().waitFor({ timeout: 8000 }).then(() => true, () => false);
    say(okClosure, `${d} closure shows in the site's hours`);
    await showAdmin();

    const okAll = await page.getByText('3 of 3 done').isVisible() && await page.getByRole('link', { name: 'Start a project' }).isVisible();
    say(okAll, `${d} guide says 3 of 3 and offers Start a project`);
    await page.screenshot({ path: `/tmp/qa-try-${device.name}-done.png` });

    await page.getByRole('button', { name: 'Reset demo' }).click();
    const okReset = await page.getByText('0 of 3 done').waitFor({ timeout: 4000 }).then(() => true, () => false)
      && !(await site.getByRole('status').filter({ hasText: 'QA special' }).count());
    say(okReset, `${d} Reset demo puts everything back`);
    await page.context().close();
  }
  say(writes() === before, 'sandbox wrote nothing to the database', `writes went ${before} -> ${writes()}`);
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
