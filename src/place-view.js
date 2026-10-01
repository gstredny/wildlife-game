// The trail map on the home screen, like the world map of Donkey Kong Country: the level the player
// is on as a big card, the levels beaten as gold badges to play again, and the levels ahead as misty
// "?" stops with no name.
import { ANIMALS } from "./animals.js";
import { currentLevel, isBeaten, LEVELS, levelNumber } from "./levels.js";
import { PLACES, placeKinds } from "./places.js";
import { paintFrame } from "./render.js";
import { createWalk } from "./trail.js";

export function fillMap(map, player, found, onPick) {
  const now = currentLevel(player);
  const stops = document.createElement("div");
  stops.className = "map-stops";
  stops.replaceChildren(...LEVELS.map(key => stop(key, player, onPick)));
  map.replaceChildren(now ? heroCard(now, found, onPick) : doneCard(found), stops);
}

// The level the player is on: scenery, name, how many animals are found, and Explore.
function heroCard(key, found, onPick) {
  const place = PLACES[key];
  const button = document.createElement("button");
  button.id = `place-${key}`;
  button.type = "button";
  button.className = `place-card level-now habitat-${key}`;
  const canvas = document.createElement("canvas");
  canvas.className = "place-preview";
  canvas.width = 420;
  canvas.height = 150;
  canvas.setAttribute("aria-hidden", "true");
  const preview = createWalk(place);
  preview.x = 800;
  paintFrame(canvas.getContext("2d"), preview, { scale: 0.3, left: 280, top: 100, width: 1400, height: 500 }, false);
  button.append(canvas);
  for (const [className, text] of [
    ["place-level", `Level ${levelNumber(key)}`], ["place-name", place.name],
    ["place-blurb", place.blurb], ["place-count", progress(place, found)],
    ["place-go", "Explore ▶"]
  ]) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    button.append(span);
  }
  button.addEventListener("click", () => onPick(key));
  return button;
}

// Every level beaten: the Master Ranger card; every badge below plays its level again.
function doneCard(found) {
  const card = document.createElement("div");
  card.className = "place-card level-done";
  for (const [className, text] of [
    ["place-level", "Master Ranger"], ["place-name", "You explored every trail!"],
    ["place-count", `${found.size} of ${Object.keys(ANIMALS).length} animals found`],
    ["place-blurb", "Tap a badge to explore a trail again."]
  ]) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    card.append(span);
  }
  return card;
}

// One stop on the map: a gold badge for a beaten level (tap to play it again), the marker for the
// level the player is on, or a misty "?" for a level not reached yet.
function stop(key, player, onPick) {
  const number = levelNumber(key);
  const beaten = isBeaten(player, key);
  const now = !beaten && currentLevel(player) === key;
  const stop = document.createElement(beaten ? "button" : "div");
  stop.className = `map-stop ${beaten ? "beaten" : now ? "now" : "locked"}`;
  if (beaten) {
    stop.id = `place-${key}`;
    stop.type = "button";
    stop.addEventListener("click", () => onPick(key));
  }
  const dot = document.createElement("span");
  dot.className = "stop-dot";
  dot.textContent = beaten ? "★" : now ? String(number) : "?";
  const name = document.createElement("span");
  name.className = "stop-name";
  name.textContent = beaten || now ? PLACES[key].name : `Level ${number}`;
  stop.setAttribute("aria-label", beaten ? `Level ${number}, ${PLACES[key].name}, beaten: play again`
    : now ? `Level ${number}, ${PLACES[key].name}: you are here` : `Level ${number}: not reached yet`);
  stop.append(dot, name);
  return stop;
}

export function progress(place, found) {
  const kinds = placeKinds(place);
  return `${kinds.filter(kind => found.has(kind)).length} of ${kinds.length} found`;
}
