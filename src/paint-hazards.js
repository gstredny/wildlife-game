// Draws the pinecones rolling along the path, each with a shadow that shrinks while it drops in.
import { hazardAt, RADIUS } from "./hazards.js";
import { GROUND } from "./scenery.js";

export function paintHazards(context, walk, seen) {
  for (const lane of walk.place.lanes) {
    const cone = hazardAt(lane, walk.time);
    if (cone && seen(cone.x, RADIUS * 2)) paintPinecone(context, cone);
  }
}

function paintPinecone(context, { x, y, turn }) {
  const shadow = Math.max(0.3, 1 - y / 260);
  context.fillStyle = "rgba(40,50,30,.3)";
  context.beginPath();
  context.ellipse(x, GROUND.path + 2, RADIUS * shadow, 5 * shadow, 0, 0, Math.PI * 2);
  context.fill();
  context.save();
  context.translate(x, GROUND.path - y - RADIUS);
  context.rotate(turn);
  // The stem nub, then the body, then rows of woody scales.
  context.fillStyle = "#5b3a1e";
  context.fillRect(-3, -RADIUS - 5, 6, 7);
  context.fillStyle = "#8a5a2b";
  context.strokeStyle = "#4e3016";
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(0, 0, RADIUS * 0.78, RADIUS, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.strokeStyle = "#5b3a1e";
  context.lineWidth = 1.8;
  for (let row = -2; row <= 2; row++) {
    const width = RADIUS * 0.78 * Math.sqrt(1 - (row / 2.6) ** 2);
    for (let dx = -width + 5; dx < width - 2; dx += 7) {
      context.beginPath();
      context.arc(dx + (row % 2 ? 3.5 : 0), row * 6.5, 4, 0.15 * Math.PI, 0.85 * Math.PI);
      context.stroke();
    }
  }
  context.fillStyle = "rgba(255,230,190,.35)";
  context.beginPath();
  context.ellipse(-RADIUS * 0.3, -RADIUS * 0.4, 3.5, 6, -0.4, 0, Math.PI * 2);
  context.fill();
  context.restore();
}
