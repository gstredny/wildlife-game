// One walk along a trail: where the explorer is, where each animal is, and which animals are found.
// An animal not found yet hides at its spot until the explorer gets there, like the goal of a little
// Super Mario level. No drawing here, so the rules can be tested without a browser.
import { hazardAt, HAZARDS } from "./hazards.js";

export const WALK_SPEED = 260;
export const REACH = 230; // how close the explorer must be to take a found animal's picture again
export const SPOT = 50; // how close the explorer must come to a hiding animal's spot to find it
export const EDGE = 90; // the explorer stops this far from either end of the trail
const JUMP_SPEED = 820; // straight up, so a jump rises about 145 over the path
const GRAVITY = 2300;
const HALF = 26; // half the explorer's width, for bumping into logs
const BODY = 150; // the explorer's height, for catching stars
const STAR_REACH = 36;
const BUMP = 1.2; // seconds the explorer blinks after a bump; nothing bumps them meanwhile
const PUSH = 0.3; // the first part of a bump, when the explorer slides back and can't steer
const PUSH_SPEED = 330;

// `y` is how high the explorer's feet are above the path; `stars` holds the stars caught on this walk;
// `hurt` counts down the blinking after a bump, and `pushed` is which way the bump sends them;
// `endedAt` is when the explorer reached the goal flag at the end, or null.
export function createWalk(place, found = new Set()) {
  return { place, x: EDGE + 40, y: 0, vy: 0, facing: 1, moving: false, target: null, time: 0, found,
    stars: new Set(), endedAt: null, hurt: 0, pushed: 0 };
}

// Jumps, if the explorer is standing on the path or a log. Returns whether it jumped.
export function jump(walk) {
  if (walk.vy !== 0 || walk.y !== floorAt(walk, walk.x)) return false;
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
// or a tapped animal comes into reach, { stars } for how many stars were caught, { bump: true } when a
// hazard hits, { end: true } the first time the explorer reaches the goal flag at the end. A bump pauses a walk to a
// tapped spot; it carries on after.
export function stepWalk(walk, dt, move = 0) {
  walk.time += dt;
  walk.hurt = Math.max(0, walk.hurt - dt);
  const pushed = walk.hurt > BUMP - PUSH;
  if (move) walk.target = null;
  let direction = pushed ? 0 : move;
  if (walk.target && !pushed) {
    const { animal } = walk.target;
    if (animal && inReach(walk, animal)) return { snap: snap(walk, animal) };
    const goal = animal ? animalAt(animal, walk.time).x : walk.target.x;
    const gap = goal - walk.x;
    if (Math.abs(gap) < 6) walk.target = null;
    else direction = Math.sign(gap);
  }
  walk.moving = direction !== 0;
  if (direction) walk.facing = direction;
  const step = pushed ? walk.pushed * PUSH_SPEED * dt : direction * WALK_SPEED * dt;
  const next = clamp(walk.x + step, walk.place.length);
  const wall = wallBetween(walk, walk.x, next);
  walk.x = wall ? wall.x - Math.sign(step) * (wall.w / 2 + HALF) : next;
  // A walk to a tapped spot hops over a log in the way.
  if (wall && walk.target) jump(walk);
  fall(walk, dt);
  const result = {};
  const hiding = walk.place.animals.find(animal => !walk.found.has(animal.kind) && Math.abs(animal.x - walk.x) < SPOT);
  if (hiding) result.snap = snap(walk, hiding);
  const stars = catchStars(walk);
  if (stars) result.stars = stars;
  if (!walk.hurt && bumpedBy(walk)) result.bump = true;
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

// Checks for a hazard touching the explorer, from their feet to their head; on a hit, starts the
// bump: a little hop and a slide away from it.
function bumpedBy(walk) {
  const touching = (thing, { half, tall }) => thing && Math.abs(thing.x - walk.x) < HALF + half &&
    walk.y < thing.y + tall && thing.y < walk.y + BODY;
  const thing = walk.place.lanes.map(lane => [hazardAt(lane, walk.time), HAZARDS[lane.kind]])
    .find(([each, kind]) => touching(each, kind))?.[0];
  if (!thing) return false;
  walk.hurt = BUMP;
  walk.pushed = Math.sign(walk.x - thing.x) || -1;
  walk.vy = Math.max(walk.vy, 420);
  return true;
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
