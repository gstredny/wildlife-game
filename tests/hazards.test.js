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
    }
  }
});

test("hazards come all the way to a child waiting at a bush, and stop at the log behind it", () => {
  for (const place of Object.values(PLACES)) {
    const [lane] = place.lanes;
    const bush = place.animals.filter(animal => animal.x < lane.to + 200).at(-1);
    const log = place.logs.filter(each => each.x < bush.x).at(-1);
    assert.ok(lane.to < bush.x && lane.to > log.x + log.w / 2, `${place.name}: the lane runs past the bush to the log`);
    const walk = createWalk(place, new Set([bush.kind]));
    walk.x = bush.x;
    let bumped = false;
    for (let frame = 0; frame < cycle(lane) * 60 && !bumped; frame++) bumped = Boolean(stepWalk(walk, 1 / 60).bump);
    assert.ok(bumped, `${place.name}: the ${HAZARDS[lane.kind].name} reach a child standing at the bush`);
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

test("a mosquito flies up and away at the end of its lane instead of vanishing in the air", () => {
  const [lane] = PLACES.swamp.lanes;
  let last = null;
  for (let step = 0; step < 1000; step++) {
    const thing = hazardAt(lane, 10 * cycle(lane) - lane.offset + step * cycle(lane) / 1000);
    if (thing) last = thing;
    else if (last) break;
  }
  assert.ok(last.y > 560, `off the top of the screen when it goes (${Math.round(last.y)} up)`);
});

test("a bouncing ball lands at the end of its lane, instead of vanishing mid-bounce", () => {
  for (const place of [PLACES.prairie, PLACES.gulf]) {
    for (const lane of place.lanes) {
      const heights = [];
      for (let step = 0; step < 2000; step++) {
        const thing = hazardAt(lane, 10 * cycle(lane) - lane.offset + FALL + step * cycle(lane) / 2000);
        if (thing) heights.push(thing.y);
        else if (heights.length) break;
      }
      assert.ok(heights[0] < 2, `${place.name}: starts bouncing from the path`);
      assert.ok(heights.at(-1) < 2, `${place.name}: last seen ${Math.round(heights.at(-1))} up`);
    }
  }
});

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
