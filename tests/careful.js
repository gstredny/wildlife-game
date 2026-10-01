// Whether a careful child running right jumps at this moment of a walk: at logs, and at whatever is
// coming close. A careless child only jumps at logs. Shared by the tests and the browser check, which
// loads it into the page.
import { hazardAt } from "../src/hazards.js";

export function carefulJump(walk, careful = true) {
  const ahead = x => x - walk.x > 0 && x - walk.x < 150;
  const coming = careful && walk.place.lanes.some(lane => ahead(hazardAt(lane, walk.time)?.x ?? -Infinity));
  return coming || walk.place.logs.some(log => ahead(log.x - log.w / 2 + 60));
}
