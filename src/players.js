import { ANIMALS } from "./animals.js";
import { loadFound } from "./field-guide.js";
import { PLACES } from "./places.js";

// Who is exploring on this device. Each player has their own Field Guide and a list of what they found,
// newest first: { current: "Emma", list: { Emma: { found: ["heron"], log: [{ kind, place, at }] } } }.
export const PLAYERS_KEY = "wildlife-players-v1";
const FIRST = "Explorer";
const LOG_SIZE = 50;

export function loadPlayers(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(PLAYERS_KEY));
    if (saved?.list?.[saved.current]) {
      for (const player of Object.values(saved.list)) {
        player.found = player.found.filter(kind => kind in ANIMALS);
        player.log = player.log.filter(entry => entry.kind in ANIMALS && entry.place in PLACES);
      }
      return saved;
    }
  } catch { /* nothing saved, or saved data is broken: start fresh */ }
  // Animals found before there were players belong to the first explorer.
  return { current: FIRST, list: { [FIRST]: { found: [...loadFound(storage)], log: [] } } };
}

export function savePlayers(players, storage = globalThis.localStorage) {
  try {
    storage.setItem(PLAYERS_KEY, JSON.stringify(players));
    return true;
  } catch {
    return false;
  }
}

// Adds a player and makes them the one exploring. A blank name, or one already taken, adds nobody.
export function addPlayer(players, name) {
  const clean = name.trim();
  const taken = Object.keys(players.list).some(each => each.toLowerCase() === clean.toLowerCase());
  if (!clean || taken) return null;
  players.list[clean] = { found: [], log: [] };
  players.current = clean;
  return clean;
}

export function recordFind(players, kind, place, at = Date.now()) {
  const player = players.list[players.current];
  if (!player.found.includes(kind)) player.found.push(kind);
  player.log = [{ kind, place, at }, ...player.log].slice(0, LOG_SIZE);
}
