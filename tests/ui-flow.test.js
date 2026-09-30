// Exercise the actual screen wiring without depending on a browser process.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fillCard } from '../src/card-view.js';
import { ANIMALS } from '../src/animals.js';
import { GUESSES } from '../src/lines.js';
import { PLACES, placeKinds } from '../src/places.js';

class Element {
  constructor(tag = 'div') {
    this.tag = tag; this.children = []; this.hidden = false; this.textContent = ''; this.value = '';
    this.events = {}; this.attributes = {}; this.classes = new Set(); this.width = 1280; this.height = 800;
    this.classList = {
      add: value => this.classes.add(value), remove: value => this.classes.delete(value),
      toggle: (value, enabled) => enabled ? this.classes.add(value) : this.classes.delete(value),
      contains: value => this.classes.has(value)
    };
  }
  addEventListener(type, callback) { (this.events[type] ??= []).push(callback); }
  trigger(type, event = {}) { for (const callback of this.events[type] ?? []) callback(event); this[`on${type}`]?.(event); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attributes[key] = value; }
  add(option) { this.children.push(option); }
  getContext() {
    return new Proxy({}, { get: (_, method) => {
      if (method === 'measureText') return text => ({ width: text.length * 9 });
      if (method === 'createLinearGradient' || method === 'createRadialGradient') return () => ({ addColorStop() {} });
      return (...args) => { for (const value of args) if (typeof value === 'number') assert.ok(Number.isFinite(value), `${String(method)} received ${value}`); };
    } });
  }
}

const elements = new Map();
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const match of html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
  const element = new Element(match[1]); element.id = match[2]; element.hidden = /\bhidden\b/.test(match[0]);
  elements.set(element.id, element);
}
elements.get('guide-place').value = 'all';
const $ = id => elements.get(id) ?? [...elements.values()].flatMap(element => element.children).find(child => child.id === id);
const events = {};
const frames = [];
const timers = new Map();
let timerId = 0;
const saved = new Map();
let now = performance.now();
const globals = {
  document: { getElementById: $, createElement: tag => new Element(tag),
    querySelectorAll: () => ['voice-button', 'start-voice-button'].map($), addEventListener() {} },
  navigator: { onLine: false }, localStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) },
  innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
  Option: function(text, value) { this.text = text; this.value = value; },
  addEventListener: (type, callback) => { (events[type] ??= []).push(callback); },
  requestAnimationFrame: callback => frames.push(callback),
  setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
  clearTimeout: id => timers.delete(id)
};
const originals = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
await import('../src/main.js');
const frame = () => { now += 50; frames.shift()(now); };
const flush = () => { for (const [id, callback] of timers) { timers.delete(id); callback(); } };
const key = (type, value) => { for (const callback of events[type] ?? []) callback({ key: value, preventDefault() {} }); };
const click = id => $(id).trigger('click');

try {
  test('home exposes all six habitats and the full collection count', () => {
    assert.equal($('places').children.length, 6);
    assert.equal($('collection-count').textContent, '0 of 51 animals in your Field Guide');
    assert.equal($('guide-place').children.length, 6);
    frame();
  });

  test('a delayed camera card cannot interrupt a newly chosen habitat', () => {
    click('place-swamp');
    for (let i = 0; i < 80 && !$('snap-button').classList.contains('ready'); i++) {
      key('keydown', 'ArrowRight'); frame();
    }
    assert.ok($('snap-button').classList.contains('ready'));
    click('snap-button');
    assert.ok(timers.size > 0, 'a first discovery queued its card');
    click('home-button'); click('place-gulf'); flush();
    assert.equal($('hud-place').textContent, 'Gulf Shore');
    assert.equal($('card').hidden, true);
    click('home-button');
  });

  test('a new animal card asks what it is before telling', () => {
    click('place-swamp'); frame();
    for (let i = 0; i < 300 && !$('snap-button').classList.contains('ready'); i++) {
      key('keydown', 'ArrowRight'); frame();
    }
    click('snap-button');
    const [[id, openCard]] = timers; timers.delete(id); openCard();
    assert.equal($('card').hidden, false);
    assert.ok($('card').classList.contains('guessing'), 'the answer starts hidden');
    assert.ok(GUESSES.includes($('card-kicker').textContent));
    click('card-tell');
    assert.ok(!$('card').classList.contains('guessing'));
    assert.equal($('card-kicker').textContent, 'You found a new animal!');
    assert.equal(timers.size, 0, 'telling early stops the wait');
    click('card-close'); click('home-button');
  });

  test('the live screen flow discovers all animals, replays the guide, and changes habitats', () => {
    for (const [habitat, place] of Object.entries(PLACES)) {
      click(`place-${habitat}`);
      assert.equal($('hud-place').textContent, place.name);
      let budget = 0;
      while (budget++ < 1400) {
        frame();
        if (!$('card').hidden) { click('card-close'); continue; }
        if (!$('ranger').hidden) { click('ranger-home'); break; }
        if ($('snap-button').classList.contains('ready')) { click('snap-button'); flush(); continue; }
        if ($('hud-count').textContent === `${placeKinds(place).length} of ${placeKinds(place).length} found`) { click('home-button'); break; }
        key('keydown', 'ArrowRight');
      }
      assert.ok(budget < 1400, `${place.name} did not complete`);
      assert.equal($('hud-count').textContent, `${placeKinds(place).length} of ${placeKinds(place).length} found`);
    }
    assert.equal($('collection-count').textContent, '51 of 51 animals in your Field Guide');
    assert.equal(JSON.parse(saved.get('wildlife-players-v1')).list.Explorer.found.length, 51);
    click('start-guide-button');
    assert.equal($('guide-grid').children.length, 51);
    const bullfrogSlot = $('guide-grid').children.find(slot => slot.attributes['aria-label'] === 'American bullfrog');
    assert.equal(bullfrogSlot.children[0].src, 'art/animals/thumbs/bullfrog.webp', 'the guide shows a small copy');
    for (const slot of $('guide-grid').children) {
      assert.ok(existsSync(new URL(`../${slot.children[0].src}`, import.meta.url)), `${slot.children[0].src} is missing`);
    }
    bullfrogSlot.trigger('click');
    assert.equal($('card-name').textContent, ANIMALS.bullfrog.name);
    assert.equal($('card-say').textContent, ANIMALS.bullfrog.say);
    assert.equal($('card-image').src, 'art/animals/bullfrog.webp', 'the saved photo shows offline');
    assert.match($('card-credit').textContent, /^Photo:/);
    click('card-close');
    assert.equal($('guide').hidden, false);
    $('guide-place').value = 'swamp'; $('guide-place').trigger('change');
    assert.equal($('guide-grid').children.length, 12);
    click('guide-close');
  });


  test('each player has their own Field Guide and a list of what they found', () => {
    click('players-button');
    assert.equal($('players').hidden, false);
    const [explorer] = $('players-list').children;
    assert.match(explorer.children[1].textContent, /^51 of 51 animals/);
    assert.match(explorer.children[2].textContent, / · Gulf Shore · today /, 'the latest find comes first');
    $('player-name').value = ' Emma ';
    $('player-form').trigger('submit', { preventDefault() {} });
    assert.equal($('players-button').textContent, '👤 Emma');
    assert.equal($('collection-count').textContent, '0 of 51 animals in your Field Guide');
    click('players-button');
    $('players-list').children[0].trigger('click');
    assert.equal($('collection-count').textContent, '51 of 51 animals in your Field Guide');
    assert.equal(JSON.parse(saved.get('wildlife-players-v1')).current, 'Explorer');
  });

  test('new animal photos load from the device and show labeled art if loading fails', () => {
    navigator.onLine = true;
    fillCard('bullfrog', false);
    assert.equal($('card-image').src, 'art/animals/bullfrog.webp');
    assert.match($('card-credit').textContent, /^Photo:/);
    $('card-image').trigger('error');
    assert.equal($('card-image').src, 'art/animals/bullfrog.svg');
    assert.match($('card-credit').textContent, /^Drawing:/);
    assert.match($('card-image').alt, /illustration/);
    navigator.onLine = false;
  });

} finally {
  // Tests execute after module evaluation; restore globals only after they have finished.
  process.on('exit', () => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
}
