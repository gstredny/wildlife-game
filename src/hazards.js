// Things that come at the explorer, like the enemies in a Super Mario level; each place has its own
// kind. A lane sends one in at its far end every few seconds (dropping in, or marching out of an ant
// mound), and it heads toward the start of the trail until the lane ends. Where it is depends only
// on the time, so the rules can be tested without a browser.
export const FALL = 0.5; // seconds to drop onto the path
const DROP = 260; // how high above the path one appears
const REST = 0.6; // quiet seconds in a lane between one and the next
const AWAY = 0.6; // seconds a flier takes to fly up and away at the end of its lane

// `size` is how big it is drawn. `half` and `tall` are the part that bumps, a little smaller, so only
// a real overlap counts. `lift` holds a flier above the path, `bob` bobs it, and `hop` bounces a ball.
// A flier flies up and away at the end of its lane, instead of vanishing in the air.
export const HAZARDS = {
  pinecone: { name: "pinecones", speed: 170, size: 22, half: 16, tall: 32, drop: DROP },
  acorn: { name: "acorns", speed: 210, size: 18, half: 13, tall: 26, drop: DROP },
  mosquito: { name: "mosquitoes", speed: 150, size: 18, half: 16, tall: 22, drop: DROP, lift: 40, bob: 12 },
  fireAnts: { name: "fire ants", speed: 95, size: 30, half: 34, tall: 16, drop: 0 },
  tumbleweed: { name: "tumbleweeds", speed: 190, size: 28, half: 22, tall: 44, drop: DROP, hop: 35 },
  beachBall: { name: "beach balls", speed: 180, size: 24, half: 18, tall: 36, drop: DROP, hop: 45 }
};

// Seconds between one and the next in a lane.
export function cycle(lane) {
  return FALL + (lane.from - lane.to) / HAZARDS[lane.kind].speed + REST;
}

// The lane's hazard at `time`: { x, y, turn } with `y` its height above the path and `turn` how far
// it has rolled around, or null between them.
export function hazardAt(lane, time) {
  const { speed, size, drop, lift = 0, bob = 0, hop = 0 } = HAZARDS[lane.kind];
  const age = (time + lane.offset) % cycle(lane);
  if (age < FALL) return { x: lane.from, y: lift + drop * (1 - (age / FALL) ** 2), turn: 0 };
  const rolled = speed * (age - FALL);
  const x = lane.from - rolled;
  if (x < lane.to) return null;
  const away = lift ? 1600 * Math.max(0, AWAY - (x - lane.to) / speed) ** 2 : 0;
  const y = lift + bob * Math.sin((age - FALL) * 7) + hop * Math.abs(Math.sin(rolled / 38)) + away;
  return { x, y, turn: -rolled / size };
}
