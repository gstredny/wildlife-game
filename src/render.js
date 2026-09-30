// Draws one moment of the walk: scenery, found animals and the bushes where the others hide, logs,
// stars and pinecones, the explorer (blinking after a bump), and the name of the animal the explorer
// can photograph again.
import { ANIMALS } from "./animals.js";
import { baseY } from "./layout.js";
import { paintCourse } from "./paint-course.js";
import { paintExplorer } from "./paint-explorer.js";
import { paintHazards } from "./paint-hazards.js";
import { paintHidingSpot } from "./paint-hiding.js";
import { BOXES, PAINTERS } from "./painters.js";
import { GROUND, paintBack, paintFarWoods, paintFront, paintPath, paintSign, paintSky } from "./scenery.js";
import { THEMES, paintHabitatDetails, paintHabitatTree } from "./habitat-scenery.js";
import { animalAt, snapTarget } from "./trail.js";

const EXPLORER_SIZE = 150;
// Swimmers and the sand crab get no wading ripples at their feet.
const NO_RIPPLES = new Set(["alligator", "cottonmouth", "watersnake", "crab", "seaTurtle"]);
const ALERT_DISTANCE = 170;

export function paintFrame(context, walk, view, snapping) {
  const { place, time } = walk;
  context.setTransform(view.scale, 0, 0, view.scale, -view.left * view.scale, -view.top * view.scale);
  const seen = (x, reach) => x + reach > view.left && x - reach < view.left + view.width;
  const theme = THEMES[place.theme];
  paintSky(context, view, time, theme);
  if (!theme.beach) paintFarWoods(context, view, theme);
  paintBack(context, view, place, time, theme);
  paintHabitatDetails(context, view, place, time);
  for (const x of place.trees) if (seen(x, 200)) paintHabitatTree(context, x, place);
  if (seen(170, 80)) paintSign(context, 170, place.name);
  if (seen(place.length - 170, 80)) paintSign(context, place.length - 170, "Trail end");
  const target = snapTarget(walk);
  for (const animal of place.animals) {
    if (!walk.found.has(animal.kind)) {
      if (seen(animal.x, 120)) paintHidingSpot(context, animal.x, time + animal.x * 0.013);
      continue;
    }
    const at = animalAt(animal, time);
    if (seen(at.x, animal.size * 4)) paintAnimal(context, walk, animal, at);
  }
  paintPath(context, view, place, theme);
  paintCourse(context, walk, seen);
  paintHazards(context, walk, seen);
  if (!(Math.floor(walk.hurt * 12) % 2)) {
    context.save();
    context.translate(walk.x, GROUND.path - walk.y);
    context.scale(walk.facing, 1);
    paintExplorer(context, EXPLORER_SIZE, time, { walking: walk.moving && walk.vy === 0, snapping });
    context.restore();
  }
  paintFront(context, view, time, theme);
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
  const { water } = walk.place;
  if (water && animal.lane === "back" && at.x > water.from + 60 && at.x < water.to - 60 && !NO_RIPPLES.has(animal.kind)) {
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

// The name over the found animal the camera can photograph again.
function paintMarker(context, walk, animal) {
  const at = animalAt(animal, walk.time);
  paintNameTag(context, at.x, baseY(animal) + BOXES[animal.kind].top * animal.size - 16, ANIMALS[animal.kind].name);
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
