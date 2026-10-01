// Things that come at the explorer, like the enemies in a Super Mario level; each place has its own
// kind. A lane sends one in at its far end every few seconds (dropping in, or marching out of an ant
// mound), and it heads toward the start of the trail until the lane ends. Where it is depends only
// on the time, so the rules can be tested without a browser.
export const FALL = 0.5; // seconds to drop onto the path
const DROP = 260; // how high above the path one appears
const REST = 0.6; // quiet seconds in a lane between one and the next
const AWAY = 0.6; // seconds a flier takes to fly up and away at the end of its lane
export const SETTLE = 0.25; // seconds after landing before it can hit, so it never lands right on a child

// `size` is how big it is drawn. `half` and `tall` are the part that hits, a little smaller, so only
// a real overlap counts. `lift` holds a flier above the path, `bob` bobs it, and `hop` bounces a ball.
// A flier flies up and away at the end of its lane, instead of vanishing in the air, and a ball's
// bounces, about 120 along each, fit the lane so it lands at the end.
export const HAZARDS = {
  pinecone: { name: "pinecones", speed: 170, size: 22, half: 16, tall: 32, drop: DROP },
  acorn: { name: "acorns", speed: 210, size: 18, half: 13, tall: 26, drop: DROP },
  mosquito: { name: "mosquitoes", speed: 130, size: 18, half: 14, tall: 20, drop: DROP, lift: 30, bob: 8 },
  fireAnts: { name: "fire ants", speed: 95, size: 30, half: 26, tall: 14, drop: 0 },
  tumbleweed: { name: "tumbleweeds", speed: 150, size: 28, half: 18, tall: 38, drop: DROP, hop: 22 },
  beachBall: { name: "beach balls", speed: 150, size: 24, half: 16, tall: 34, drop: DROP, hop: 25 }
};

// Seconds between one and the next in a lane.
export function cycle(lane) {
  return FALL + (lane.from - lane.to) / HAZARDS[lane.kind].speed + REST;
}

// The lane's hazard at `time`: { x, y, turn, harmless } with `y` its height above the path, `turn` how
// far it has rolled around, and `harmless` while it drops in and settles, or while a flier flies away;
// or null between them.
export function hazardAt(lane, time) {
  const { speed, size, drop, lift = 0, bob = 0, hop = 0 } = HAZARDS[lane.kind];
  const age = (time + lane.offset) % cycle(lane);
  if (age < FALL) return { x: lane.from, y: lift + drop * (1 - (age / FALL) ** 2), turn: 0, harmless: true };
  const rolled = speed * (age - FALL);
  const x = lane.from - rolled;
  if (x < lane.to) return null;
  const away = lift ? 1600 * Math.max(0, AWAY - (x - lane.to) / speed) ** 2 : 0;
  const length = lane.from - lane.to;
  const bounce = hop * Math.abs(Math.sin(Math.PI * Math.max(1, Math.round(length / 120)) * rolled / length));
  const y = lift + bob * Math.sin((age - FALL) * 7) + bounce + away;
  return { x, y, turn: -rolled / size, harmless: age < FALL + SETTLE || away > 0 };
}
