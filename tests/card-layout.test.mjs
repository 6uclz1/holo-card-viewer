import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('card layout is driven by the loaded image dimensions', () => {
  assert.match(html, /--card-aspect-ratio:/);
  assert.match(html, /--card-ratio:/);
  assert.match(html, /function syncImageLayoutFromImage/);
  assert.match(html, /naturalWidth/);
  assert.match(html, /naturalHeight/);
});

test('holographic layers are masked by the loaded image', () => {
  assert.match(html, /--image-mask:/);
  assert.match(html, /-webkit-mask-image:\s*var\(--image-mask\)/);
  assert.match(html, /mask-image:\s*var\(--image-mask\)/);
});

test('fullscreen sizing no longer uses the sample card ratio as a fixed width', () => {
  const viewerCardRule = html.match(/\.viewer \.holo-card \{[^}]+\}/s)?.[0] ?? '';

  assert.match(viewerCardRule, /var\(--card-ratio\)/);
  assert.doesNotMatch(viewerCardRule, /0\.7159/);
  assert.doesNotMatch(viewerCardRule, /63\s*\/\s*88/);
});
