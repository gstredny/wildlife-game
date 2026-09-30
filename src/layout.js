// Where things are on the screen: the part of the trail in view, where each animal stands, and
// which animal a tap lands on. The world is 600 units tall; the screen shows at least 720 across.
import { BOXES } from "./painters.js";
import { GROUND } from "./scenery.js";
import { animalAt } from "./trail.js";

export const WORLD_HEIGHT = 600;
const MIN_WIDTH = 720;
const FINGER = 24; // taps this close to an animal still count
const TRUNK_HEIGHT = 120; // how high up its tree the cicada sits

export function viewFor(pixelWidth, pixelHeight, left) {
  const scale = Math.min(pixelHeight / WORLD_HEIGHT, pixelWidth / MIN_WIDTH);
  const height = pixelHeight / scale;
  return { scale, left, top: WORLD_HEIGHT - height, width: pixelWidth / scale, height };
}

// The camera keeps the explorer a little left of middle, so there is more trail ahead to see.
export function cameraFor(walk, viewWidth) {
  const ahead = walk.facing > 0 ? 0.4 : 0.6;
  return Math.min(Math.max(walk.x - viewWidth * ahead, 0), Math.max(walk.place.length - viewWidth, 0));
}

export function baseY(animal) {
  if (animal.lane === "air") return GROUND.back - 155;
  if (animal.lane === "perch") return GROUND.back - 90;
  return animal.lane === "tree" ? GROUND.back - TRUNK_HEIGHT : GROUND.back;
}

export function screenToWorld(view, pixelX, pixelY) {
  return { x: view.left + pixelX / view.scale, y: view.top + pixelY / view.scale };
}

// The animal under a tap, if any, nearest first.
export function animalAtPoint(walk, point) {
  const hits = walk.place.animals.filter(animal => {
    const { x, facing } = animalAt(animal, walk.time);
    const box = BOXES[animal.kind];
    const [left, right] = facing > 0 ? [box.left, box.right] : [-box.right, -box.left];
    const y = baseY(animal);
    return point.x >= x + left * animal.size - FINGER && point.x <= x + right * animal.size + FINGER &&
      point.y >= y + box.top * animal.size - FINGER && point.y <= y + FINGER;
  });
  const distance = animal => Math.abs(animalAt(animal, walk.time).x - point.x);
  return hits.sort((first, second) => distance(first) - distance(second))[0] ?? null;
}
