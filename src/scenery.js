// The Bayou Trail seen from the side: sky, far woods, the meadow or bayou behind the path, big trees,
// the path (a boardwalk over the water) and grass and wildflowers in front. The world is 600 units
// tall; everything sits on these lines, and far layers slide slower than the path (parallax).
export const GROUND = { back: 455, path: 528, pathTop: 470, pathBottom: 562 };
const SKY_TOP = "#6fb7e8", SKY_LOW = "#d9f0f7";

// A steady pseudo-random number in [0, 1) for a whole number, so the scenery never flickers.
export function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function paintSky(context, view, time, theme = {}) {
  const sky = context.createLinearGradient(0, view.top, 0, 360);
  sky.addColorStop(0, theme.sky ?? SKY_TOP);
  sky.addColorStop(1, theme.low ?? SKY_LOW);
  context.fillStyle = sky;
  context.fillRect(view.left, view.top, view.width, 380 - view.top);
  // A warm Texas sun with a soft glow.
  const sunX = view.left + view.width * 0.78, sunY = 90;
  const glow = context.createRadialGradient(sunX, sunY, 20, sunX, sunY, 120);
  glow.addColorStop(0, "rgba(255,244,200,.9)");
  glow.addColorStop(1, "rgba(255,244,200,0)");
  context.fillStyle = glow;
  context.fillRect(sunX - 120, sunY - 120, 240, 240);
  context.fillStyle = "#fff6d5";
  context.beginPath();
  context.arc(sunX, sunY, 30, 0, Math.PI * 2);
  context.fill();
  paintClouds(context, view, time);
}

function paintClouds(context, view, time) {
  const span = 700;
  const shift = view.left * 0.08 + time * 6;
  context.fillStyle = "rgba(255,255,255,.85)";
  for (let index = Math.floor(shift / span) - 1; index <= Math.floor((shift + view.width) / span) + 1; index++) {
    const x = view.left + index * span - shift + hash(index) * 300;
    const y = 50 + hash(index + 40) * 110;
    const size = 26 + hash(index + 80) * 22;
    for (const [dx, dy, r] of [[0, 0, 1], [size * 1.1, -size * 0.45, 1.25], [size * 2.2, 0, 0.95], [size * 1.1, size * 0.2, 1.1]]) {
      context.beginPath();
      context.arc(x + dx, y + dy, size * r, 0, Math.PI * 2);
      context.fill();
    }
  }
}

// Rolling far woods, two rows, sliding slowly.
export function paintFarWoods(context, view, theme = {}) {
  paintTreeRow(context, view, 0.22, 345, 60, theme.far ?? "#8fb58f", 0);
  paintTreeRow(context, view, 0.4, 372, 70, theme.near ?? "#6c9a6a", 500);
}

function paintTreeRow(context, view, depth, baseY, height, color, seed) {
  const step = 46;
  const shift = view.left * depth;
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(view.left, baseY + 40);
  for (let index = Math.floor(shift / step) - 2; index <= Math.floor((shift + view.width) / step) + 2; index++) {
    const x = view.left + index * step - shift;
    const top = baseY - height * (0.45 + hash(index + seed) * 0.55);
    context.arc(x, top + step * 0.5, step * (0.6 + hash(index + seed + 7) * 0.35), Math.PI, 0);
  }
  context.lineTo(view.left + view.width, baseY + 40);
  context.closePath();
  context.fill();
}

// Behind the path: a meadow, and the bayou where the place has water.
export function paintBack(context, view, place, time, theme = {}) {
  const meadow = context.createLinearGradient(0, 370, 0, GROUND.pathTop);
  meadow.addColorStop(0, theme.grass ?? "#9cc46e");
  meadow.addColorStop(1, theme.front ?? "#7fae55");
  context.fillStyle = meadow;
  context.fillRect(view.left, 370, view.width, GROUND.pathTop - 368);
  const { from, to } = place.water;
  if (to < view.left || from > view.left + view.width) return;
  paintBayou(context, place.water, time);
}

function paintBayou(context, { from, to, bar }, time) {
  const top = 392, bottom = GROUND.pathTop + 4;
  // Muddy banks slope into the water at both ends.
  context.fillStyle = "#8a7550";
  context.beginPath();
  context.moveTo(from - 50, bottom);
  context.quadraticCurveTo(from + 5, top + 1, from + 70, top + 1);
  context.lineTo(to - 70, top + 1);
  context.quadraticCurveTo(to - 5, top + 1, to + 50, bottom);
  context.fill();
  const water = context.createLinearGradient(0, top, 0, bottom);
  water.addColorStop(0, "#5d9fb0");
  water.addColorStop(1, "#3d7f8f");
  context.fillStyle = water;
  context.beginPath();
  context.moveTo(from - 20, bottom);
  context.quadraticCurveTo(from + 20, top + 6, from + 80, top + 6);
  context.lineTo(to - 80, top + 6);
  context.quadraticCurveTo(to - 20, top + 6, to + 20, bottom);
  context.fill();
  // Sparkles and slow ripples on the water.
  context.strokeStyle = "rgba(230,248,255,.55)";
  context.lineWidth = 2;
  for (let x = from + 90; x < to - 90; x += 70) {
    const y = top + 18 + hash(x) * (bottom - top - 30);
    const drift = Math.sin(time * 0.8 + x) * 6;
    context.beginPath();
    context.moveTo(x + drift, y);
    context.lineTo(x + drift + 18 + hash(x + 3) * 20, y);
    context.stroke();
  }
  paintReeds(context, from, to, top, time);
  paintMudBar(context, bar);
}

// Cattails along the far edge of the water.
function paintReeds(context, from, to, top, time) {
  for (let x = from + 70; x < to - 70; x += 23) {
    if (hash(x * 0.1) < 0.45) continue;
    const height = 26 + hash(x + 1) * 30;
    const sway = Math.sin(time * 1.3 + x * 0.05) * 3;
    context.strokeStyle = "#5f8a3c";
    context.lineWidth = 2.5;
    context.beginPath();
    context.moveTo(x, top + 8);
    context.quadraticCurveTo(x + sway * 0.4, top - height * 0.5, x + sway, top - height);
    context.stroke();
    if (hash(x + 2) > 0.5) {
      context.fillStyle = "#6b4a2b";
      context.beginPath();
      context.ellipse(x + sway * 0.9, top - height * 0.8, 3, 8, 0, 0, Math.PI * 2);
      context.fill();
    }
  }
}

// A low mud bar in the water where the alligator likes to bask.
function paintMudBar(context, x) {
  context.fillStyle = "#7d6a47";
  context.beginPath();
  context.ellipse(x, GROUND.back + 3, 170, 16, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#94805a";
  context.beginPath();
  context.ellipse(x - 20, GROUND.back - 2, 120, 8, 0, 0, Math.PI * 2);
  context.fill();
}

// A big live oak behind the path: a thick trunk and a wide, bumpy crown.
export function paintOak(context, x, seed) {
  const base = GROUND.back + 6;
  context.fillStyle = "#6b4f37";
  context.beginPath();
  context.moveTo(x - 26, base);
  context.quadraticCurveTo(x - 14, base - 90, x - 16, base - 190);
  context.lineTo(x + 16, base - 190);
  context.quadraticCurveTo(x + 14, base - 90, x + 26, base);
  context.fill();
  // Two big limbs spreading out.
  context.strokeStyle = "#6b4f37";
  context.lineCap = "round";
  context.lineWidth = 14;
  for (const side of [-1, 1]) {
    context.beginPath();
    context.moveTo(x, base - 170);
    context.quadraticCurveTo(x + side * 50, base - 200, x + side * 95, base - 205);
    context.stroke();
  }
  // Bark lines.
  context.strokeStyle = "rgba(60,40,25,.35)";
  context.lineWidth = 2;
  for (let line = -1; line <= 1; line++) {
    context.beginPath();
    context.moveTo(x + line * 8, base - 10);
    context.lineTo(x + line * 7 + 2, base - 160);
    context.stroke();
  }
  const greens = ["#4f7d3a", "#5e8f43", "#6fa24c"];
  greens.forEach((green, layer) => {
    context.fillStyle = green;
    for (let blob = 0; blob < 7; blob++) {
      const angle = Math.PI * (blob / 6);
      const bx = x - Math.cos(angle) * (120 - layer * 18) + (hash(seed + blob) - 0.5) * 20;
      const by = base - 230 - Math.sin(angle) * (55 - layer * 6) + layer * 8;
      context.beginPath();
      context.arc(bx, by, 48 - layer * 7 + hash(seed + blob + 9) * 12, 0, Math.PI * 2);
      context.fill();
    }
  });
}

// A wooden trail sign on two posts.
export function paintSign(context, x, words) {
  const base = GROUND.pathTop + 2;
  context.fillStyle = "#6d4c2f";
  context.fillRect(x - 46, base - 92, 8, 92);
  context.fillRect(x + 38, base - 92, 8, 92);
  context.fillStyle = "#9b6e44";
  context.beginPath();
  context.roundRect(x - 64, base - 118, 128, 50, 8);
  context.fill();
  context.fillStyle = "#fff4dc";
  context.font = "700 19px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(words, x, base - 93);
}

// The path: packed dirt, and a wooden boardwalk where it crosses the bayou.
export function paintPath(context, view, place) {
  const { pathTop, pathBottom } = GROUND;
  const dirt = context.createLinearGradient(0, pathTop, 0, pathBottom);
  dirt.addColorStop(0, "#d8bf8d");
  dirt.addColorStop(1, "#c3a574");
  context.fillStyle = dirt;
  context.fillRect(view.left, pathTop, view.width, pathBottom - pathTop);
  context.fillStyle = "rgba(120,95,60,.35)";
  for (let x = Math.floor(view.left / 37) * 37; x < view.left + view.width; x += 37) {
    context.beginPath();
    context.ellipse(x + hash(x) * 30, pathTop + 12 + hash(x + 5) * 70, 3 + hash(x + 2) * 4, 2, 0, 0, Math.PI * 2);
    context.fill();
  }
  const from = Math.max(place.water.from - 40, view.left - 10);
  const to = Math.min(place.water.to + 40, view.left + view.width + 10);
  if (to > from && place.theme !== "gulf") paintBoardwalk(context, from, to);
}

function paintBoardwalk(context, from, to) {
  const { pathTop, pathBottom } = GROUND;
  context.fillStyle = "#3d7f8f";
  context.fillRect(from, pathTop, to - from, pathBottom - pathTop);
  context.fillStyle = "#a57a4e";
  context.fillRect(from, pathTop + 38, to - from, 44);
  context.strokeStyle = "#7d5835";
  context.lineWidth = 2;
  for (let x = Math.ceil(from / 26) * 26; x < to; x += 26) {
    context.beginPath();
    context.moveTo(x, pathTop + 38);
    context.lineTo(x, pathTop + 82);
    context.stroke();
  }
  // Posts down into the water and a railing along the back.
  context.fillStyle = "#6d4c2f";
  for (let x = Math.ceil(from / 130) * 130; x < to; x += 130) {
    context.fillRect(x - 5, pathTop + 80, 10, pathBottom - pathTop - 80);
    context.fillRect(x - 4, pathTop, 8, 40);
  }
  context.fillRect(from, pathTop + 4, to - from, 6);
}

// Grass tufts and Texas wildflowers along the front edge, sliding a little faster than the path.
export function paintFront(context, view, time, theme = {}) {
  const depth = 1.15;
  const shift = view.left * depth;
  context.fillStyle = theme.front ?? "#6f9f45";
  context.fillRect(view.left, GROUND.pathBottom, view.width, 600 - GROUND.pathBottom + 40);
  if (theme.grass === "#eddab1") return;
  for (let index = Math.floor(shift / 28) - 1; index <= Math.floor((shift + view.width) / 28) + 1; index++) {
    const x = view.left + index * 28 - shift + hash(index) * 20;
    const y = GROUND.pathBottom + 4 + hash(index + 3) * 20;
    const sway = Math.sin(time * 1.6 + index) * 2;
    context.strokeStyle = hash(index + 9) > 0.5 ? "#4f8a34" : "#5e9a3c";
    context.lineWidth = 3;
    context.lineCap = "round";
    for (const lean of [-6, 0, 6]) {
      context.beginPath();
      context.moveTo(x, y + 14);
      context.quadraticCurveTo(x + lean * 0.3, y, x + lean + sway, y - 12 - hash(index + lean) * 8);
      context.stroke();
    }
    if (hash(index + 21) > 0.7) paintFlower(context, x + 8, y - 6, hash(index + 22) > 0.5);
  }
}

// A bluebonnet (blue spike, white tip) or an Indian paintbrush (orange-red).
function paintFlower(context, x, y, bluebonnet) {
  context.fillStyle = bluebonnet ? "#3f5fb8" : "#e0572e";
  for (let bud = 0; bud < 5; bud++) {
    context.beginPath();
    context.arc(x + (bud % 2 ? 2.5 : -2.5), y - bud * 4, 3.4 - bud * 0.3, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = bluebonnet ? "#ffffff" : "#f28b5b";
  context.beginPath();
  context.arc(x, y - 20, 2.4, 0, Math.PI * 2);
  context.fill();
}
