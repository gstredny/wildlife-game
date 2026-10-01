import test from "node:test";
import assert from "node:assert/strict";
import { ANIMALS } from "../src/animals.js";
import { pickChoices } from "../src/choices.js";

// A steady stand-in for Math.random, so each run picks the same way.
const seeded = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

test("the choices are three different animals, one of them the right one", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const choices = pickChoices("heron", seeded(seed));
    assert.equal(choices.length, 3);
    assert.equal(new Set(choices).size, 3, "no name twice");
    assert.ok(choices.includes("heron"));
    for (const kind of choices) assert.ok(kind in ANIMALS, `${kind} is not an animal`);
  }
});

test("the wrong names and the right name's place change from card to card", () => {
  const random = seeded(7);
  const cards = Array.from({ length: 60 }, () => pickChoices("heron", random));
  assert.deepEqual(new Set(cards.map(choices => choices.indexOf("heron"))), new Set([0, 1, 2]), "the right name moves");
  const wrong = new Set(cards.flat().filter(kind => kind !== "heron"));
  assert.ok(wrong.size > 20, `only ${wrong.size} different wrong names`);
});
