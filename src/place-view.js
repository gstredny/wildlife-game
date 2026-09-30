// Habitat choices and discovery counts on the home screen.
import { PLACES, placeKinds } from "./places.js";
import { paintFrame } from "./render.js";
import { createWalk } from "./trail.js";

export function fillPlaces(grid, found, onPick) {
  grid.replaceChildren(...Object.entries(PLACES).map(([key, place]) => {
    const button = document.createElement("button");
    button.id = `place-${key}`;
    button.type = "button";
    button.className = `place-card habitat-${key}`;
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
      ["place-name", place.name],
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
  }));
}

export function progress(place, found) {
  const kinds = placeKinds(place);
  return `${kinds.filter(kind => found.has(kind)).length} of ${kinds.length} found`;
}
