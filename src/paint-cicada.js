// Dog-day cicada clinging head-up to a tree trunk, seen from above and behind, tail end on (0, 0) so it reaches upward.
// `size` is its full length with the wing tips. Idle: every few seconds it sings, the body buzzes and sound waves pulse out.
// Walking: legs crawl and the body steps up the trunk. Alert: the wings lift and spread as if about to fly.
const BLACK = "#1c211a", GREEN = "#72a545", DEEP = "#4d7d33", ABDOMEN = "#2a261f", LEG = "#2b3523";
const GLASS = "rgba(228, 244, 240, 0.46)", HINDGLASS = "rgba(200, 226, 232, 0.46)", VEIN = "#5f9240";
const WAVE_SPREAD = 0.55;

// Hip, knee and foot of the front, middle and hind leg on the right side, in units of size (the left side mirrors it).
const LEGS = [
  { hip: [0.09, -0.8], knee: [0.21, -0.87], foot: [0.25, -0.8] },
  { hip: [0.12, -0.7], knee: [0.24, -0.71], foot: [0.27, -0.63] },
  { hip: [0.12, -0.64], knee: [0.23, -0.54], foot: [0.25, -0.43] }
];
// Where the veins run from the wing's base to its edge, in the wing's own units.
const VEINS = [[0.11, 0.3], [0.085, 0.47], [0.04, 0.59], [-0.01, 0.51], [-0.035, 0.4]];

// Reaches sideways to the sound waves, up to the head, and down to the wing tips.
export const CICADA_BOX = { left: -0.45, right: 0.45, top: -1.04 };

export function paintCicada(context, size, time, state = {}) {
  const pose = poseAt(time, state);
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.save();
  context.translate(size * pose.shake, size * (pose.step + pose.shake * 0.4));
  paintLegs(context, size, pose);
  paintAbdomen(context, size);
  paintThorax(context, size);
  paintHead(context, size);
  paintWings(context, size, pose);
  context.restore();
  paintSound(context, size, pose);
  context.restore();
}

function smoothstep(from, to, value) {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

function fillOval(context, color, x, y, radiusX, radiusY) {
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.fill();
}

// Everything that changes from frame to frame. It sings from 1 s to 3 s of every 4, only while idle.
function poseAt(time, state) {
  const walking = Boolean(state.walking), alert = Boolean(state.alert);
  const cycle = time % 4;
  const song = walking || alert ? 0 : smoothstep(1, 1.25, cycle) * (1 - smoothstep(2.75, 3, cycle));
  return {
    walking,
    phase: time * 9,
    song,
    songTime: cycle - 1,
    spread: alert ? 0.3 + 0.03 * Math.sin(time * 14) : 0,
    shake: song * Math.sin(time * 95) * 0.012,
    step: walking ? Math.sin(time * 4.5) * 0.012 : 0
  };
}

// Sound waves: three curved arcs on each side grow outward from the head and thorax and fade, light over a dark shadow.
function paintSound(context, size, pose) {
  if (pose.song <= 0) return;
  context.save();
  for (const side of [1, -1]) {
    for (let wave = 0; wave < 3; wave++) {
      const grow = (pose.songTime * 1.4 + wave / 3) % 1;
      const from = side > 0 ? -WAVE_SPREAD : Math.PI - WAVE_SPREAD;
      context.globalAlpha = pose.song * (1 - grow) ** 0.6;
      context.beginPath();
      context.arc(0, -size * 0.78, size * (0.2 + 0.21 * grow), from, from + WAVE_SPREAD * 2);
      context.strokeStyle = "rgba(60, 40, 15, 0.55)";
      context.lineWidth = Math.max(3, size * 0.055 * (1 - grow * 0.4));
      context.stroke();
      context.strokeStyle = "#fff3c4";
      context.lineWidth = Math.max(1.6, size * 0.032 * (1 - grow * 0.4));
      context.stroke();
    }
  }
  context.restore();
}

// Six legs in two tripods: three move while the other three grip.
function paintLegs(context, size, pose) {
  LEGS.forEach((leg, index) => {
    for (const side of [1, -1]) {
      const swing = pose.walking ? Math.sin(pose.phase + (index % 2 ? 0 : Math.PI) + (side > 0 ? 0 : Math.PI)) : 0;
      paintLeg(context, size, leg, side, swing * 0.035);
    }
  });
}

// One leg: thick upper part, thinner lower part, and a small gripping foot. `move` (in sizes) shifts the foot along the trunk.
function paintLeg(context, size, leg, side, move) {
  const hip = leg.hip, knee = [leg.knee[0], leg.knee[1] + move * 0.6], foot = [leg.foot[0], leg.foot[1] + move];
  context.save();
  context.scale(side, 1);
  context.strokeStyle = context.fillStyle = LEG;
  context.lineWidth = Math.max(2, size * 0.048);
  context.beginPath();
  context.moveTo(size * hip[0], size * hip[1]);
  context.lineTo(size * knee[0], size * knee[1]);
  context.stroke();
  context.lineWidth = Math.max(1.4, size * 0.03);
  context.beginPath();
  context.moveTo(size * knee[0], size * knee[1]);
  context.lineTo(size * foot[0], size * foot[1]);
  context.stroke();
  context.beginPath();
  context.arc(size * foot[0], size * foot[1], Math.max(1.2, size * 0.02), 0, Math.PI * 2);
  context.fill();
  context.restore();
}

// The dark abdomen, tapering to the tail end, with faint pale lines between its segments.
function paintAbdomen(context, size) {
  context.fillStyle = ABDOMEN;
  context.beginPath();
  context.moveTo(-size * 0.1, -size * 0.64);
  context.quadraticCurveTo(-size * 0.14, -size * 0.35, -size * 0.05, -size * 0.12);
  context.quadraticCurveTo(0, -size * 0.07, size * 0.05, -size * 0.12);
  context.quadraticCurveTo(size * 0.14, -size * 0.35, size * 0.1, -size * 0.64);
  context.closePath();
  context.fill();
  context.strokeStyle = "rgba(150, 135, 95, 0.5)";
  context.lineWidth = Math.max(0.8, size * 0.008);
  for (const [y, half] of [[-0.55, 0.104], [-0.46, 0.11], [-0.37, 0.108], [-0.28, 0.098], [-0.2, 0.08]]) {
    context.beginPath();
    context.moveTo(-size * half, size * y);
    context.quadraticCurveTo(0, size * (y + 0.04), size * half, size * y);
    context.stroke();
  }
}

// The thorax: a black shield marked with green, then the green collar in front of it.
function paintThorax(context, size) {
  context.fillStyle = BLACK;
  context.beginPath();
  context.moveTo(-size * 0.148, -size * 0.8);
  context.lineTo(size * 0.148, -size * 0.8);
  context.quadraticCurveTo(size * 0.165, -size * 0.7, size * 0.115, -size * 0.62);
  context.lineTo(-size * 0.115, -size * 0.62);
  context.quadraticCurveTo(-size * 0.165, -size * 0.7, -size * 0.148, -size * 0.8);
  context.fill();
  paintMarks(context, size);
  paintCollar(context, size);
}

// Green markings on the black shield: a comma on each side and an X in the middle.
function paintMarks(context, size) {
  context.fillStyle = GREEN;
  for (const side of [1, -1]) {
    context.save();
    context.scale(side, 1);
    context.beginPath();
    context.moveTo(size * 0.08, -size * 0.79);
    context.quadraticCurveTo(size * 0.14, -size * 0.75, size * 0.128, -size * 0.69);
    context.lineTo(size * 0.098, -size * 0.705);
    context.quadraticCurveTo(size * 0.104, -size * 0.745, size * 0.068, -size * 0.78);
    context.fill();
    context.restore();
  }
  context.strokeStyle = GREEN;
  context.lineWidth = Math.max(1, size * 0.022);
  context.beginPath();
  for (const lean of [-1, 1]) {
    context.moveTo(-lean * size * 0.04, -size * 0.735);
    context.lineTo(lean * size * 0.04, -size * 0.66);
  }
  context.stroke();
}

// The pronotum: a green collar with a black stripe down the middle and two slanted ones.
function paintCollar(context, size) {
  context.fillStyle = GREEN;
  context.beginPath();
  context.moveTo(-size * 0.12, -size * 0.875);
  context.lineTo(size * 0.12, -size * 0.875);
  context.quadraticCurveTo(size * 0.15, -size * 0.84, size * 0.148, -size * 0.8);
  context.lineTo(-size * 0.148, -size * 0.8);
  context.quadraticCurveTo(-size * 0.15, -size * 0.84, -size * 0.12, -size * 0.875);
  context.fill();
  context.fillStyle = BLACK;
  context.fillRect(-size * 0.018, -size * 0.875, size * 0.036, size * 0.075);
  context.strokeStyle = DEEP;
  context.lineWidth = Math.max(1, size * 0.022);
  context.beginPath();
  for (const side of [1, -1]) {
    context.moveTo(side * size * 0.05, -size * 0.865);
    context.lineTo(side * size * 0.115, -size * 0.812);
  }
  context.stroke();
}

// Broad blunt head with a green face patch, three tiny eyes on top, and two big bulging side eyes.
function paintHead(context, size) {
  context.fillStyle = BLACK;
  context.beginPath();
  context.moveTo(-size * 0.095, -size * 0.87);
  context.lineTo(-size * 0.1, -size * 0.95);
  context.quadraticCurveTo(-size * 0.095, -size * 1.0, -size * 0.045, -size * 1.0);
  context.lineTo(size * 0.045, -size * 1.0);
  context.quadraticCurveTo(size * 0.095, -size * 1.0, size * 0.1, -size * 0.95);
  context.lineTo(size * 0.095, -size * 0.87);
  context.fill();
  fillOval(context, GREEN, 0, -size * 0.975, size * 0.05, size * 0.016);
  const dot = Math.max(0.8, size * 0.009);
  for (const [x, y] of [[-0.022, -0.915], [0.022, -0.915], [0, -0.945]]) fillOval(context, "#c8764a", size * x, size * y, dot, dot);
  for (const side of [1, -1]) paintEye(context, size, side);
}

// One big dark eye bulging out of the side of the head, with a warm shade and a small white glint.
function paintEye(context, size, side) {
  context.save();
  context.scale(side, 1);
  fillOval(context, "#221410", size * 0.106, -size * 0.94, size * 0.056, size * 0.062);
  fillOval(context, "#3d2219", size * 0.11, -size * 0.935, size * 0.036, size * 0.044);
  const glint = Math.max(1, size * 0.011);
  fillOval(context, "#ffffff", size * 0.122, -size * 0.957, glint, glint);
  context.restore();
}

// Two pairs of clear wings folded like a tent over the body, meeting down the middle and reaching past the tail.
// Alert lifts and spreads them.
function paintWings(context, size, pose) {
  for (const side of [1, -1]) {
    context.save();
    context.scale(side, 1);
    paintWing(context, size, pose.spread + 0.14, 0.94, HINDGLASS, false);
    paintWing(context, size, pose.spread, 1, GLASS, true);
    context.restore();
  }
}

// The two curves of a wing's front edge, from the shoulder out and down to the tip.
function frontEdge(context, size) {
  context.quadraticCurveTo(size * 0.14, size * 0.1, size * 0.11, size * 0.35);
  context.quadraticCurveTo(size * 0.085, size * 0.57, size * 0.015, size * 0.62);
}

// One wing hinged on the side of the thorax and swung outward by `angle`: glassy, with a thin green edge.
function paintWing(context, size, angle, scale, glass, veined) {
  context.save();
  context.translate(size * 0.06, -size * 0.65);
  context.rotate(-angle);
  context.scale(scale, scale);
  context.beginPath();
  context.moveTo(-size * 0.055, 0);
  context.quadraticCurveTo(0, -size * 0.035, size * 0.06, -size * 0.02);
  frontEdge(context, size);
  context.quadraticCurveTo(-size * 0.03, size * 0.575, -size * 0.05, size * 0.35);
  context.closePath();
  context.fillStyle = glass;
  context.fill();
  context.strokeStyle = VEIN;
  context.lineWidth = Math.max(0.8, size * 0.008);
  context.stroke();
  if (veined) paintVeins(context, size);
  context.restore();
}

// Green veins: a thick front edge, a fan of veins from the base, short cross veins, and a white glint on the glass.
function paintVeins(context, size) {
  context.strokeStyle = VEIN;
  context.lineWidth = Math.max(1.2, size * 0.014);
  context.beginPath();
  context.moveTo(size * 0.06, -size * 0.02);
  frontEdge(context, size);
  context.stroke();
  context.lineWidth = Math.max(0.7, size * 0.007);
  context.beginPath();
  for (const [x, y] of VEINS) {
    context.moveTo(0, 0);
    context.quadraticCurveTo(size * x * 0.4, size * y * 0.5, size * x, size * y);
  }
  for (const [along, down] of [[0.4, 0.45], [0.7125, 0.75]]) {
    VEINS.forEach(([x, y], i) => {
      if (!i) return;
      context.moveTo(size * x * along, size * y * down);
      context.lineTo(size * VEINS[i - 1][0] * along, size * VEINS[i - 1][1] * down);
    });
  }
  context.stroke();
  context.save();
  context.translate(size * 0.075, size * 0.22);
  context.rotate(0.12);
  fillOval(context, "rgba(255, 255, 255, 0.45)", 0, 0, size * 0.01, size * 0.095);
  context.restore();
}
