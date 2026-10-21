import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Export the real page as a portable HTML review file. Images, films, styles and
// JavaScript travel with it; the owner's original font-provider URLs stay remote.
const root = resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const output = resolve(process.argv[2] || 'artifacts/ashira-preview.html');
const mime = {
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm'
};
const cache = new Map();
const local = path => path && !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path);
function localFile(path, relativeTo = root) {
  const clean = decodeURIComponent(path.split(/[?#]/)[0]);
  const file = resolve(clean.startsWith('/') ? root : relativeTo, clean.replace(/^\/+/, ''));
  if (file !== root && !file.startsWith(root + sep)) throw new Error(`Asset is outside public/: ${path}`);
  return file;
}
async function asset(path, relativeTo = root) {
  const file = localFile(path, relativeTo);
  if (!cache.has(file)) {
    cache.set(file, readFile(file).then(data => `data:${mime[extname(file).toLowerCase()] || 'application/octet-stream'};base64,${data.toString('base64')}`));
  }
  return cache.get(file);
}
async function replaceAsync(source, regex, replacement) {
  const matches = [...source.matchAll(regex)];
  const values = await Promise.all(matches.map(replacement));
  let index = 0;
  return source.replace(regex, () => values[index++]);
}
async function bundleCss(path) {
  const file = localFile(path);
  let css = await readFile(file, 'utf8');
  css = await replaceAsync(css, /url\(\s*(?:(['"])(.*?)\1|([^\s)]+))\s*\)/g, async match => {
    const value = match[2] || match[3];
    return local(value) ? `url("${await asset(value, dirname(file))}")` : match[0];
  });
  return css.replace(/<\/style/gi, '<\\/style');
}
async function bundleScript(path) {
  let js = await readFile(localFile(path), 'utf8');
  // These are literal media URLs in the film registry, not executable paths.
  js = await replaceAsync(js, /(['"])((?:\.\/)?(?:media|assets|fonts)\/[^'"\s]+)\1/g,
    async match => JSON.stringify(await asset(match[2])));
  return js.replace(/<\/script/gi, '<\\/script');
}

let html = await readFile(resolve(root, 'index.html'), 'utf8');
const styles = [], scripts = [];
// Preserve the exact stylesheet cascade. Process only actual local stylesheet tags.
html = await replaceAsync(html, /<link\b[^>]*\brel=['"]stylesheet['"][^>]*>/gi, async match => {
  const href = /\bhref=['"]([^'"]+)['"]/i.exec(match[0])?.[1];
  if (!local(href)) return match[0];
  styles.push(href);
  return `<style data-source="${href}">\n${await bundleCss(href)}\n</style>`;
});
// Original scripts are deferred. Moving their inline equivalents to the end of
// body preserves execution after the DOM exists, in the original script order.
const scriptMatches = [...html.matchAll(/<script\b[^>]*\bsrc=['"]([^'"]+)['"][^>]*>\s*<\/script>/gi)];
const inlineScripts = [];
for (const match of scriptMatches) {
  if (!local(match[1])) continue;
  scripts.push(match[1]);
  inlineScripts.push(`<script data-source="${match[1]}">\n${await bundleScript(match[1])}\n</script>`);
  html = html.replace(match[0], '');
}
// This runs before injecting scripts, so base64 data is never reprocessed.
html = await replaceAsync(html, /\b(src|poster|data-src|href)=(['"])([^'"]+)\2/g, async match => {
  const path = match[3];
  if (!local(path) || !mime[extname(path.split(/[?#]/)[0]).toLowerCase()]) return match[0];
  return `${match[1]}=${match[2]}${await asset(path)}${match[2]}`;
});
html = html.replace('</body>', () => `${inlineScripts.join('\n')}\n</body>`);
html += '\n<!-- Portable HTML preview: all local UI assets and films embedded. Original licensed font faces load from their original providers and require an internet connection. -->\n';
await mkdir(dirname(output), { recursive: true });
await writeFile(output, html);
console.log(JSON.stringify({
  output, bytes: Buffer.byteLength(html), embeddedAssets: cache.size,
  stylesheets: styles, scripts,
  dependencies: 'No adjacent files or server required. Original font providers require an internet connection.'
}));
