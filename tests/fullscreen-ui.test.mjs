import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('fullscreen controls float as a bottom-right glass overlay', () => {
  const viewerRule = html.match(/\.viewer \{[^}]+\}/s)?.[0] ?? '';
  const toolbarRule = html.match(/\.viewer-toolbar \{[^}]+\}/s)?.[0] ?? '';
  const buttonRule = html.match(/\.toolbar-button \{[^}]+\}/s)?.[0] ?? '';

  assert.match(viewerRule, /display:\s*block/);
  assert.match(toolbarRule, /position:\s*absolute/);
  assert.match(toolbarRule, /right:\s*calc\(env\(safe-area-inset-right, 0px\) \+ 18px\)/);
  assert.match(toolbarRule, /bottom:\s*calc\(env\(safe-area-inset-bottom, 0px\) \+ 18px\)/);
  assert.match(toolbarRule, /backdrop-filter:\s*blur\(24px\) saturate\(1\.65\)/);
  assert.match(buttonRule, /background:\s*rgba\(255, 255, 255, 0\.13\)/);
});

test('fullscreen card sizing is selected from the larger possible viewport fit', () => {
  assert.match(html, /function selectFullscreenFit/);
  assert.match(html, /const widthFitHeight = viewportWidth \/ cardRatio/);
  assert.match(html, /const heightFitWidth = viewportHeight \* cardRatio/);
  assert.match(html, /fullscreen-card-width/);
  assert.match(html, /fullscreen-card-height/);
  assert.match(html, /visualViewport/);
});

test('fullscreen card deliberately bleeds past the exact viewport fit', () => {
  const viewerCardRule = html.match(/\.viewer \.holo-card \{[^}]+\}/s)?.[0] ?? '';

  assert.match(html, /const FULLSCREEN_BLEED_SCALE = 1\.08/);
  assert.match(html, /fit\.width \* FULLSCREEN_BLEED_SCALE/);
  assert.match(html, /fit\.height \* FULLSCREEN_BLEED_SCALE/);
  assert.match(viewerCardRule, /max-height:\s*none/);
  assert.doesNotMatch(viewerCardRule, /max-width:/);
});

test('fullscreen background stays blank behind the masked image effect', () => {
  const viewerRule = html.match(/\.viewer \{[^}]+\}/s)?.[0] ?? '';
  const viewerGlowRule = html.match(/\.viewer-glow \{[^}]+\}/s)?.[0] ?? '';

  assert.match(viewerRule, /background:\s*#000/);
  assert.doesNotMatch(viewerRule, /radial-gradient/);
  assert.match(viewerGlowRule, /display:\s*none/);
});

test('visible annotation copy is removed from the interface', () => {
  assert.doesNotMatch(html, /class="lead"/);
  assert.doesNotMatch(html, /class="preview-note"/);
  assert.doesNotMatch(html, /class="status"/);
  assert.doesNotMatch(html, /id="liveMode" class="live-mode"/);
});
