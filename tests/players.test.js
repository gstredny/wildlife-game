import test from "node:test";
import assert from "node:assert/strict";
import { FOUND_KEY } from "../src/field-guide.js";
import { addPlayer, loadPlayers, PLAYERS_KEY, recordFind, savePlayers } from "../src/players.js";

const memory = () => {
  const items = {};
  return { items, getItem: key => items[key] ?? null, setItem: (key, value) => { items[key] = value; } };
};

test("a new device starts with one explorer", () => {
  const players = loadPlayers(memory());
  assert.equal(players.current, "Explorer");
  assert.deepEqual(players.list.Explorer, { found: [], log: [] });
});

test("animals found before players existed belong to the first explorer", () => {
  const storage = memory();
  storage.setItem(FOUND_KEY, JSON.stringify(["heron", "deer", "dragon"]));
  assert.deepEqual(loadPlayers(storage).list.Explorer.found, ["heron", "deer"]);
});

test("each player keeps their own finds and a list of what they did", () => {
  const storage = memory();
  const players = loadPlayers(storage);
  assert.equal(addPlayer(players, "  Emma "), "Emma");
  assert.equal(players.current, "Emma");
  recordFind(players, "heron", "bayou", 1000);
  assert.equal(addPlayer(players, "Jack"), "Jack");
  recordFind(players, "deer", "woods", 2000);
  assert.equal(savePlayers(players, storage), true);
  const saved = loadPlayers(storage);
  assert.equal(saved.current, "Jack");
  assert.deepEqual(saved.list.Emma, { found: ["heron"], log: [{ kind: "heron", place: "bayou", at: 1000 }] });
  assert.deepEqual(saved.list.Jack.found, ["deer"]);
});

test("a blank or taken name adds nobody", () => {
  const players = loadPlayers(memory());
  assert.equal(addPlayer(players, "   "), null);
  assert.equal(addPlayer(players, "explorer"), null);
  assert.deepEqual(Object.keys(players.list), ["Explorer"]);
});

test("broken or blocked saved data still starts a game", () => {
  const storage = memory();
  storage.setItem(PLAYERS_KEY, "{not json");
  assert.equal(loadPlayers(storage).current, "Explorer");
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(loadPlayers(blocked).current, "Explorer");
  assert.equal(savePlayers(loadPlayers(blocked), blocked), false);
});
