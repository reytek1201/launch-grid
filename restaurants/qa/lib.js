// Shared helpers for the QA scripts.
const { chromium } = require('playwright');
const path = require('path');
const axeSource = require('fs').readFileSync(require.resolve('axe-core/axe.min.js', { paths: [path.join(__dirname, '..')] }), 'utf8');

const BASE = process.env.QA_BASE || 'http://localhost:3111';
const PHONE = { name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const DESKTOP = { name: 'desktop', viewport: { width: 1280, height: 800 } };

// A signed-in admin, as the fake Supabase understands it (cookie name follows the SUPABASE_URL host).
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const user = { id: '11111111-1111-1111-1111-111111111111', email: 'keymacro.dev@gmail.com', aud: 'authenticated', role: 'authenticated' };
const jwt = b64({ alg: 'HS256', typ: 'JWT' }) + '.' + b64({ sub: user.id, email: user.email, role: 'authenticated', aud: 'authenticated', exp: 4102444800 }) + '.sig';
const session = { access_token: jwt, refresh_token: 'r', token_type: 'bearer', expires_in: 3600, expires_at: 4102444800, user };
const adminCookie = { name: 'sb-localhost-auth-token', value: 'base64-' + b64(session), domain: 'localhost', path: '/' };

async function context(browser, device, { admin = false } = {}) {
  const ctx = await browser.newContext({ viewport: device.viewport, deviceScaleFactor: device.deviceScaleFactor, isMobile: device.isMobile, hasTouch: device.hasTouch });
  if (admin) await ctx.addCookies([adminCookie]);
  return ctx;
}

/** Opens a path and reports: HTTP status, accessibility violations (axe), sideways overflow, page errors. */
async function check(page, route, { shot } = {}) {
  const errors = [];
  const onErr = (e) => errors.push(e.message);
  page.on('pageerror', onErr);
  const res = await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.addScriptTag({ content: axeSource });
  const violations = (await page.evaluate(() => axe.run())).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  const overflow = width > page.viewportSize().width ? width - page.viewportSize().width : 0;
  if (shot) await page.screenshot({ path: shot });
  page.off('pageerror', onErr);
  return { route, status: res?.status(), violations, overflow, errors };
}

module.exports = { chromium, BASE, PHONE, DESKTOP, context, check, axeSource };
