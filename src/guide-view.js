// Builds the Field Guide: a photo and name for each animal found, a gold camera sticker on the ones
// seen for real, and a dark shape with a question mark for each one still out there.
import { ANIMALS } from "./animals.js";
import { BOXES, PAINTERS } from "./painters.js";
import { PHOTOS } from "./photos.js";
import { placeKinds } from "./places.js";

export function fillGuide(grid, place, found, onPick, seen = {}) {
  grid.replaceChildren(...placeKinds(place).map(kind => {
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "guide-slot";
    const isFound = found.has(kind);
    if (isFound) {
      const photo = document.createElement("img");
      const reference = PHOTOS[kind];
      // A small copy from tools/make-thumbs.sh; an animal without one shows its full picture.
      photo.onerror = () => { photo.onerror = null; photo.src = reference.fallback ?? reference.file; };
      photo.src = reference.file.replace("art/animals/", "art/animals/thumbs/");
      photo.alt = "";
      slot.append(photo, ANIMALS[kind].name);
      slot.classList.toggle("seen", Boolean(seen[kind]));
    } else {
      slot.classList.add("missing");
      slot.append(silhouette(kind), "Not found yet");
    }
    const name = seen[kind] ? `${ANIMALS[kind].name}, seen for real` : ANIMALS[kind].name;
    slot.setAttribute("aria-label", isFound ? name : "An animal not found yet");
    slot.addEventListener("click", () => onPick(kind, isFound));
    return slot;
  }));
}

// The animal's drawing, filled in dark, so a child can guess what to look for.
function silhouette(kind) {
  const canvas = document.createElement("canvas");
  canvas.width = 240;
  canvas.height = 180;
  const context = canvas.getContext("2d");
  const box = BOXES[kind];
  const size = Math.min(200 / (box.right - box.left), 150 / -box.top);
  context.translate(120 - (box.left + box.right) / 2 * size, 165);
  PAINTERS[kind](context, size, 0, {});
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalCompositeOperation = "source-in";
  context.fillStyle = "#0e1f15";
  context.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}
