import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');

test('app exposes a web app manifest for installation', async () => {
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest"/);
  assert.match(html, /<link rel="apple-touch-icon" href="icons\/icon-192\.png"/);

  const manifest = JSON.parse(await readFile(new URL('manifest.webmanifest', root), 'utf8'));
  assert.equal(manifest.name, 'Holo Card Viewer');
  assert.equal(manifest.display, 'fullscreen');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.ok(manifest.icons.some((icon) => icon.src === 'icons/icon-192.png' && icon.sizes === '192x192'));
  assert.ok(manifest.icons.some((icon) => icon.src === 'icons/icon-512.png' && icon.sizes === '512x512'));
  assert.ok(manifest.icons.some((icon) => icon.src === 'icons/icon.svg' && icon.sizes === 'any'));
});

test('service worker precaches the static PWA shell', async () => {
  const sw = await readFile(new URL('sw.js', root), 'utf8');

  assert.match(html, /navigator\.serviceWorker\.register\('sw\.js'\)/);
  assert.match(sw, /const APP_SHELL = \[/);
  assert.match(sw, /'index\.html'/);
  assert.match(sw, /'manifest\.webmanifest'/);
  assert.match(sw, /'icons\/icon-192\.png'/);
  assert.match(sw, /'icons\/icon-512\.png'/);
  assert.match(sw, /'icons\/icon\.svg'/);
  assert.match(sw, /self\.addEventListener\('install'/);
  assert.match(sw, /self\.addEventListener\('fetch'/);
});
