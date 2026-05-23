import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const tradingCardEffects = [
  ['secret', '秘光 - シークレットレア風'],
  ['cosmos', '星雲 - コスモホロ風'],
  ['parallel', '並光 - パラレルレア風'],
  ['reverse', '反射 - リバースホロ風'],
];

test('trading-card inspired holo effects are selectable', () => {
  for (const [value, label] of tradingCardEffects) {
    assert.match(html, new RegExp(`<option value="${value}">${label}</option>`));
  }
});

test('trading-card inspired holo effects are registered as switchable classes', () => {
  for (const [value] of tradingCardEffects) {
    assert.match(html, new RegExp(`'effect-${value}'`));
  }
});

test('trading-card inspired holo effects define all visual layers', () => {
  for (const [value] of tradingCardEffects) {
    assert.match(html, new RegExp(`\\.effect-${value} \\.foil-base`));
    assert.match(html, new RegExp(`\\.effect-${value} \\.foil-sheen`));
    assert.match(html, new RegExp(`\\.effect-${value} \\.foil-texture`));
  }
});
