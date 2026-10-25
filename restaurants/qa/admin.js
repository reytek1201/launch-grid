// Every admin page on a phone, signed in as the test admin: loads, no accessibility violations, no sideways scroll.
const { chromium, PHONE, DESKTOP, context, check } = require('./lib');
const ROUTES = ['/admin', '/admin/inbox', '/admin/menu', '/admin/cellar', '/admin/gallery', '/admin/hours'];
(async () => {
  const browser = await chromium.launch();
  let bad = 0;
  for (const device of [PHONE, DESKTOP]) {
    const page = await (await context(browser, device, { admin: true })).newPage();
    for (const r of ROUTES) {
      const x = await check(page, r);
      const ok = x.status === 200 && !x.violations.length && !x.overflow && !x.errors.length;
      if (!ok) bad++;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${device.name.padEnd(7)} ${r}`, ok ? '' : JSON.stringify(x));
    }
  }
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
