// What a careful child presses at each moment of a walk: run right, but wait while something drops in
// just ahead, and jump at logs and at whatever is coming. A careless child only jumps at logs. Shared
// by the tests and the browser check, which loads it into the page.
import { hazardAt } from "../src/hazards.js";

export function carefulMove(walk, careful = true) {
  const ahead = (thing, near) => thing && thing.x - walk.x > 0 && thing.x - walk.x < near;
  const things = walk.place.lanes.map(lane => hazardAt(lane, walk.time));
  const dropping = careful && things.some(thing => thing?.falling && ahead(thing, 130));
  const coming = careful && things.some(thing => !thing?.falling && ahead(thing, 150));
  const log = walk.place.logs.some(each => ahead({ x: each.x - each.w / 2 + 60 }, 150));
  return { right: !(dropping && walk.vy === 0), jump: coming || log };
}
