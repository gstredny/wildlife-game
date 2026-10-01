// Draws what comes at the explorer: pinecones, acorns, mosquitoes, fire ants (with their mound),
// tumbleweeds and beach balls, each with a shadow that shrinks while it is up in the air.
import { hazardAt, HAZARDS } from "./hazards.js";
import { GROUND } from "./scenery.js";
import { squished } from "./trail.js";

export function paintHazards(context, walk, seen) {
  for (const lane of walk.place.lanes) {
    const { size } = HAZARDS[lane.kind];
    if (lane.kind === "fireAnts" && seen(lane.from, 60)) paintAntMound(context, lane.from);
    const thing = hazardAt(lane, walk.time);
    if (!thing || squished(walk, lane, thing) || !seen(thing.x, size * 2)) continue;
    const shadow = Math.max(0.3, 1 - thing.y / 260);
    context.fillStyle = "rgba(40,50,30,.3)";
    context.beginPath();
    context.ellipse(thing.x, GROUND.path + 2, size * shadow, 5 * shadow, 0, 0, Math.PI * 2);
    context.fill();
    context.save();
    context.translate(thing.x, GROUND.path - thing.y);
    PAINT[lane.kind](context, size, thing, walk.time);
    context.restore();
  }
}

// Each painter draws with its feet at (0, 0), facing left, the way it travels.
const PAINT = {
  pinecone(context, size, { turn }) {
    context.translate(0, -size);
    context.rotate(turn);
    context.fillStyle = "#5b3a1e";
    context.fillRect(-3, -size - 5, 6, 7);
    body(context, size * 0.78, size, "#8a5a2b", "#4e3016");
    context.strokeStyle = "#5b3a1e";
    context.lineWidth = 1.8;
    for (let row = -2; row <= 2; row++) {
      const width = size * 0.78 * Math.sqrt(1 - (row / 2.6) ** 2);
      for (let dx = -width + 5; dx < width - 2; dx += 7) {
        context.beginPath();
        context.arc(dx + (row % 2 ? 3.5 : 0), row * 6.5, 4, 0.15 * Math.PI, 0.85 * Math.PI);
        context.stroke();
      }
    }
    shine(context, size);
  },

  acorn(context, size, { turn }) {
    context.translate(0, -size);
    context.rotate(turn);
    body(context, size * 0.8, size, "#b9793a", "#6e4420");
    // The scaly cap and its little stem.
    context.fillStyle = "#6e4f2e";
    context.beginPath();
    context.ellipse(0, -size * 0.35, size * 0.92, size * 0.55, 0, Math.PI, 0);
    context.fill();
    context.strokeStyle = "#8d6a42";
    context.lineWidth = 1.5;
    for (let dx = -size * 0.6; dx <= size * 0.6; dx += size * 0.3) {
      context.beginPath();
      context.moveTo(dx - 3, -size * 0.55);
      context.lineTo(dx + 3, -size * 0.4);
      context.stroke();
    }
    context.fillStyle = "#4e3016";
    context.fillRect(-2, -size * 0.95, 4, size * 0.2);
    shine(context, size);
  },

  mosquito(context, size, thing, time) {
    const flap = Math.sin(time * 60) * 0.5;
    context.translate(0, -size);
    context.strokeStyle = "#2d2d33";
    context.lineWidth = 1.6;
    for (const dx of [-8, 0, 8]) {
      context.beginPath();
      context.moveTo(dx, 2);
      context.quadraticCurveTo(dx - 6, 14, dx - 2, 24);
      context.stroke();
    }
    // Two see-through wings, buzzing.
    context.fillStyle = "rgba(210,235,250,.75)";
    context.strokeStyle = "rgba(120,150,170,.9)";
    context.lineWidth = 1;
    for (const tilt of [-0.9 + flap, -0.4 - flap]) {
      context.save();
      context.rotate(tilt);
      context.beginPath();
      context.ellipse(0, -16, 6, 17, 0, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.restore();
    }
    // A striped tail, a round body, a head and its long nose.
    context.fillStyle = "#3b3b44";
    context.beginPath();
    context.ellipse(15, 0, 14, 5, -0.2, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#d8d8de";
    context.lineWidth = 1.5;
    for (const dx of [10, 16, 22]) {
      context.beginPath();
      context.moveTo(dx, -4);
      context.lineTo(dx - 1, 4);
      context.stroke();
    }
    context.fillStyle = "#2d2d33";
    context.beginPath();
    context.arc(-4, -1, 7, 0, Math.PI * 2);
    context.arc(-13, -2, 5, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#2d2d33";
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(-17, 0);
    context.lineTo(-30, 6);
    context.stroke();
    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(-14, -4, 1.8, 0, Math.PI * 2);
    context.fill();
  },

  fireAnts(context, size, { x }) {
    // A little line of red ants, marching.
    context.scale(1.5, 1.5);
    for (const [dx, step] of [[-size * 0.75, 0], [0, 1.4], [size * 0.75, 2.8]]) paintAnt(context, dx, x * 0.25 + step);
  },

  tumbleweed(context, size, { turn }) {
    context.translate(0, -size);
    context.rotate(turn);
    context.fillStyle = "rgba(196,164,104,.35)";
    context.beginPath();
    context.arc(0, 0, size, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#9c7a44";
    context.lineWidth = 2.2;
    for (let loop = 0; loop < 9; loop++) {
      const angle = loop * 0.7;
      context.beginPath();
      context.ellipse(Math.cos(angle) * size * 0.2, Math.sin(angle) * size * 0.2, size * 0.8, size * 0.45, angle, 0, Math.PI * 2);
      context.stroke();
    }
    context.strokeStyle = "#c9a669";
    context.lineWidth = 1.4;
    for (let twig = 0; twig < 8; twig++) {
      const angle = twig * 0.8 + 0.3;
      context.beginPath();
      context.moveTo(Math.cos(angle) * size * 0.3, Math.sin(angle) * size * 0.3);
      context.lineTo(Math.cos(angle) * size * 1.05, Math.sin(angle) * size * 1.05);
      context.stroke();
    }
  },

  beachBall(context, size, { turn }) {
    context.translate(0, -size);
    context.rotate(turn);
    ["#e84a3c", "#ffffff", "#f5c02b", "#ffffff", "#2f7fd8", "#ffffff"].forEach((color, index) => {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(0, 0);
      context.arc(0, 0, size, index * Math.PI / 3, (index + 1) * Math.PI / 3);
      context.closePath();
      context.fill();
    });
    context.strokeStyle = "rgba(60,60,70,.5)";
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(0, 0, size, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(0, 0, size * 0.18, 0, Math.PI * 2);
    context.fill();
    shine(context, size);
  }
};

function body(context, width, height, fill, edge) {
  context.fillStyle = fill;
  context.strokeStyle = edge;
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();
}

function shine(context, size) {
  context.fillStyle = "rgba(255,240,210,.4)";
  context.beginPath();
  context.ellipse(-size * 0.3, -size * 0.4, size * 0.16, size * 0.27, -0.4, 0, Math.PI * 2);
  context.fill();
}

// One fire ant facing left, with its legs stepping as `step` goes on.
function paintAnt(context, x, step) {
  context.strokeStyle = "#5a1a10";
  context.lineWidth = 1.6;
  for (const [dx, phase] of [[-3, 0], [1, Math.PI], [5, 0]]) {
    const swing = Math.sin(step * 6 + phase) * 3;
    context.beginPath();
    context.moveTo(x + dx, -6);
    context.lineTo(x + dx - 3 + swing, 0);
    context.stroke();
  }
  context.fillStyle = "#b6301c";
  for (const [dx, r] of [[-8, 4], [0, 3], [8, 5.5]]) {
    context.beginPath();
    context.arc(x + dx, -7, r, 0, Math.PI * 2);
    context.fill();
  }
  context.beginPath();
  context.moveTo(x - 10, -10);
  context.lineTo(x - 14, -16);
  context.stroke();
}

// The ant hill the fire ants march out of: a low heap of loose dirt.
function paintAntMound(context, x) {
  context.fillStyle = "#b08a5a";
  context.beginPath();
  context.ellipse(x, GROUND.path + 2, 44, 20, 0, Math.PI, 0);
  context.fill();
  context.fillStyle = "#9a764a";
  for (const [dx, dy] of [[-18, -6], [6, -12], [20, -4], [-4, -3]]) {
    context.beginPath();
    context.arc(x + dx, GROUND.path + dy, 3, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = "#4a3320";
  context.beginPath();
  context.ellipse(x, GROUND.path - 14, 5, 3, 0, 0, Math.PI * 2);
  context.fill();
}
