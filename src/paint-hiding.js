// Draws a hiding spot: a rustling bush where an animal not found yet is hiding, with a bouncing "?"
// bubble over it so a child can see where to go next.
import { GROUND } from "./scenery.js";

const LEAVES = ["#3f7a34", "#4f8f3f", "#63a24d"];
const PUFFS = [[-40, -26, 30], [40, -24, 30], [-18, -50, 32], [20, -52, 30], [0, -30, 38]];

export function paintHidingSpot(context, x, time) {
  const y = GROUND.back + 6;
  context.fillStyle = "rgba(40,50,30,.25)";
  context.beginPath();
  context.ellipse(x, y, 70, 9, 0, 0, Math.PI * 2);
  context.fill();
  // The bush rustles now and then, as if something inside is moving.
  const rustle = Math.sin(time * 9) * Math.max(0, Math.sin(time * 1.3)) * 0.06;
  context.save();
  context.translate(x, y);
  context.transform(1, 0, rustle, 1, 0, 0);
  PUFFS.forEach(([dx, dy, r], index) => {
    context.fillStyle = LEAVES[index % LEAVES.length];
    context.beginPath();
    context.arc(dx, dy, r, 0, Math.PI * 2);
    context.fill();
  });
  context.fillStyle = "rgba(255,255,255,.18)";
  for (const [dx, dy] of [[-26, -60], [14, -66], [34, -38]]) {
    context.beginPath();
    context.ellipse(dx, dy, 9, 5, -0.5, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
  paintQuestionBubble(context, x, y - 118 - Math.abs(Math.sin(time * 3.5)) * 10, time);
}

function paintQuestionBubble(context, x, y, time) {
  context.fillStyle = "rgba(255,255,255,.95)";
  context.beginPath();
  context.arc(x, y, 25, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(x - 8, y + 21);
  context.lineTo(x, y + 33);
  context.lineTo(x + 8, y + 21);
  context.fill();
  context.fillStyle = "#e8742b";
  context.font = "900 34px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("?", x, y + 2);
  context.fillStyle = "#ffd84d";
  for (let index = 0; index < 3; index++) {
    const angle = time * 2 + index * 2.1;
    paintTwinkle(context, x + Math.cos(angle) * 36, y + Math.sin(angle) * 32, 5 + Math.sin(time * 6 + index) * 2);
  }
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
