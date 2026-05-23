import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('mobile fullscreen rendering is capped below native refresh rate', () => {
  const renderLoop = html.match(/function startRenderLoop\(\) \{(?<body>[\s\S]+?)\n  function startPreviewIdleLoop/)?.groups?.body ?? '';

  assert.match(html, /function getRenderFrameInterval/);
  assert.match(html, /MOBILE_RENDER_FRAME_INTERVAL/);
  assert.match(renderLoop, /const frameInterval = getRenderFrameInterval\(\)/);
  assert.match(renderLoop, /now - lastFrameAt < frameInterval/);
});

test('mobile preview idle rendering is also throttled', () => {
  const previewLoop = html.match(/function startPreviewIdleLoop\(\) \{(?<body>[\s\S]+?)\n  function resetMotionState/)?.groups?.body ?? '';

  assert.match(previewLoop, /let lastFrameAt = 0/);
  assert.match(previewLoop, /const frameInterval = getRenderFrameInterval\(\)/);
  assert.match(previewLoop, /now - lastFrameAt < frameInterval/);
});

test('mobile fullscreen mode removes the heaviest ambient paint layers', () => {
  assert.match(html, /function syncPerformanceMode/);
  assert.match(html, /document\.body\.classList\.toggle\('is-mobile-performance'/);
  assert.match(html, /viewer\.classList\.toggle\('is-mobile-performance'/);
  assert.match(html, /body\.is-mobile-performance \.panel/);
  assert.match(html, /\.viewer\.is-mobile-performance \.viewer-glow/);
  assert.match(html, /\.viewer\.is-mobile-performance \.foil::after/);
  assert.match(html, /display:\s*none/);
});

test('large raster uploads are resized before being used as card textures', () => {
  assert.match(html, /const MAX_DISPLAY_IMAGE_EDGE/);
  assert.match(html, /async function createDisplayImageUrl/);
  assert.match(html, /createImageBitmap/);
  assert.match(html, /canvas\.toBlob/);
  assert.match(html, /await createDisplayImageUrl\(file\)/);
});
