import test from 'node:test';
import assert from 'node:assert/strict';
import { ANIMALS } from '../src/animals.js';
import { loadPlayers, recordFind, savePlayers } from '../src/players.js';
import { baseY } from '../src/layout.js';
import { BOXES, PAINTERS } from '../src/painters.js';
import { PLACES, placeKinds } from '../src/places.js';
import { carefulJump } from './careful.js';
import { createWalk, jump, LIVES, snap, stepWalk } from '../src/trail.js';

const storage = () => ({ data: new Map(), getItem(key) { return this.data.get(key); }, setItem(key, value) { this.data.set(key, value); } });

test('six habitats cover all 60 animals, including the requested swamp wildlife', () => {
  assert.equal(Object.keys(PLACES).length, 6);
  assert.equal(Object.keys(ANIMALS).length, 60);
  const residents = new Set(Object.values(PLACES).flatMap(placeKinds));
  assert.deepEqual([...residents].sort(), Object.keys(ANIMALS).sort());
  for (const kind of ['bullfrog', 'nightHeron', 'woodDuck', 'alligator']) assert.ok(placeKinds(PLACES.swamp).includes(kind));
});

for (const [key, place] of Object.entries(PLACES)) {
  test(`a careful child can finish ${place.name} with all ${LIVES} hearts, finding every animal`, () => {
    const walk = createWalk(place);
    for (let frame = 0; frame < 60 * 120 && walk.endedAt === null; frame++) {
      if (carefulJump(walk)) jump(walk);
      assert.equal(stepWalk(walk, 1 / 60, 1).died, undefined, `${key}: hit at ${Math.round(walk.x)}`);
    }
    assert.notEqual(walk.endedAt, null, `${key}: reached the goal flag`);
    assert.equal(walk.lives, LIVES);
    assert.equal(walk.found.size, placeKinds(place).length);
  });
}

test('shared species keep their discoveries when moving habitats and reloading', () => {
  const saved = storage();
  const players = loadPlayers(saved);
  const swamp = createWalk(PLACES.swamp, new Set());
  const gator = PLACES.swamp.animals.find(animal => animal.kind === 'alligator');
  assert.equal(snap(swamp, gator).first, true);
  recordFind(players, 'alligator', 'swamp');
  savePlayers(players, saved);
  const again = loadPlayers(saved);
  const bayou = createWalk(PLACES.bayou, new Set(again.list[again.current].found));
  assert.equal(snap(bayou, PLACES.bayou.animals.find(animal => animal.kind === 'alligator')).first, false);
  assert.equal(bayou.found.size, 1);
});

test('every animal has a drawing and a finite, usable tap box in its assigned lane', () => {
  for (const place of Object.values(PLACES)) for (const animal of place.animals) {
    assert.equal(typeof PAINTERS[animal.kind], 'function', animal.kind);
    const box = BOXES[animal.kind];
    assert.ok(box.left < box.right && box.top < 0, animal.kind);
    assert.ok(Number.isFinite(baseY(animal)));
    assert.ok(['back', 'tree', 'air', 'perch'].includes(animal.lane));
    if (animal.lane === 'tree') assert.ok(place.trees.includes(animal.x));
  }
});
