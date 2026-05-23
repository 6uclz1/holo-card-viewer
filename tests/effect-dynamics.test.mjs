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
  assert.match(html, /const opticalX = clamp\(normalizedX \+ Number\(ambient\.x \|\| 0\), -1, 1\)/);
  assert.match(html, /Math\.hypot\(opticalX, opticalY\)/);
  assert.match(html, /--curve-x/);
  assert.match(html, /--curve-y/);
});

test('preview idle animation keeps foil and particles alive without pointer input', () => {
  assert.match(html, /function computeIdlePose/);
  assert.match(html, /function startPreviewIdleLoop/);
  assert.match(html, /idleDrift/);
  assert.match(html, /particleDrift/);
  assert.match(html, /setCardPose\(previewCard, idlePose\.x, idlePose\.y, idlePose\.sparkle\)/);
});

test('fullscreen animation is additive and does not overwrite the selected effect motion', () => {
  const renderLoop = html.match(/function startRenderLoop\(\) \{(?<body>[\s\S]+?)\n  function startPreviewIdleLoop/)?.groups?.body ?? '';

  assert.match(html, /function computeAmbientMotion/);
  assert.match(html, /\.viewer \.foil-base::after/);
  assert.match(html, /\.viewer \.foil-sheen::after/);
  assert.match(html, /\.viewer \.foil-sparkles::after/);
  assert.match(renderLoop, /const ambientMotion = computeAmbientMotion\(now, 1\)/);
  assert.match(renderLoop, /setCardPose\(fullCard, current\.x, current\.y, current\.sparkle, \{ ambient: ambientMotion \}\)/);
  assert.doesNotMatch(renderLoop, /target\.x\s*=\s*idlePose\.x/);
  assert.doesNotMatch(renderLoop, /target\.y\s*=\s*idlePose\.y/);
});
