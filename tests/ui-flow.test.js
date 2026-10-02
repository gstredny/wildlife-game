// Exercise the actual screen wiring without depending on a browser process.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fillCard } from '../src/card-view.js';
import { ANIMALS } from '../src/animals.js';
import { LEVELS } from '../src/levels.js';
import { GUESSES } from '../src/lines.js';
import { PLACES, placeKinds } from '../src/places.js';
import { createWalk } from '../src/trail.js';
import { carefulJump } from './careful.js';

class Element {
  constructor(tag = 'div') {
    this.tag = tag; this.children = []; this.hidden = false; this.textContent = ''; this.value = '';
    this.events = {}; this.attributes = {}; this.classes = new Set(); this.width = 1280; this.height = 800; this.style = {};
    this.classList = {
      add: value => this.classes.add(value), remove: value => this.classes.delete(value),
      toggle: (value, enabled) => enabled ? this.classes.add(value) : this.classes.delete(value),
      contains: value => this.classes.has(value)
    };
  }
  addEventListener(type, callback) { (this.events[type] ??= []).push(callback); }
  click() { this.trigger('click'); }
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
const descendants = node => (node.children ?? []).flatMap(child => [child, ...descendants(child)]);
const $ = id => elements.get(id) ?? [...elements.values()].flatMap(descendants).find(child => child.id === id);
const level1 = LEVELS[0];
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
const game = await import('../src/main.js');
const frame = () => { now += 50; frames.shift()(now); };
const flush = () => { for (const [id, callback] of timers) { timers.delete(id); callback(); } };
const key = (type, value) => { for (const callback of events[type] ?? []) callback({ key: value, preventDefault() {} }); };
const click = id => $(id).trigger('click');
// Taps the right name on the animal card.
const pickRight = () => $('card-choices').children.find(choice => choice.textContent === $('card-name').textContent).trigger('click');
const paws = () => $('hud-paws').attributes['aria-label'];
// The big name buttons on the home screen, and the one picked.
const names = () => $('player-names').children.map(button => button.textContent);
const currentName = () => $('player-names').children.find(button => button.classList.contains('current'))?.textContent;
// One frame of play with the arrow keys, running right, careful or careless (see careful.js).
function play(careful) {
  key(carefulJump(game.currentWalk(), careful) ? 'keydown' : 'keyup', 'ArrowUp');
  key('keydown', 'ArrowRight');
}

try {
  test('the trail map shows level 1 to play, and misty stops for the levels ahead', () => {
    assert.equal($('collection-count').textContent, '0 of 60 animals in your Field Guide');
    assert.equal($('guide-place').children.length, 6);
    const [hero, stops] = $('places').children;
    assert.equal(hero.id, `place-${level1}`);
    assert.equal(hero.children.find(span => span.className === 'place-level').textContent, 'Level 1');
    assert.deepEqual(stops.children.map(stop => stop.className), ['map-stop now', ...Array(5).fill('map-stop locked')]);
    assert.deepEqual(stops.children.slice(1).map(stop => stop.children[1].textContent), ['Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'], 'no names ahead');
    assert.equal($(`place-${LEVELS[1]}`), undefined, 'level 2 cannot be started');
    frame();
  });

  test('a delayed camera card cannot interrupt a newly started level', () => {
    click(`place-${level1}`);
    for (let i = 0; i < 80 && timers.size === 0; i++) {
      key('keydown', 'ArrowRight'); key('keydown', 'ArrowUp'); frame();
    }
    assert.ok(timers.size > 0, 'reaching the first hiding spot queued its card');
    click('home-button'); click(`place-${level1}`); flush();
    assert.equal($('hud-place').textContent, PLACES[level1].name);
    assert.equal($('hud-level').textContent, 'Level 1');
    assert.equal($('card').hidden, true);
    click('home-button');
  });

  test('an animal card asks what it is, with three names to pick from', () => {
    click(`place-${level1}`); frame();
    const total = placeKinds(PLACES[level1]).length;
    assert.equal(paws(), `0 of ${total} animals named`);
    for (let i = 0; i < 300 && timers.size === 0; i++) {
      key('keydown', 'ArrowRight'); key('keydown', 'ArrowUp'); frame();
    }
    const [[id, openCard]] = timers; timers.delete(id); openCard();
    assert.equal($('card').hidden, false);
    assert.ok($('card').classList.contains('guessing'), 'the answer starts hidden');
    assert.ok(GUESSES.includes($('card-kicker').textContent));
    const answer = $('card-name').textContent;
    const choices = $('card-choices').children;
    assert.equal(choices.length, 3);
    assert.equal(choices.filter(choice => choice.textContent === answer).length, 1, 'the right name is there once');
    flush();
    assert.ok($('card').classList.contains('guessing'), 'the picture waits until the child picks');
    const wrong = choices.find(choice => choice.textContent !== answer);
    wrong.trigger('click');
    assert.ok(wrong.disabled && wrong.classList.contains('wrong'), 'a wrong name grays out');
    assert.ok($('card').classList.contains('guessing'), 'a wrong name tells nothing');
    choices.find(choice => choice.textContent === answer).trigger('click');
    assert.ok(!$('card').classList.contains('guessing'));
    assert.equal($('card-kicker').textContent, "That's right!", 'found in the test before, so not new');
    assert.equal(paws(), `0 of ${total} animals named`, 'a gold paw takes the right name on the first try');
    assert.equal(timers.size, 0, 'the card waits for the tap, with no timer');
    click('card-close');
    // Meeting the same animal again asks again, with the names picked fresh.
    click('snap-button'); flush();
    assert.equal($('card').hidden, false);
    assert.ok($('card').classList.contains('guessing'));
    assert.equal($('card-name').textContent, answer);
    assert.equal($('card-choices').children.length, 3);
    pickRight();
    assert.equal($('card-kicker').textContent, "That's right!");
    assert.equal(paws(), `1 of ${total} animals named`);
    assert.equal($('hud-paws').children[0].textContent, '🐾', 'one gold paw');
    assert.equal($('hud-paws').children[1].textContent, '🐾'.repeat(total - 1), 'the rest still to earn');
    click('card-close');
    // The next bush holds an animal not in the Field Guide yet.
    for (let i = 0; i < 300 && timers.size === 0; i++) {
      key('keydown', 'ArrowRight'); key('keydown', 'ArrowUp'); frame();
    }
    flush(); pickRight();
    assert.equal($('card-kicker').textContent, "That's right! A new animal!");
    assert.equal(paws(), `2 of ${total} animals named`);
    click('card-close'); click('home-button');
    click(`place-${level1}`);
    assert.equal(paws(), `0 of ${total} animals named`, 'each walk earns its paws again');
    click('home-button');
  });

  test('a hit costs a heart, losing all three is game over, and Try again starts at the last bush', () => {
    click(`place-${level1}`);
    assert.equal($('hud-lives').textContent, '❤️❤️❤️');
    for (let i = 0; i < 4000 && $('gameover').hidden; i++) {
      frame();
      if (!$('card').hidden) { click('card-close'); continue; }
      if (timers.size) { flush(); continue; }
      if ($('gameover').hidden) play(false);
    }
    assert.equal($('gameover').hidden, false, 'game over');
    assert.equal($('hud-lives').textContent, '🤍🤍🤍');
    assert.equal($('gameover-place').textContent, PLACES[level1].name);
    const { checkpoint, met } = game.currentWalk();
    const metBefore = met.size;
    assert.ok(checkpoint > createWalk(PLACES[level1]).x, 'a bush was reached');
    click('gameover-retry');
    assert.equal($('gameover').hidden, true);
    assert.equal($('hud-place').textContent, PLACES[level1].name);
    assert.equal($('hud-lives').textContent, '❤️❤️❤️');
    assert.equal(game.currentWalk().x, checkpoint, 'back at the last bush reached, not the start');
    assert.equal(game.currentWalk().met.size, metBefore, 'the animals met stay out');
    click('home-button');
  });

  test('beating each level opens the next, through to Master Ranger, with every find kept', () => {
    click(`place-${level1}`);
    LEVELS.forEach((habitat, index) => {
      const place = PLACES[habitat];
      const next = LEVELS[index + 1];
      assert.equal($('hud-place').textContent, place.name);
      assert.equal($('hud-level').textContent, `Level ${index + 1}`);
      let budget = 0;
      while (budget++ < 1400) {
        frame();
        if (!$('card').hidden) { pickRight(); click('card-close'); continue; }
        if (!$('ranger').hidden) {
          const total = placeKinds(place).length;
          const cheer = `You found all ${total} animals and caught \\d+ of ${place.stars.length} stars! You named ${total} of ${total} on the first try!`;
          assert.equal(JSON.parse(saved.get('wildlife-players-v1')).list.Explorer.level, index + 2, 'the next level is saved at the flag');
          assert.equal($('ranger-place').textContent, `Level ${index + 1} · ${place.name}`);
          if (next) {
            assert.match($('ranger-message').textContent, new RegExp(`^${cheer} A new trail opened: ${PLACES[next].name}!$`));
            assert.equal($('ranger-title').textContent, 'Junior Ranger!');
            assert.equal($('ranger-next').hidden, false);
            // From the bigger prairie, go by the trail map to the smaller Gulf Shore.
            if (habitat === 'prairie') {
              click('ranger-home');
              assert.equal($('start').hidden, false, 'the trail map opens');
              click(`place-${next}`);
            } else click('ranger-next');
          } else {
            assert.match($('ranger-message').textContent, new RegExp(`^${cheer} You explored every trail around Katy, Texas!$`));
            assert.equal($('ranger-title').textContent, 'Master Ranger!');
            assert.equal($('ranger-next').hidden, true);
            click('ranger-home');
          }
          break;
        }
        if (timers.size) { flush(); continue; }
        assert.equal($('gameover').hidden, true, `${place.name}: the careful player lost every heart`);
        play(true);
      }
      assert.ok(budget < 1400, `${place.name} did not complete`);
    });
    assert.equal($('collection-count').textContent, '60 of 60 animals in your Field Guide');
    assert.equal(JSON.parse(saved.get('wildlife-players-v1')).list.Explorer.found.length, 60);
    const [done, stops] = $('places').children;
    assert.equal(done.className, 'place-card level-done');
    assert.deepEqual(stops.children.map(stop => stop.className), Array(6).fill('map-stop beaten'));
    for (const habitat of LEVELS) assert.equal($(`place-${habitat}`).tag, 'button', `${habitat} can be played again`);
    click('place-bayou');
    assert.equal($('hud-level').textContent, 'Level 3');
    click('home-button');
    click('start-guide-button');
    assert.equal($('guide-grid').children.length, 60);
    const bullfrogSlot = $('guide-grid').children.find(slot => slot.attributes['aria-label'] === 'American bullfrog');
    assert.equal(bullfrogSlot.children[0].src, 'art/animals/thumbs/bullfrog.webp', 'the guide shows a small copy');
    for (const slot of $('guide-grid').children) {
      assert.ok(existsSync(new URL(`../${slot.children[0].src}`, import.meta.url)), `${slot.children[0].src} is missing`);
    }
    bullfrogSlot.trigger('click');
    assert.equal($('card-name').textContent, ANIMALS.bullfrog.name);
    assert.equal($('card-say').textContent, ANIMALS.bullfrog.say);
    assert.equal($('card-image').src, 'art/animals/bullfrog.webp', 'the saved photo shows offline');
    assert.equal($('card-more'), undefined, 'no Learn more link for a child to get lost in');
    assert.match($('card-credit').textContent, /^Photo:/);
    click('card-close');
    assert.equal($('guide').hidden, false);
    $('guide-place').value = 'swamp'; $('guide-place').trigger('change');
    assert.equal($('guide-grid').children.length, 14);
    click('guide-close');
  });


  test('each player has their own Field Guide and level, and a big name button on the home screen', () => {
    assert.deepEqual(names(), ['Explorer']);
    click('players-button');
    assert.equal($('players').hidden, false);
    const [explorer] = $('players-list').children;
    const [pick, remove] = explorer.children;
    assert.equal(pick.textContent, '✓ Explorer', 'just the name');
    assert.equal(remove.hidden, true, 'the only player cannot be removed');
    $('player-name').value = ' Emma ';
    $('player-form').trigger('submit', { preventDefault() {} });
    assert.deepEqual(names(), ['Explorer', 'Emma']);
    assert.equal(currentName(), 'Emma');
    assert.equal($('collection-count').textContent, '0 of 60 animals in your Field Guide');
    assert.equal($('places').children[0].id, `place-${level1}`, 'Emma starts at level 1');
    assert.equal($(`place-${LEVELS[1]}`), undefined);
    // One tap on a name on the home screen switches player.
    $('player-names').children[0].trigger('click');
    assert.equal(currentName(), 'Explorer');
    assert.equal($('collection-count').textContent, '60 of 60 animals in your Field Guide');
    assert.equal(JSON.parse(saved.get('wildlife-players-v1')).current, 'Explorer');
    assert.equal($('places').children[0].className, 'place-card level-done', 'the map follows the player');
  });

  test('three players at most; Remove asks for a second tap', () => {
    click('players-button');
    assert.equal($('player-form').hidden, false);
    $('player-name').value = 'Max';
    $('player-form').trigger('submit', { preventDefault() {} });
    assert.equal(currentName(), 'Max');
    click('players-button');
    assert.equal($('players-list').children.length, 3);
    assert.equal($('player-form').hidden, true, 'no fourth player');
    assert.equal($('players-full').hidden, false);
    const removeMax = () => $('players-list').children[2].children[1];
    assert.equal(removeMax().textContent, 'Remove');
    removeMax().trigger('click');
    assert.equal(removeMax().textContent, 'Tap again to remove');
    assert.equal($('players-list').children.length, 3, 'one tap removes nobody');
    removeMax().trigger('click');
    assert.deepEqual(Object.keys(JSON.parse(saved.get('wildlife-players-v1')).list), ['Explorer', 'Emma']);
    assert.equal(JSON.parse(saved.get('wildlife-players-v1')).current, 'Explorer', 'the first player left takes over');
    assert.deepEqual(names(), ['Explorer', 'Emma']);
    assert.equal(currentName(), 'Explorer');
    assert.equal($('player-form').hidden, false);
    click('players-close');
  });

  test('a Field Guide card keeps a photo of the animal seen for real, with the day and a sticker', () => {
    click('start-guide-button');
    const cardinal = () => $('guide-grid').children.find(slot => slot.attributes['aria-label'].startsWith(ANIMALS.cardinal.name));
    assert.equal(cardinal().classList.contains('seen'), false);
    cardinal().trigger('click');
    assert.equal($('card-seen-button').hidden, false, 'the Field Guide card has the button');
    assert.equal($('card-seen').hidden, true, 'no polaroid before a photo');
    let opened = 0;
    $('seen-camera').addEventListener('click', () => opened++);
    click('card-seen-button');
    assert.equal(opened, 1, 'the button opens the camera or photo library');
    $('seen-camera').files = [new Blob(['photo'], { type: 'image/jpeg' })];
    $('seen-camera').trigger('change');
    assert.equal($('card-seen').hidden, false);
    assert.match($('card-seen-date').textContent, /^Seen for real! \S/);
    assert.match($('card-seen-image').src, /^blob:/, 'the photo shows at once');
    assert.equal(typeof JSON.parse(saved.get('wildlife-players-v1')).list.Explorer.seen.cardinal, 'number');
    click('card-close');
    assert.equal(cardinal().classList.contains('seen'), true, 'a gold sticker in the Field Guide');
    assert.equal(cardinal().attributes['aria-label'], `${ANIMALS.cardinal.name}, seen for real`);
    click('guide-close');
    // On the trail, the card has no camera button and no polaroid.
    click(`place-${level1}`); frame();
    for (let i = 0; i < 300 && timers.size === 0; i++) {
      key('keydown', 'ArrowRight'); key('keydown', 'ArrowUp'); frame();
    }
    flush();
    pickRight();
    assert.equal($('card-seen-button').hidden, true, 'no camera button on the trail');
    assert.equal($('card-seen').hidden, true);
    click('card-close');
    click('home-button');
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
