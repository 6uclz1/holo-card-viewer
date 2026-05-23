import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('default shine is intentionally below the previous blowout-prone value', () => {
  const range = html.match(/<input id="strengthRange"[^>]+value="(?<value>\d+)"/);
  const output = html.match(/<output id="strengthValue"[^>]*>(?<value>\d+)%<\/output>/);

  assert.ok(range?.groups);
  assert.ok(output?.groups);
  assert.equal(range.groups.value, output.groups.value);
  assert.ok(Number(range.groups.value) <= 56);
});

test('shine opacity mapping keeps high-strength white layers bounded', () => {
  assert.match(html, /--highlight-core/);
  assert.match(html, /--highlight-glow/);
  assert.match(html, /--rim-opacity/);
  assert.match(html, /--foil-opacity',\s*\(0\.10 \+ strength \* 0\.42\)/);
  assert.match(html, /--sheen-opacity',\s*\(0\.10 \+ strength \* 0\.38\)/);
});

test('light position is projected through a curved card surface model', () => {
  assert.match(html, /function computeSurfaceLight/);
  assert.match(html, /Math\.hypot\(normalizedX, normalizedY\)/);
  assert.match(html, /--curve-x/);
  assert.match(html, /--curve-y/);
});

test('idle animation keeps foil and particles alive without pointer or sensor input', () => {
  assert.match(html, /function computeIdlePose/);
  assert.match(html, /function startPreviewIdleLoop/);
  assert.match(html, /idleDrift/);
  assert.match(html, /particleDrift/);
  assert.match(html, /setCardPose\(previewCard, idlePose\.x, idlePose\.y, idlePose\.sparkle\)/);
});
