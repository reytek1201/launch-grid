// A stand-in for Supabase, for testing the site and admin without touching the live database.
// Serves the REST tables in data.json (GET / PATCH / POST / DELETE, in memory only: restart to reset),
// the submit_request function, storage upload / public GET / remove, the auth user check, and /emails.
// Everything it receives is logged to stdout. Port 54321 (override with FAKE_PORT).
const http = require('http'); const fs = require('fs'); const os = require('os'); const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
const user = { id: '11111111-1111-1111-1111-111111111111', aud: 'authenticated', role: 'authenticated', email: 'keymacro.dev@gmail.com', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
const up = path.join(os.tmpdir(), 'fake-supabase-uploads'); fs.mkdirSync(up, { recursive: true });
const readBody = (req) => new Promise((ok) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => ok(Buffer.concat(c))); });
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'); const send = (code, body, h = {}) => { res.writeHead(code, { 'content-type': 'application/json', ...h }); res.end(body === undefined ? '' : JSON.stringify(body)); };
  if (u.pathname === '/auth/v1/user') return send(200, user);
  if (u.pathname === '/rpc-test') return send(200, {});
  if (u.pathname === '/rest/v1/rpc/submit_request' && req.method === 'POST') { const b = (await readBody(req)).toString(); console.log('RPC', b.slice(0, 400)); const seen = (global.seen ||= new Set()); const k = b.replace(/"p_client":"[^"]*"/, ''); if (seen.has(k)) return send(200, false); seen.add(k); return send(200, true); }
  if (u.pathname === '/emails' && req.method === 'POST') { console.log('EMAIL', (await readBody(req)).toString().slice(0, 700)); return send(200, { id: 'x' }); }
  let sm;
  if ((sm = u.pathname.match(/^\/storage\/v1\/object\/public\/trattoria-demo\/(.+)$/))) { const f = up + '/' + sm[1].replace(/\//g, '_'); if (!fs.existsSync(f)) return send(404, {}); res.writeHead(200, { 'content-type': f.endsWith('webp') ? 'image/webp' : 'image/jpeg' }); return res.end(fs.readFileSync(f)); }
  if ((sm = u.pathname.match(/^\/storage\/v1\/object\/trattoria-demo\/(.+)$/)) && req.method === 'POST') { const b = await readBody(req); let body = b; const ct = req.headers['content-type'] || ''; if (ct.startsWith('multipart')) { const bd = Buffer.from('--' + ct.split('boundary=')[1]); let pos = 0; while (true) { const a = b.indexOf(bd, pos); if (a < 0) break; const hs = b.indexOf('\r\n\r\n', a); const head = b.subarray(a, hs).toString(); const nx = b.indexOf(Buffer.concat([Buffer.from('\r\n'), bd]), hs + 4); if (head.includes('filename=')) { body = b.subarray(hs + 4, nx); break; } pos = a + bd.length; } } fs.writeFileSync(up + '/' + sm[1].replace(/\//g, '_'), body); console.log('UPLOAD', sm[1], b.length); return send(200, { Key: 'trattoria-demo/' + sm[1] }); }
  if (u.pathname === '/storage/v1/object/trattoria-demo' && req.method === 'DELETE') { const b = JSON.parse((await readBody(req)).toString() || '{}'); console.log('REMOVE', JSON.stringify(b)); return send(200, []); }
  if (u.pathname === '/rest/v1/rpc/is_admin') return send(200, true);
  const m = u.pathname.match(/^\/rest\/v1\/(\w+)$/);
  if (m && data[m[1]]) {
    let rows = data[m[1]].slice();
    for (const [k, v] of u.searchParams) if (v.startsWith('eq.') && !['select','order','limit'].includes(k)) rows = rows.filter(r => String(r[k]) === v.slice(3));
    if (req.method === 'HEAD') return send(200, undefined, { 'content-range': `*/${rows.length}` });
    if (req.method === 'PATCH') { const patch = JSON.parse((await readBody(req)).toString()); console.log('PATCH', m[1], JSON.stringify(patch)); for (const r of data[m[1]]) { let hit = true; for (const [k, v] of u.searchParams) if (v.startsWith('eq.')) hit = hit && String(r[k]) === v.slice(3); if (hit) Object.assign(r, patch); } return send(204); }
    if (req.method === 'POST') { const row = JSON.parse((await readBody(req)).toString()); console.log('INSERT', m[1], JSON.stringify(row)); data[m[1]].push(row); return send(201); }
    if (req.method === 'DELETE') { console.log('DELETE', m[1], u.search); data[m[1]] = data[m[1]].filter(r => !rows.includes(r)); return send(204); }
    if (req.method !== 'GET') return send(204);
    if ((req.headers.accept || '').includes('pgrst.object')) return send(200, rows[0]);
    return send(200, rows, { 'content-range': `0-${rows.length}/${rows.length}` });
  }
  send(404, { message: 'not found ' + u.pathname });
}).listen(Number(process.env.FAKE_PORT || 54321), () => console.log('fake up'));
