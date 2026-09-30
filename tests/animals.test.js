import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { ANIMALS } from "../src/animals.js";
import { PHOTOS } from "../src/photos.js";
import { PLACES, placeKinds } from "../src/places.js";

test("every animal has a learning card, a credited image, narration, and a clue", () => {
  for (const place of Object.values(PLACES)) {
    for (const kind of placeKinds(place)) {
      const animal = ANIMALS[kind];
      assert.ok(animal, `${kind} has no card`);
      for (const field of ["name", "hello", "fact", "say", "eats", "eatenBy", "hint", "source"]) assert.ok(animal[field], `${kind} has no ${field}`);
      assert.equal(animal.lines.length, 3, `${kind} should have three short lines`);
      assert.ok(existsSync(new URL(`../${PHOTOS[kind].file}`, import.meta.url)), `${kind}'s photo is missing`);
      assert.match(PHOTOS[kind].credit, /^(Photo|Drawing): .+, (public domain|CC)/, `${kind}'s photo needs a credit`);
      if (PHOTOS[kind].fallback) {
        assert.ok(existsSync(new URL(`../${PHOTOS[kind].fallback}`, import.meta.url)));
        assert.match(PHOTOS[kind].remote, /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);
        assert.match(PHOTOS[kind].source, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      }
    }
  }
});

test("each place says hello, marks the trail's end and cheers the Junior Ranger", () => {
  for (const place of Object.values(PLACES)) {
    for (const field of ["name", "blurb", "welcome", "end", "ranger"]) assert.ok(place[field], `${place.name} has no ${field}`);
    if (place.water?.bar !== undefined) assert.ok(place.water.from < place.water.bar && place.water.bar < place.water.to);
  }
});
