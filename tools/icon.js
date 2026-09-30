// Paints the app icon: a roseate spoonbill wading in the bayou under a Texas sun. Screenshot it at
// 512×512 with tools/shot.mjs, then make the smaller sizes with sips (see README).
import { PAINTERS } from "../src/painters.js";

const context = document.getElementById("icon").getContext("2d");
const sky = context.createLinearGradient(0, 0, 0, 330);
sky.addColorStop(0, "#5fb0e6");
sky.addColorStop(1, "#d9f0f7");
context.fillStyle = sky;
context.fillRect(0, 0, 512, 512);
context.fillStyle = "#fff3c4";
context.beginPath();
context.arc(390, 120, 58, 0, Math.PI * 2);
context.fill();
context.fillStyle = "#6c9a6a";
for (let x = -20; x < 560; x += 70) {
  context.beginPath();
  context.arc(x, 330, 55 + (x % 3) * 8, Math.PI, 0);
  context.fill();
}
const water = context.createLinearGradient(0, 330, 0, 512);
water.addColorStop(0, "#5d9fb0");
water.addColorStop(1, "#2f6f80");
context.fillStyle = water;
context.fillRect(0, 330, 512, 182);
context.save();
context.translate(236, 440);
PAINTERS.spoonbill(context, 300, 0.4, {});
context.restore();
context.fillStyle = "rgba(61,127,143,.85)";
context.beginPath();
context.ellipse(236, 442, 110, 22, 0, 0, Math.PI * 2);
context.fill();
context.strokeStyle = "rgba(230,248,255,.7)";
context.lineWidth = 4;
context.beginPath();
context.ellipse(236, 442, 150, 28, 0, 0, Math.PI * 2);
context.stroke();
