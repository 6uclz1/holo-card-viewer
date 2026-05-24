import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('webgl canvas rendering coexists with the css fallback layers', () => {
  assert.match(html, /<canvas id="previewCanvas" class="holo-canvas"/);
  assert.match(html, /<canvas id="fullCanvas" class="holo-canvas"/);
  assert.match(html, /class HoloRenderer/);
  assert.match(html, /getContext\('webgl'/);
  assert.match(html, /\.holo-card\.is-webgl-rendered \.card-image/);
  assert.match(html, /\.holo-card\.is-webgl-rendered \.foil/);
  assert.match(html, /\.foil-base/);
});

test('adaptive render quality profiles are fixed and device-neutral', () => {
  assert.match(html, /const RENDER_QUALITY_PROFILES = \{/);
  assert.match(html, /high:\s*\{[^}]*frameInterval:\s*1000 \/ 60[^}]*maxDpr:\s*1\.5/s);
  assert.match(html, /balanced:\s*\{[^}]*frameInterval:\s*1000 \/ 45[^}]*maxDpr:\s*1\.25/s);
  assert.match(html, /low:\s*\{[^}]*frameInterval:\s*1000 \/ 30[^}]*maxDpr:\s*1/s);
  assert.match(html, /minimum:\s*\{[^}]*frameInterval:\s*1000 \/ 24[^}]*maxDpr:\s*0\.75/s);
  assert.doesNotMatch(html, /MOBILE_RENDER_FRAME_INTERVAL/);
  assert.doesNotMatch(html, /DESKTOP_RENDER_FRAME_INTERVAL/);
});

test('frame cost metrics adapt quality up and down', () => {
  assert.match(html, /function selectAdaptiveQualityProfile/);
  assert.match(html, /slowFrames >= 12/);
  assert.match(html, /fastFrames >= 180/);
  assert.match(html, /ewmaFrameCost > frameBudget \* 1\.25/);
  assert.match(html, /ewmaFrameCost < frameBudget \* 0\.75/);
  assert.match(html, /data-render-quality/);
});

test('fullscreen render loop uses the active quality frame interval without raf busy waiting', () => {
  const renderLoop = html.match(/function startRenderLoop\(\) \{(?<body>[\s\S]+?)\n  function startPreviewIdleLoop/)?.groups?.body ?? '';

  assert.match(html, /function getRenderFrameInterval/);
  assert.match(renderLoop, /fullRenderer\.getFrameInterval\(\)/);
  assert.match(renderLoop, /window\.setTimeout/);
  assert.match(renderLoop, /requestAnimationFrame/);
  assert.doesNotMatch(renderLoop, /now - lastFrameAt < frameInterval/);
});

test('preview idle rendering pauses during fullscreen or hidden tabs', () => {
  const previewLoop = html.match(/function startPreviewIdleLoop\(\) \{(?<body>[\s\S]+?)\n  function resetMotionState/)?.groups?.body ?? '';

  assert.match(previewLoop, /active \|\| document\.hidden/);
  assert.match(previewLoop, /previewRenderer\.resetPerformance\(\)/);
  assert.match(previewLoop, /previewRenderer\.getFrameInterval\(\)/);
  assert.match(previewLoop, /window\.setTimeout/);
});

test('pointer handlers update intent only and do not paint directly', () => {
  const previewHandler = html.match(/function handlePreviewPointerMove\(event\) \{(?<body>[\s\S]+?)\n  function handlePreviewPointerLeave/)?.groups?.body ?? '';
  const viewerHandler = html.match(/function handleViewerPointerMove\(event\) \{(?<body>[\s\S]+?)\n  function handleOrientation/)?.groups?.body ?? '';

  assert.match(html, /const previewTarget = \{ x: 0, y: 0, sparkle: 0 \}/);
  assert.match(previewHandler, /previewTarget\.x = tilt\.x/);
  assert.match(viewerHandler, /target\.x = tilt\.x/);
  assert.doesNotMatch(previewHandler, /setCardPose/);
  assert.doesNotMatch(viewerHandler, /setCardPose/);
});

test('card geometry reads are cached and invalidated by layout changes', () => {
  assert.match(html, /function getCachedElementRect/);
  assert.match(html, /function invalidateRectCache/);
  assert.match(html, /window\.addEventListener\('resize', invalidateRectCache/);
  assert.match(html, /visualViewport\?\.addEventListener\('resize', invalidateRectCache/);
});

test('large raster uploads are resized before being used as card textures', () => {
  assert.match(html, /const MAX_DISPLAY_IMAGE_EDGE/);
  assert.match(html, /async function createDisplayImageUrl/);
  assert.match(html, /createImageBitmap/);
  assert.match(html, /canvas\.toBlob/);
  assert.match(html, /await createDisplayImageUrl\(file\)/);
});

test('svg sources are rasterized before webgl texture upload', () => {
  assert.match(html, /createTextureSource\(image\)/);
  assert.match(html, /image\.dataset\.sourceType === 'image\/svg\+xml'/);
  assert.match(html, /context\.drawImage\(image, 0, 0, width, height\)/);
  assert.match(html, /loadImageUrl\(nextUrl, \{ sourceType: file\.type \}\)/);
});
