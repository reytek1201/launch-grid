// The photo upload path end to end, on a phone: add a gallery photo, see it listed, see it on the public Gallery, delete it.
// Doubles as the template for testing any admin flow: do the clicks, then read what the fake Supabase logged.
const { chromium, PHONE, context, BASE } = require('./lib');
const sharp = require('sharp');
const os = require('os');
const path = require('path');
(async () => {
  const file = path.join(os.tmpdir(), 'qa-landscape.jpg');
  await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#b9532f' } }).jpeg().toFile(file);
  const browser = await chromium.launch();
  const page = await (await context(browser, PHONE, { admin: true })).newPage();
  await page.goto(BASE + '/admin/gallery', { waitUntil: 'networkidle' });
  const before = await page.locator('li[id]').count();
  await page.setInputFiles('input[type=file]:not([name])', file);
  await page.waitForSelector('input[name=caption]');
  await page.fill('input[name=caption]', 'QA test photo');
  await page.fill('textarea[name=alt]', 'A plain terracotta test image.');
  await page.getByRole('button', { name: 'Add to the gallery' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  const after = await page.locator('li[id]').count();
  console.log(after === before + 1 ? 'ok   photo added to the list' : `FAIL list went ${before} -> ${after}`);
  const pub = await (await context(browser, PHONE)).newPage();
  await pub.goto(BASE + '/gallery', { waitUntil: 'networkidle' });
  console.log((await pub.getByText('QA test photo').count()) > 0 ? 'ok   shows on the public Gallery' : 'FAIL not on the public Gallery');
  await page.getByText('Edit caption and description').last().click();
  await page.getByText('Delete photo…').last().click();
  await page.getByRole('button', { name: 'Delete for good' }).last().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  console.log((await page.locator('li[id]').count()) === before ? 'ok   deleted again' : 'FAIL delete did not remove it');
  await browser.close();
})();
