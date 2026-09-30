import test from "node:test";
import assert from "node:assert/strict";
import { PLACES, placeKinds } from "../src/places.js";
import { animalAt, createWalk, EDGE, REACH, snap, snapTarget, stepWalk, walkTo, WALK_SPEED } from "../src/trail.js";

const bayou = PLACES.bayou;
const heron = bayou.animals.find(animal => animal.kind === "heron");

test("the Bayou Trail keeps its original animals and adds more local wildlife", () => {
  for (const kind of ["alligator", "cicada", "coyote", "deer", "hog", "ibis", "spoonbill", "heron", "riverOtter", "kingfisher"]) {
    assert.ok(placeKinds(bayou).includes(kind), `${kind} belongs on Bayou Trail`);
  }
});

test("arrow keys walk the explorer and stop at the ends of the trail", () => {
  const walk = createWalk(bayou);
  stepWalk(walk, 1, 1);
  assert.equal(walk.x, EDGE + 40 + WALK_SPEED);
  assert.equal(walk.facing, 1);
  for (let second = 0; second < 5; second++) stepWalk(walk, 1, -1);
  assert.equal(walk.x, EDGE);
  assert.equal(walk.facing, -1);
});

test("an animal wanders around its home and never leaves its range", () => {
  const coyote = bayou.animals.find(animal => animal.kind === "coyote");
  const places = Array.from({ length: 200 }, (_, step) => animalAt(coyote, step * 0.37));
  assert.ok(places.every(place => Math.abs(place.x - coyote.x) <= coyote.roam + 1e-9));
  assert.ok(places.some(place => place.walking) && places.some(place => !place.walking));
});

test("only animals in reach can have their picture taken, new ones first", () => {
  const walk = createWalk(bayou);
  assert.equal(snapTarget(walk), null);
  walk.x = heron.x;
  assert.equal(snapTarget(walk).kind, "heron");
  walk.x = animalAt(heron, 0).x + REACH + 400;
  assert.notEqual(snapTarget(walk)?.kind, "heron");
});

test("tapping a far animal walks the explorer over and takes its picture", () => {
  const walk = createWalk(bayou);
  walkTo(walk, heron.x, heron);
  let result = {};
  for (let frame = 0; frame < 600 && !result.snap; frame++) result = stepWalk(walk, 1 / 60);
  assert.deepEqual(result.snap, { kind: "heron", first: true });
  assert.ok(walk.found.has("heron"));
  assert.equal(walk.target, null);
});

test("a second picture of the same kind is not a first", () => {
  const walk = createWalk(bayou);
  assert.equal(snap(walk, heron).first, true);
  assert.equal(snap(walk, heron).first, false);
});

test("pressing an arrow cancels a walk to a tapped spot", () => {
  const walk = createWalk(bayou);
  walkTo(walk, 3000);
  stepWalk(walk, 0.1, -1);
  assert.equal(walk.target, null);
});

test("reaching the end of the trail is reported once", () => {
  const walk = createWalk(bayou);
  const ends = [];
  for (let second = 0; second < 40; second++) if (stepWalk(walk, 1, 1).end) ends.push(second);
  assert.equal(ends.length, 1);
  assert.equal(walk.x, bayou.length - EDGE);
});
