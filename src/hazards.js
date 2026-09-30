// Pinecones that come at the explorer, like the enemies in a Super Mario level. Each lane drops a
// pinecone at its far end every few seconds, and it rolls toward the start of the trail until the
// lane ends. Where it is depends only on the time, so the rules can be tested without a browser.
export const ROLL_SPEED = 170;
export const FALL = 0.5; // seconds to drop onto the path
export const EVERY = 2.8; // seconds between pinecones in one lane
export const RADIUS = 22;
const DROP = 260; // how high above the path a pinecone appears

// The lane's pinecone at `time`: { x, y, turn } with `y` its height above the path and `turn` how far
// it has rolled around, or null between pinecones.
export function hazardAt(lane, time) {
  const age = (time + lane.offset) % EVERY;
  if (age < FALL) return { x: lane.from, y: DROP * (1 - (age / FALL) ** 2), turn: 0 };
  const rolled = ROLL_SPEED * (age - FALL);
  const x = lane.from - rolled;
  return x < lane.to ? null : { x, y: 0, turn: -rolled / RADIUS };
}
