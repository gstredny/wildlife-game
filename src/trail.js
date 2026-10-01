// One walk along a trail: where the explorer is, where each animal is, and which animals are found.
// Like a little Super Mario level: an animal not found yet hides at its spot until the explorer gets
// there, and a hit from a hazard costs a heart. No drawing here, so the rules can be tested without a
// browser.
import { hazardAt, HAZARDS } from "./hazards.js";

export const WALK_SPEED = 260;
export const REACH = 230; // how close the explorer must be to take a found animal's picture again
export const SPOT = 50; // how close the explorer must come to a hiding animal's spot to find it
export const EDGE = 90; // the explorer stops this far from either end of the trail
const JUMP_SPEED = 900; // straight up, so a jump rises about 175 over the path, like Mario's floaty jump
const GRAVITY = 2300;
const HALF = 26; // half the explorer's width, for bumping into logs
const HIT_HALF = 18; // the part of the explorer a hazard must touch: narrower than their body, to be kind
const BODY = 150; // the explorer's height, for catching stars
const STAR_REACH = 36;
export const LIVES = 3; // hearts at the start of each level
export const SAFE = 1.5; // seconds the explorer blinks after starting again; nothing hits them meanwhile
const TUMBLE = 1.6; // seconds of tumbling off the screen after a hit
const TUMBLE_SPEED = 900; // the little pop up before the tumble

// `y` is how high the explorer's feet are above the path; `stars` holds the stars caught on this walk;
// `endedAt` is when the explorer reached the goal flag at the end, or null. `lives` is the hearts
// left, `dying` counts down the tumble after a hit, and `safe` the blinking after starting again at
// `checkpoint`, the last bush reached.
export function createWalk(place, found = new Set()) {
  return { place, x: EDGE + 40, y: 0, vy: 0, facing: 1, moving: false, target: null, time: 0, found,
    stars: new Set(), endedAt: null, lives: LIVES, dying: 0, safe: 0, checkpoint: EDGE + 40 };
}

// Jumps, if the explorer is standing on the path or a log. Returns whether it jumped.
export function jump(walk) {
  if (walk.dying || !walk.lives || walk.vy !== 0 || walk.y !== floorAt(walk, walk.x)) return false;
  walk.vy = JUMP_SPEED;
  return true;
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

// The found animal the explorer can photograph again right now: the closest one in reach.
export function snapTarget(walk) {
  const inRange = walk.place.animals.filter(animal => walk.found.has(animal.kind) && inReach(walk, animal));
  const distance = animal => Math.abs(animalAt(animal, walk.time).x - walk.x);
  return inRange.sort((first, second) => distance(first) - distance(second))[0] ?? null;
}

// Walk toward a spot on the trail (a tap on the ground), or toward a found animal to photograph it.
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
// any walk to a tapped spot. Returns what happened: { snap } when the explorer reaches a hiding animal
// or a tapped animal comes into reach, { stars } for how many stars were caught, { end: true } the
// first time the explorer reaches the goal flag at the end. { died: true } when a hazard hits, then,
// after the tumble, { respawn: true } or, with no hearts left, { gameOver: true } once.
export function stepWalk(walk, dt, move = 0) {
  walk.time += dt;
  if (walk.dying) return tumble(walk, dt);
  if (!walk.lives) return {};
  walk.safe = Math.max(0, walk.safe - dt);
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
  const next = clamp(walk.x + direction * WALK_SPEED * dt, walk.place.length);
  const wall = wallBetween(walk, walk.x, next);
  walk.x = wall ? wall.x - direction * (wall.w / 2 + HALF) : next;
  // A walk to a tapped spot hops over a log in the way.
  if (wall && walk.target) jump(walk);
  fall(walk, dt);
  const reached = walk.place.animals.filter(animal => animal.x - SPOT < walk.x).at(-1);
  if (reached && reached.x > walk.checkpoint) walk.checkpoint = reached.x;
  if (!walk.safe && hit(walk)) return die(walk);
  const result = {};
  const hiding = walk.place.animals.find(animal => !walk.found.has(animal.kind) && Math.abs(animal.x - walk.x) < SPOT);
  if (hiding) result.snap = snap(walk, hiding);
  const stars = catchStars(walk);
  if (stars) result.stars = stars;
  if (walk.endedAt === null && walk.x >= walk.place.length - EDGE - 1) {
    walk.endedAt = walk.time;
    result.end = true;
  }
  return result;
}

// The top of what the explorer stands on at `x`: a log, or the path (0).
function floorAt(walk, x) {
  return Math.max(0, ...walk.place.logs.filter(log => Math.abs(log.x - x) < log.w / 2 + HALF).map(log => log.h));
}

// The nearest log taller than the explorer's feet between `from` and `to`, if any.
function wallBetween(walk, from, to) {
  const [low, high] = from < to ? [from, to] : [to, from];
  return walk.place.logs.filter(log => walk.y < log.h && log.x + log.w / 2 + HALF > low && log.x - log.w / 2 - HALF < high)
    .sort((first, second) => Math.abs(first.x - from) - Math.abs(second.x - from))[0] ?? null;
}

function fall(walk, dt) {
  walk.vy -= GRAVITY * dt;
  walk.y += walk.vy * dt;
  const floor = floorAt(walk, walk.x);
  if (walk.y <= floor) {
    walk.y = floor;
    walk.vy = 0;
  }
}

// Whether a hazard is touching the explorer, from their feet to their head. One dropping in can't hit
// until it has landed and settled, so a child sees it coming, and a flier flying away can't hit.
function hit(walk) {
  return walk.place.lanes.some(lane => {
    const thing = hazardAt(lane, walk.time);
    const { half, tall } = HAZARDS[lane.kind];
    return thing && !thing.harmless && Math.abs(thing.x - walk.x) < HIT_HALF + half &&
      walk.y < thing.y + tall && thing.y < walk.y + BODY;
  });
}

// A hit: one heart less, and a little pop up before the explorer tumbles off the screen.
function die(walk) {
  walk.lives--;
  walk.dying = TUMBLE;
  walk.vy = TUMBLE_SPEED;
  walk.target = null;
  walk.moving = false;
  return { died: true };
}

// The tumble, through the path and off the screen. Then the explorer starts again at the last bush
// reached, blinking, or, with no hearts left, the level is over.
function tumble(walk, dt) {
  walk.dying = Math.max(0, walk.dying - dt);
  walk.vy -= GRAVITY * dt;
  walk.y += walk.vy * dt;
  if (walk.dying) return {};
  if (!walk.lives) return { gameOver: true };
  Object.assign(walk, { x: walk.checkpoint, y: 0, vy: 0, facing: 1, safe: SAFE });
  return { respawn: true };
}

function catchStars(walk) {
  let caught = 0;
  walk.place.stars.forEach((star, index) => {
    if (walk.stars.has(index) || Math.abs(star.x - walk.x) > STAR_REACH || star.y < walk.y || star.y > walk.y + BODY) return;
    walk.stars.add(index);
    caught++;
  });
  return caught;
}

function clamp(x, length) {
  return Math.min(Math.max(x, EDGE), length - EDGE);
}
