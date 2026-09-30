import test from "node:test";
import assert from "node:assert/strict";
import { FOUND_KEY, loadFound, saveFound } from "../src/field-guide.js";

const memory = () => {
  const items = {};
  return { getItem: key => items[key] ?? null, setItem: (key, value) => { items[key] = value; } };
};

test("found animals are remembered on this device", () => {
  const storage = memory();
  assert.equal(saveFound(new Set(["heron", "deer"]), storage), true);
  assert.deepEqual([...loadFound(storage)].sort(), ["deer", "heron"]);
});

test("unknown or broken saved data finds nothing instead of crashing", () => {
  const storage = memory();
  storage.setItem(FOUND_KEY, JSON.stringify(["heron", "dragon"]));
  assert.deepEqual([...loadFound(storage)], ["heron"]);
  storage.setItem(FOUND_KEY, "{not json");
  assert.equal(loadFound(storage).size, 0);
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(loadFound(blocked).size, 0);
  assert.equal(saveFound(new Set(["heron"]), blocked), false);
});
