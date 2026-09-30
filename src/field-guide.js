import { ANIMALS } from "./animals.js";

// The animals found on this device. The Field Guide shows their cards; the rest are "?" shapes.
export const FOUND_KEY = "wildlife-found-v1";

export function loadFound(storage = globalThis.localStorage) {
  try {
    const kinds = JSON.parse(storage.getItem(FOUND_KEY));
    return new Set(Array.isArray(kinds) ? kinds.filter(kind => kind in ANIMALS) : []);
  } catch {
    return new Set();
  }
}

export function saveFound(found, storage = globalThis.localStorage) {
  try {
    storage.setItem(FOUND_KEY, JSON.stringify([...found]));
    return true;
  } catch {
    return false;
  }
}
