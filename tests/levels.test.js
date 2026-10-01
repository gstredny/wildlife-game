import test from "node:test";
import assert from "node:assert/strict";
import { allBeaten, beatLevel, currentLevel, isBeaten, isOpen, LEVELS, levelNumber, startingLevel } from "../src/levels.js";
import { PLACES, placeKinds } from "../src/places.js";

test("six levels in a fixed order, and the Bayou Trail is level 3", () => {
  assert.deepEqual([...LEVELS].sort(), Object.keys(PLACES).sort());
  assert.equal(levelNumber("bayou"), 3);
  assert.equal(LEVELS[0], "backyard");
  assert.equal(LEVELS.at(-1), "gulf");
});

test("a player sees only the levels reached: the one they are on and the ones beaten", () => {
  const dora = { level: 1 };
  assert.equal(currentLevel(dora), "backyard");
  assert.equal(isOpen(dora, "backyard"), true);
  assert.equal(isOpen(dora, "woods"), false);
  const george = { level: 3 };
  assert.equal(currentLevel(george), "bayou");
  assert.equal(isBeaten(george, "woods"), true);
  assert.equal(isBeaten(george, "bayou"), false);
  assert.equal(isOpen(george, "swamp"), false);
});

test("beating the level you are on opens the next; replaying a beaten one opens nothing", () => {
  const player = { level: 1 };
  assert.equal(beatLevel(player, "woods"), null, "a locked level can't be beaten");
  assert.equal(beatLevel(player, "backyard"), "woods");
  assert.equal(player.level, 2);
  assert.equal(beatLevel(player, "backyard"), null);
  assert.equal(player.level, 2);
});

test("beating the last level makes every level open again and nothing new to open", () => {
  const player = { level: 6 };
  assert.equal(allBeaten(player), false);
  assert.equal(beatLevel(player, "gulf"), null);
  assert.equal(allBeaten(player), true);
  assert.equal(currentLevel(player), null);
  for (const key of LEVELS) assert.equal(isOpen(player, key), true);
});

test("finds from before the trail map put a player past every level they already cleared", () => {
  assert.equal(startingLevel([]), 1);
  assert.equal(startingLevel(placeKinds(PLACES.backyard)), 2);
  assert.equal(startingLevel([...placeKinds(PLACES.backyard), ...placeKinds(PLACES.woods)]), 3);
  assert.equal(startingLevel(placeKinds(PLACES.woods)), 1, "clearing a later level alone opens nothing");
  assert.equal(startingLevel(LEVELS.flatMap(key => placeKinds(PLACES[key]))), LEVELS.length + 1);
});
