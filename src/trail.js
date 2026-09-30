// One walk along a trail: where the explorer is, where each animal is, and which animals are found.
// No drawing here, so the rules can be tested without a browser.
export const WALK_SPEED = 260;
export const REACH = 230; // how close the explorer must be to take an animal's picture
export const EDGE = 90; // the explorer stops this far from either end of the trail

export function createWalk(place, found = new Set()) {
  return { place, x: EDGE + 40, facing: 1, moving: false, target: null, time: 0, found, reachedEnd: false };
}

// An animal wanders: it rests at one end, walks across, rests, walks back. Returns where it is at
// `time`, which way it faces, and whether it is walking.
export function animalAt(animal, time) {
  if (!animal.roam) return { x: animal.x, facing: -1, walking: false };
  const phase = ((time / animal.period + animal.x * 0.0137) % 1 + 1) % 1;
  const ease = t => t * t * (3 - 2 * t);
  let offset, facing, walking;
  if (phase < 0.2) [offset, facing, walking] = [-1, -1, false];
  else if (phase < 0.5) [offset, facing, walking] = [-1 + 2 * ease((phase - 0.2) / 0.3), 1, true];
  else if (phase < 0.7) [offset, facing, walking] = [1, 1, false];
  else [offset, facing, walking] = [1 - 2 * ease((phase - 0.7) / 0.3), -1, true];
  return { x: animal.x + offset * animal.roam, facing, walking };
}

export function inReach(walk, animal) {
  return Math.abs(animalAt(animal, walk.time).x - walk.x) <= REACH;
}

// The animal the explorer can photograph right now: one in reach, not-yet-found ones first, then closest.
export function snapTarget(walk) {
  const inRange = walk.place.animals.filter(animal => inReach(walk, animal));
  const distance = animal => Math.abs(animalAt(animal, walk.time).x - walk.x);
  return inRange.sort((first, second) =>
    walk.found.has(first.kind) - walk.found.has(second.kind) || distance(first) - distance(second))[0] ?? null;
}

// Walk toward a spot on the trail (a tap on the ground), or toward an animal to photograph it.
export function walkTo(walk, x, animal = null) {
  walk.target = { x: clamp(x, walk.place.length), animal };
}

// Takes the animal's picture. `first` is true the first time this kind is found.
export function snap(walk, animal) {
  const first = !walk.found.has(animal.kind);
  walk.found.add(animal.kind);
  walk.target = null;
  return { kind: animal.kind, first };
}

// Moves time on by `dt` seconds. `move` is -1, 0 or 1 from the arrow keys or buttons, and cancels
// any walk to a tapped spot. Returns what happened: { snap } when a tapped animal comes into reach,
// { end: true } the first time the explorer reaches the end of the trail.
export function stepWalk(walk, dt, move = 0) {
  walk.time += dt;
  if (move) walk.target = null;
  let direction = move;
  if (walk.target) {
    const { animal } = walk.target;
    if (animal && inReach(walk, animal)) return { snap: snap(walk, animal) };
    const goal = animal ? animalAt(animal, walk.time).x : walk.target.x;
    const gap = goal - walk.x;
    if (Math.abs(gap) < 6) walk.target = null;
    else direction = Math.sign(gap);
  }
  walk.moving = direction !== 0;
  if (direction) walk.facing = direction;
  walk.x = clamp(walk.x + direction * WALK_SPEED * dt, walk.place.length);
  if (!walk.reachedEnd && walk.x >= walk.place.length - EDGE - 1) {
    walk.reachedEnd = true;
    return { end: true };
  }
  return {};
}

function clamp(x, length) {
  return Math.min(Math.max(x, EDGE), length - EDGE);
}
