import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';

const root = resolve(process.env.SERVE_DIR || 'public');
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const prefix = '/private-tantra-sessions-philadelphia/';
  if (pathname === prefix.slice(0, -1)) {
    res.writeHead(301, { Location: prefix }).end(); return;
  }
  const route = pathname.startsWith(prefix) ? pathname.slice(prefix.length - 1) : pathname;
  const file = resolve(root, '.' + route + (route.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Page not found'); return;
  }
  const size = statSync(file).size;
  const headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes', ...(process.env.NODE_ENV === 'production' ? {} : { 'X-Robots-Tag': 'noindex, nofollow' }) };
  const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
  if (match) {
    const start = Number(match[1]);
    const end = Math.min(match[2] ? Number(match[2]) : size - 1, size - 1);
    if (start >= size || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    if (req.method === 'HEAD') res.end(); else createReadStream(file, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { ...headers, 'Content-Length': size });
    if (req.method === 'HEAD') res.end(); else createReadStream(file).pipe(res);
  }
}).listen(port, '0.0.0.0', () => console.log(`Ashira development server listening on port ${port}`));
