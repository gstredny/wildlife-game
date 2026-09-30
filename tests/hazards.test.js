import test from "node:test";
import assert from "node:assert/strict";
import { cycle, FALL, hazardAt, HAZARDS } from "../src/hazards.js";
import { PLACES } from "../src/places.js";
import { createWalk, jump, stepWalk } from "../src/trail.js";

// A walk where the place's first hazard has just landed and is on its way, `gap` ahead of the explorer.
function facingHazard(place, gap) {
  const [lane] = place.lanes;
  const walk = createWalk(place);
  walk.time = 10 * cycle(lane) + FALL + 40 / HAZARDS[lane.kind].speed - lane.offset;
  walk.x = hazardAt(lane, walk.time).x - gap;
  return walk;
}

test("every trail has hazards coming along it, between the logs", () => {
  for (const place of Object.values(PLACES)) {
    assert.ok(place.lanes.length >= 3, `${place.name} has hazards`);
    for (const each of place.lanes) {
      assert.ok(each.from > each.to, "they head toward the start of the trail");
      assert.ok(place.logs.every(log => log.x + log.w / 2 < each.to || log.x - log.w / 2 > each.from), "no log in the way");
      assert.ok(place.animals.every(animal => animal.x < each.to - 60 || animal.x > each.from + 60), "hiding spots are safe");
    }
  }
});

test("each place has its own kind of hazard", () => {
  const kinds = Object.values(PLACES).map(place => place.lanes[0].kind);
  assert.equal(new Set(kinds).size, Object.keys(PLACES).length);
  for (const kind of kinds) assert.ok(HAZARDS[kind], `${kind} is a hazard`);
  assert.equal(PLACES.woods.lanes[0].kind, "pinecone");
  assert.equal(PLACES.backyard.lanes[0].kind, "fireAnts");
});

for (const place of Object.values(PLACES)) {
  const [lane] = place.lanes;
  const { name } = HAZARDS[lane.kind];

  test(`${name} come in at the far end, head toward the explorer, and are gone at the lane's end`, () => {
    const seen = Array.from({ length: 400 }, (_, step) => hazardAt(lane, step * cycle(lane) / 100));
    const things = seen.filter(Boolean);
    assert.ok(things.some(thing => thing.x === lane.from), "comes in at the far end");
    assert.ok(things.every(thing => thing.x <= lane.from && thing.x >= lane.to));
    assert.ok(seen.some(thing => thing === null), "a quiet moment between them");
    const walk = facingHazard(place, 200);
    assert.ok(hazardAt(lane, walk.time + 0.5).x < hazardAt(lane, walk.time).x, "heads toward the explorer");
  });

  test(`running into ${name} bumps the explorer back, and they blink for a moment`, () => {
    const walk = facingHazard(place, 100);
    let bumps = 0;
    let bumpedAt = null;
    for (let frame = 0; frame < 72; frame++) {
      if (stepWalk(walk, 1 / 60, 1).bump) {
        bumps++;
        bumpedAt = walk.x;
        assert.ok(walk.hurt > 0, "blinking");
      }
      if (bumpedAt !== null && frame < 40) assert.ok(walk.x <= bumpedAt + 1e-9, "pushed back, not walking on");
    }
    assert.equal(bumps, 1, "no second bump while blinking");
  });

  test(`jumping over ${name} clears them`, () => {
    const walk = facingHazard(place, 260);
    for (let frame = 0; frame < 90; frame++) {
      const thing = hazardAt(lane, walk.time);
      if (thing && thing.x - walk.x < 160) jump(walk);
      assert.equal(stepWalk(walk, 1 / 60, 1).bump, undefined, `no bump at frame ${frame}`);
    }
    assert.ok(walk.x > (hazardAt(lane, walk.time)?.x ?? -Infinity), "the hazard is behind the explorer");
  });
}

test("a pinecone dropping in bonks only when it comes down to the explorer's head", () => {
  const place = PLACES.woods;
  const [lane] = place.lanes;
  const walk = createWalk(place);
  walk.time = 10 * cycle(lane) - lane.offset;
  walk.x = lane.from;
  let bumpedAt = null;
  for (let frame = 0; frame < 40 && bumpedAt === null; frame++) {
    if (stepWalk(walk, 1 / 60).bump) bumpedAt = hazardAt(lane, walk.time).y;
  }
  assert.ok(bumpedAt !== null && bumpedAt < 160, `bonked at height ${bumpedAt}`);
});
