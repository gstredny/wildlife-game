import test from "node:test";
import assert from "node:assert/strict";
import { PLACES, placeKinds } from "../src/places.js";
import { animalAtPoint, baseY } from "../src/layout.js";
import { cycle, FALL, hazardAt, HAZARDS } from "../src/hazards.js";
import { animalAt, createWalk, EDGE, jump, LIVES, REACH, snap, snapTarget, SPOT, stepWalk, walkTo, WALK_SPEED } from "../src/trail.js";

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

test("an animal hides at its spot until the explorer gets there, then comes out for its picture", () => {
  const walk = createWalk(bayou);
  walk.x = heron.x - 150;
  assert.equal(snapTarget(walk), null, "no picture of a hiding animal");
  assert.equal(animalAtPoint(walk, { x: heron.x, y: baseY(heron) - 10 }), null, "no tapping a hiding animal");
  let result = {};
  for (let frame = 0; frame < 120 && !result.snap; frame++) result = stepWalk(walk, 1 / 60, 1);
  assert.deepEqual(result.snap, { kind: "heron", first: true });
  assert.ok(Math.abs(walk.x - heron.x) < SPOT);
  assert.ok(walk.found.has("heron"));
});

test("an animal already found is out in the open, and the camera can take its picture again", () => {
  const walk = createWalk(bayou, new Set(["heron"]));
  walk.x = heron.x;
  assert.equal(snapTarget(walk).kind, "heron");
  assert.equal(stepWalk(walk, 1 / 60).snap, undefined, "walking past it opens no card");
  walk.x = animalAt(heron, 0).x + REACH + 400;
  assert.notEqual(snapTarget(walk)?.kind, "heron");
});

test("tapping a found animal far away walks the explorer over for another picture", () => {
  const walk = createWalk(bayou, new Set(placeKinds(bayou)));
  walkTo(walk, heron.x, heron);
  let result = {};
  for (let frame = 0; frame < 600 && !result.snap; frame++) result = stepWalk(walk, 1 / 60);
  assert.deepEqual(result.snap, { kind: "heron", first: false });
  assert.equal(walk.target, null);
});

test("a walk to a tapped spot stops at the first animal hiding on the way", () => {
  const walk = createWalk(bayou);
  walkTo(walk, 3000);
  let result = {};
  for (let frame = 0; frame < 600 && !result.snap; frame++) result = stepWalk(walk, 1 / 60);
  assert.equal(result.snap?.kind, bayou.animals[0].kind);
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

test("reaching the goal flag at the end of the trail is reported once", () => {
  const walk = createWalk(bayou);
  assert.equal(walk.endedAt, null);
  walk.x = bayou.animals.at(-1).x;
  const ends = [];
  for (let frame = 0; frame < 60 * 10; frame++) {
    if (stepWalk(walk, 1 / 60, 1).end) ends.push(walk.time);
  }
  assert.equal(ends.length, 1);
  assert.equal(walk.endedAt, ends[0], "the flag goes up from then");
  assert.equal(walk.x, bayou.length - EDGE);
});

// Walks right for `seconds` at 60 frames a second, jumping whenever `hop` says so.
function run(walk, seconds, hop = () => false) {
  let stars = 0;
  for (let frame = 0; frame < seconds * 60; frame++) {
    if (hop(walk)) jump(walk);
    stars += stepWalk(walk, 1 / 60, 1).stars ?? 0;
  }
  return stars;
}

test("each level starts with three hearts, and losing the last one is game over", () => {
  assert.equal(createWalk(bayou).lives, 3);
  assert.equal(LIVES, 3);
  const walk = createWalk(bayou, new Set(placeKinds(bayou)));
  walk.lives = 1;
  const [lane] = bayou.lanes;
  walk.time = 10 * cycle(lane) - lane.offset + FALL + 40 / HAZARDS[lane.kind].speed;
  walk.x = hazardAt(lane, walk.time).x - 100;
  const results = Array.from({ length: 300 }, () => stepWalk(walk, 1 / 60, 1));
  assert.equal(results.filter(result => result.died).length, 1);
  assert.equal(results.filter(result => result.gameOver).length, 1, "game over is reported once");
  assert.equal(results.filter(result => result.respawn).length, 0, "no starting again");
  assert.equal(walk.lives, 0);
  const x = walk.x;
  stepWalk(walk, 1, 1);
  assert.equal(walk.x, x, "no more walking");
  assert.equal(jump(walk), false, "no more jumping");
});

test("a log blocks the path until the explorer jumps over it", () => {
  const [log] = bayou.logs;
  const walk = createWalk(bayou);
  run(walk, 6);
  assert.ok(walk.x < log.x, "stopped in front of the log");
  assert.equal(walk.y, 0);
  run(walk, 1.5, each => each.x > log.x - 200);
  assert.ok(walk.x > log.x, "jumped over it");
});

test("the explorer can stand on a log, and only jumps from solid ground", () => {
  const [log] = bayou.logs;
  const walk = createWalk(bayou);
  walk.x = log.x - log.w / 2 - 40;
  assert.equal(jump(walk), true);
  assert.equal(jump(walk), false, "no jumping in mid-air");
  for (let frame = 0; frame < 20; frame++) stepWalk(walk, 1 / 60, 1);
  for (let frame = 0; frame < 60 && walk.vy !== 0; frame++) stepWalk(walk, 1 / 60, 0);
  assert.equal(walk.y, log.h, "landed on top");
});

test("stars float along every trail, and a jump catches them", () => {
  for (const place of Object.values(PLACES)) assert.ok(place.stars.length >= 6, `${place.name} has stars`);
  const walk = createWalk(bayou);
  const onFoot = run(walk, 4);
  const jumper = createWalk(bayou);
  const hopping = run(jumper, 4, () => true);
  assert.ok(hopping > onFoot, `jumping catches more stars (${hopping} vs ${onFoot})`);
  assert.equal(jumper.stars.size, hopping);
});

test("a walk to a tapped spot hops over logs on the way", () => {
  const [log] = bayou.logs;
  const walk = createWalk(bayou, new Set(placeKinds(bayou)));
  walkTo(walk, log.x + 300);
  for (let frame = 0; frame < 600 && walk.target; frame++) stepWalk(walk, 1 / 60);
  assert.ok(Math.abs(walk.x - (log.x + 300)) < 6);
});
