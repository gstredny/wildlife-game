// Draws the obstacle course on the path: logs to jump over (driftwood on the beach) and the stars
// not caught yet, bobbing and twinkling.
import { GROUND } from "./scenery.js";

const WOOD = { bark: "#7a5230", dark: "#5a3a20", end: "#d9b27c", ring: "#a97a48" };
const DRIFTWOOD = { bark: "#a39580", dark: "#7f735f", end: "#e3d6bd", ring: "#b4a58a" };

export function paintCourse(context, walk, seen) {
  const wood = walk.place.theme === "gulf" ? DRIFTWOOD : WOOD;
  for (const log of walk.place.logs) if (seen(log.x, log.w)) paintLog(context, log, wood);
  walk.place.stars.forEach((star, index) => {
    if (!walk.stars.has(index) && seen(star.x, 30)) paintStar(context, star.x, GROUND.path - star.y, walk.time + index * 0.7);
  });
}

function paintLog(context, { x, w, h }, wood) {
  const left = x - w / 2;
  const top = GROUND.path - h;
  context.fillStyle = "rgba(40,50,30,.25)";
  context.beginPath();
  context.ellipse(x, GROUND.path + 2, w / 2 + 8, 7, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = wood.bark;
  context.beginPath();
  context.roundRect(left, top, w, h, h / 2);
  context.fill();
  context.strokeStyle = wood.dark;
  context.lineWidth = 3;
  context.lineCap = "round";
  for (let line = 1; line < 3; line++) {
    context.beginPath();
    context.moveTo(left + h * 0.4, top + h * line / 3);
    context.lineTo(left + w - h * 0.7, top + h * line / 3 + (line === 1 ? -2 : 2));
    context.stroke();
  }
  // The cut end, with its growth rings.
  context.fillStyle = wood.end;
  context.beginPath();
  context.ellipse(left + w - h * 0.3, top + h / 2, h * 0.3, h / 2 - 1, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = wood.ring;
  context.lineWidth = 2;
  for (const ring of [0.55, 0.25]) {
    context.beginPath();
    context.ellipse(left + w - h * 0.3, top + h / 2, h * 0.3 * ring, (h / 2 - 1) * ring, 0, 0, Math.PI * 2);
    context.stroke();
  }
}

function paintStar(context, x, y, time) {
  const bob = Math.sin(time * 3) * 5;
  const squash = Math.abs(Math.cos(time * 1.6)) * 0.6 + 0.4; // a slow spin
  context.save();
  context.translate(x, y + bob);
  context.scale(squash, 1);
  context.fillStyle = "#ffd84d";
  context.strokeStyle = "#e0a22a";
  context.lineWidth = 3;
  context.lineJoin = "round";
  context.beginPath();
  for (let point = 0; point < 10; point++) {
    const reach = point % 2 ? 8 : 19;
    const angle = -Math.PI / 2 + point * Math.PI / 5;
    context.lineTo(Math.cos(angle) * reach, Math.sin(angle) * reach);
  }
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = "#fff6c4";
  context.beginPath();
  context.arc(-4, -5, 3.5, 0, Math.PI * 2);
  context.fill();
  context.restore();
}
