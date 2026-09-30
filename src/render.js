// Draws one moment of the walk: scenery, animals, the explorer, and the camera sparkle over the
// animal the explorer can photograph.
import { ANIMALS } from "./animals.js";
import { baseY } from "./layout.js";
import { paintExplorer } from "./paint-explorer.js";
import { BOXES, PAINTERS } from "./painters.js";
import { GROUND, paintBack, paintFarWoods, paintFront, paintOak, paintPath, paintSign, paintSky } from "./scenery.js";
import { animalAt, snapTarget } from "./trail.js";

const EXPLORER_SIZE = 150;
const ALERT_DISTANCE = 170;

export function paintFrame(context, walk, view, snapping) {
  const { place, time } = walk;
  context.setTransform(view.scale, 0, 0, view.scale, -view.left * view.scale, -view.top * view.scale);
  const seen = (x, reach) => x + reach > view.left && x - reach < view.left + view.width;
  paintSky(context, view, time);
  paintFarWoods(context, view);
  paintBack(context, view, place, time);
  for (const x of place.trees) if (seen(x, 200)) paintOak(context, x, x);
  if (seen(170, 80)) paintSign(context, 170, place.name);
  if (seen(place.length - 170, 80)) paintSign(context, place.length - 170, "Trail end");
  const target = snapTarget(walk);
  for (const animal of place.animals) {
    const at = animalAt(animal, time);
    if (seen(at.x, animal.size * 4)) paintAnimal(context, walk, animal, at);
  }
  paintPath(context, view, place);
  context.save();
  context.translate(walk.x, GROUND.path);
  context.scale(walk.facing, 1);
  paintExplorer(context, EXPLORER_SIZE, time, { walking: walk.moving, snapping });
  context.restore();
  paintFront(context, view, time);
  if (target) paintMarker(context, walk, target);
}

function paintAnimal(context, walk, animal, at) {
  const y = baseY(animal);
  const alert = !at.walking && Math.abs(at.x - walk.x) < ALERT_DISTANCE;
  context.save();
  context.translate(at.x, y);
  context.scale(at.facing, 1);
  // Each animal gets its own clock, so the ibises don't bob in step.
  PAINTERS[animal.kind](context, animal.size, walk.time + animal.x * 0.013, { walking: at.walking, alert });
  context.restore();
  const { from, to } = walk.place.water;
  if (animal.lane === "back" && at.x > from + 60 && at.x < to - 60 && animal.kind !== "alligator") {
    paintWaterAtFeet(context, at.x, y, animal.size, walk.time);
  }
}

// Shallow water over a wading bird's feet, with a ring of ripples.
function paintWaterAtFeet(context, x, y, size, time) {
  context.fillStyle = "rgba(70,135,150,.8)";
  context.beginPath();
  context.ellipse(x, y + 2, size * 0.32, 9, 0, 0, Math.PI * 2);
  context.fill();
  const grow = (time * 0.6) % 1;
  context.strokeStyle = `rgba(230,248,255,${0.6 * (1 - grow)})`;
  context.lineWidth = 1.5;
  context.beginPath();
  context.ellipse(x, y + 1, size * (0.18 + grow * 0.25), 4 + grow * 4, 0, 0, Math.PI * 2);
  context.stroke();
}

// A bouncing camera bubble over an animal not found yet, or its name over one already found.
function paintMarker(context, walk, animal) {
  const at = animalAt(animal, walk.time);
  const top = baseY(animal) + BOXES[animal.kind].top * animal.size;
  if (walk.found.has(animal.kind)) {
    paintNameTag(context, at.x, top - 16, ANIMALS[animal.kind].name);
    return;
  }
  const y = top - 34 - Math.abs(Math.sin(walk.time * 4)) * 10;
  context.fillStyle = "rgba(255,255,255,.95)";
  context.beginPath();
  context.arc(at.x, y, 22, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(at.x - 8, y + 18);
  context.lineTo(at.x, y + 30);
  context.lineTo(at.x + 8, y + 18);
  context.fill();
  paintCameraIcon(context, at.x, y);
  // Twinkles around the bubble.
  context.fillStyle = "#ffd84d";
  for (let index = 0; index < 3; index++) {
    const angle = walk.time * 2 + index * 2.1;
    paintTwinkle(context, at.x + Math.cos(angle) * 34, y + Math.sin(angle) * 30, 5 + Math.sin(walk.time * 6 + index) * 2);
  }
}

function paintCameraIcon(context, x, y) {
  context.fillStyle = "#2e3a46";
  context.beginPath();
  context.roundRect(x - 13, y - 8, 26, 18, 4);
  context.fill();
  context.fillRect(x - 5, y - 12, 10, 5);
  context.fillStyle = "#9fd3f0";
  context.beginPath();
  context.arc(x, y + 1, 6, 0, Math.PI * 2);
  context.fill();
}

function paintTwinkle(context, x, y, r) {
  context.beginPath();
  for (let point = 0; point < 8; point++) {
    const reach = point % 2 ? r * 0.35 : r;
    const angle = point * Math.PI / 4;
    context.lineTo(x + Math.cos(angle) * reach, y + Math.sin(angle) * reach);
  }
  context.fill();
}

function paintNameTag(context, x, y, name) {
  context.font = "700 17px system-ui, sans-serif";
  const width = context.measureText(name).width + 22;
  context.fillStyle = "rgba(33,58,40,.85)";
  context.beginPath();
  context.roundRect(x - width / 2, y - 15, width, 30, 15);
  context.fill();
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(name, x, y);
}
