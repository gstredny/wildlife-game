import { ANIMALS } from "./animals.js";
import { loadFound } from "./field-guide.js";
import { startingLevel } from "./levels.js";
import { PLACES } from "./places.js";

// Who is exploring on this device: up to three players. Each has their own Field Guide, a list of
// what they found, newest first, the level they are on (see levels.js), and the day they last saw
// each animal for real (their photo of it is in real-photos.js):
// { current: "Emma", list: { Emma: { found: ["heron"], log: [{ kind, place, at }], level: 2, seen: { heron: at } } } }.
export const PLAYERS_KEY = "wildlife-players-v1";
export const MAX_PLAYERS = 3;
const FIRST = "Explorer";
const LOG_SIZE = 50;

export function loadPlayers(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(PLAYERS_KEY));
    if (saved?.list?.[saved.current]) {
      for (const player of Object.values(saved.list)) {
        player.found = player.found.filter(kind => kind in ANIMALS);
        player.log = player.log.filter(entry => entry.kind in ANIMALS && entry.place in PLACES);
        if (player.seen) player.seen = Object.fromEntries(Object.entries(player.seen).filter(([kind]) => kind in ANIMALS));
        // Saved before the trail map: start past the levels already cleared.
        player.level ??= startingLevel(player.found);
      }
      return saved;
    }
  } catch { /* nothing saved, or saved data is broken: start fresh */ }
  // Animals found before there were players belong to the first explorer.
  const found = [...loadFound(storage)];
  return { current: FIRST, list: { [FIRST]: { found, log: [], level: startingLevel(found) } } };
}

export function savePlayers(players, storage = globalThis.localStorage) {
  try {
    storage.setItem(PLAYERS_KEY, JSON.stringify(players));
    return true;
  } catch {
    return false;
  }
}

// Adds a player and makes them the one exploring. A blank name, one already taken, or a full device
// adds nobody.
export function addPlayer(players, name) {
  const clean = name.trim();
  const taken = Object.keys(players.list).some(each => each.toLowerCase() === clean.toLowerCase());
  if (!clean || taken || Object.keys(players.list).length >= MAX_PLAYERS) return null;
  players.list[clean] = { found: [], log: [], level: 1 };
  players.current = clean;
  return clean;
}

// Removes a player, their Field Guide and their level. The last player stays. Returns whether one
// was removed; if it was the current player, the first one left takes over.
export function removePlayer(players, name) {
  if (!(name in players.list) || Object.keys(players.list).length < 2) return false;
  delete players.list[name];
  if (players.current === name) players.current = Object.keys(players.list)[0];
  return true;
}

export function recordFind(players, kind, place, at = Date.now()) {
  const player = players.list[players.current];
  if (!player.found.includes(kind)) player.found.push(kind);
  player.log = [{ kind, place, at }, ...player.log].slice(0, LOG_SIZE);
}

// The child saw this animal for real and took a picture of it.
export function recordSighting(players, kind, at = Date.now()) {
  const player = players.list[players.current];
  player.seen = { ...player.seen, [kind]: at };
}
