import { ANIMALS } from "./animals.js";

// The animals found on this device before there were players (players.js now saves each player's).
export const FOUND_KEY = "wildlife-found-v1";

export function loadFound(storage = globalThis.localStorage) {
  try {
    const kinds = JSON.parse(storage.getItem(FOUND_KEY));
    return new Set(Array.isArray(kinds) ? kinds.filter(kind => kind in ANIMALS) : []);
  } catch {
    return new Set();
  }
}
