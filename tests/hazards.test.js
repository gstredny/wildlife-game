import test from "node:test";
import assert from "node:assert/strict";
import { EVERY, FALL, hazardAt, ROLL_SPEED } from "../src/hazards.js";
import { PLACES } from "../src/places.js";
import { createWalk, jump, stepWalk } from "../src/trail.js";

const bayou = PLACES.bayou;
const [lane] = bayou.lanes;

// A walk where the first pinecone has just landed and is rolling, `gap` ahead of the explorer.
function facingPinecone(gap) {
  const walk = createWalk(bayou);
  walk.time = 10 * EVERY + FALL + 40 / ROLL_SPEED - lane.offset;
  walk.x = hazardAt(lane, walk.time).x - gap;
  return walk;
}

test("every trail has pinecones rolling along it, between the logs", () => {
  for (const place of Object.values(PLACES)) {
    assert.ok(place.lanes.length >= 3, `${place.name} has pinecones`);
    for (const each of place.lanes) {
      assert.ok(each.from > each.to, "they roll toward the start of the trail");
      assert.ok(place.logs.every(log => log.x + log.w / 2 < each.to || log.x - log.w / 2 > each.from), "no log in the way");
    }
  }
});

test("a pinecone drops in, rolls toward the start of the trail, and is gone at the lane's end", () => {
  const seen = Array.from({ length: 400 }, (_, step) => hazardAt(lane, step * EVERY / 100));
  const cones = seen.filter(Boolean);
  assert.ok(cones.some(cone => cone.y > 0 && cone.x === lane.from), "drops in at the far end");
  assert.ok(cones.every(cone => cone.x <= lane.from && cone.x >= lane.to));
  assert.ok(seen.some(cone => cone === null), "a quiet moment between pinecones");
  const rolling = cones.filter(cone => cone.y === 0);
  assert.ok(rolling.length > 20);
  const walk = facingPinecone(200);
  const before = hazardAt(lane, walk.time).x;
  assert.ok(hazardAt(lane, walk.time + 0.5).x < before, "rolls toward the explorer");
});

test("running into a pinecone bumps the explorer back, and they blink for a moment", () => {
  const walk = facingPinecone(100);
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

test("jumping over a pinecone clears it", () => {
  const walk = facingPinecone(260);
  for (let frame = 0; frame < 90; frame++) {
    const cone = hazardAt(lane, walk.time);
    if (cone && cone.x - walk.x < 160) jump(walk);
    assert.equal(stepWalk(walk, 1 / 60, 1).bump, undefined, `no bump at frame ${frame}`);
  }
  assert.ok(walk.x > (hazardAt(lane, walk.time)?.x ?? -Infinity), "the pinecone is behind the explorer");
});
