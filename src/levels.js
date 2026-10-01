// The trail map: the six places played in order, like the levels of Donkey Kong Country. A player
// sees only the levels reached so far; beating one at its goal flag opens the next. `player.level`
// is the number of the level they are on, from 1, or one past the last once every level is beaten.
import { PLACES, placeKinds } from "./places.js";

export const LEVELS = ["backyard", "woods", "bayou", "swamp", "prairie", "gulf"];

export const levelNumber = key => LEVELS.indexOf(key) + 1;
// The level a player is on, or null once every level is beaten.
export const currentLevel = player => LEVELS[player.level - 1] ?? null;
export const isOpen = (player, key) => levelNumber(key) <= player.level;
export const isBeaten = (player, key) => levelNumber(key) < player.level;
export const allBeaten = player => player.level > LEVELS.length;

// Reaching the goal flag of the level a player is on opens the next one. Returns the key of the
// level opened, or null: after a beaten level played again, or after the last level.
export function beatLevel(player, key) {
  if (levelNumber(key) !== player.level) return null;
  player.level++;
  return currentLevel(player);
}

// Where a player saved before the trail map starts: at the first level whose animals they haven't
// all found, so finds from before still count.
export function startingLevel(found) {
  const index = LEVELS.findIndex(key => placeKinds(PLACES[key]).some(kind => !found.includes(kind)));
  return index === -1 ? LEVELS.length + 1 : index + 1;
}
