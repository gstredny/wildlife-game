// American alligator basking on a muddy bank, facing right, belly on (0, 0). `size` is the height of its back and eye bumps.
// It lies about 6.7 sizes long, snout to tail tip. Idle: slowly gapes to cool off, tail sways, blinks.
// Walking: slow crawl. Alert: mouth shut, head lifted. Everything runs off `time`, so every frame is stable.
const OLIVE = "#39412a", DARK = "#262d1d", LIGHT = "#4f5b37", FAR = "#2b3322";
const CREAM = "#dfd8a0", TEETH = "#fbf7ea", MOUTH = "#6b2d30", THROAT = "#4f2124", TONGUE = "#d4868a";
const EYE = "#d7df3f", PUPIL = "#14170c", TOE = "#5d6a40";
const GAIT = 3.2;
const GAPE_ANGLE = 0.42;

// Anchors along the back and belly, in units of size: [x, y, how much the tail sway lifts it].
const TOP = [[1.5, -0.62, 0], [1.15, -0.76, 0], [0.5, -0.83, 0], [-0.2, -0.83, 0], [-0.8, -0.76, 0], [-1.4, -0.63, 0.05],
  [-2.0, -0.57, 0.25], [-2.6, -0.46, 0.55], [-3.0, -0.31, 0.85], [-3.25, -0.17, 0.95], [-3.4, -0.1, 1]];
const BOTTOM = [[1.5, -0.06, 0], [1.0, -0.07, 0], [-0.8, -0.07, 0], [-1.4, -0.07, 0.05], [-2.0, -0.07, 0.2],
  [-2.6, -0.07, 0.45], [-3.0, -0.08, 0.8], [-3.25, -0.09, 0.95], [-3.4, -0.1, 1]];
// Legs: hip x, where the foot rests, where the elbow or knee sits beside the hip, gait phase, and whether it is the far side.
const LEGS = [
  { hip: -0.3, rest: -0.95, bend: 0.2, phase: 0, far: true },
  { hip: 0.9, rest: 1.05, bend: -0.2, phase: Math.PI, far: true },
  { hip: -0.6, rest: -0.72, bend: 0.2, phase: Math.PI, far: false },
  { hip: 0.8, rest: 0.85, bend: -0.2, phase: 0, far: false }
];

// Keeps the whole drawing inside: the tail tip and snout reach out, the open mouth reaches up.
export const ALLIGATOR_BOX = { left: -3.42, right: 3.38, top: -1.47 };

export function paintAlligator(context, size, time, state = {}) {
  const pose = poseAt(time, state);
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.translate(0, -pose.rise * size);
  LEGS.filter(leg => leg.far).forEach(leg => paintLeg(context, size, leg, pose));
  paintTrunk(context, size, pose);
  LEGS.filter(leg => !leg.far).forEach(leg => paintLeg(context, size, leg, pose));
  paintHead(context, size, pose);
  context.restore();
}

function smoothstep(from, to, value) {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

function fillOval(context, color, x, y, radiusX, radiusY, turn = 0) {
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, turn, 0, Math.PI * 2);
  context.fill();
}

// Everything that changes from frame to frame, worked out once from the time and state.
function poseAt(time, state) {
  const walking = Boolean(state.walking), alert = Boolean(state.alert);
  const phase = time * GAIT;
  const blinkAt = (time + 2) % 4.3;
  const blink = blinkAt < 0.18 ? Math.sin((blinkAt / 0.18) * Math.PI) : 0;
  const sleepy = alert ? 0.04 : 0.2;
  return {
    walking,
    phase,
    gape: walking || alert ? 0 : smoothstep(0, 0.85, Math.sin(time * 0.45)),
    lift: (alert ? 0.14 : 0) + (walking ? Math.sin(phase * 2) * 0.025 : 0),
    rise: walking ? 0.07 : 0,
    tail: 0.05 + (walking ? 0.15 : 0.13) * (0.5 + 0.5 * Math.sin(time * (walking ? 2.6 : 0.8))),
    lid: sleepy + (1 - sleepy) * blink
  };
}

// A smooth line through the anchors, sampled finely (Catmull-Rom), scaled to pixels with the tail sway added.
function edgeLine(anchors, size, tail) {
  const points = anchors.map(([x, y, bend]) => [x * size, (y - bend * tail) * size]);
  const line = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [points[Math.max(i - 1, 0)], points[i], points[i + 1], points[Math.min(i + 2, points.length - 1)]];
    for (let k = 0; k < 8; k++) {
      const t = k / 8;
      const mix = axis => 0.5 * (2 * p1[axis] + (p2[axis] - p0[axis]) * t
        + (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t * t
        + (3 * p1[axis] - p0[axis] - 3 * p2[axis] + p3[axis]) * t * t * t);
      line.push([mix(0), mix(1)]);
    }
  }
  line.push(points[points.length - 1]);
  return line;
}

function edgeY(line, x) {
  for (let i = 1; i < line.length; i++) {
    if (line[i][0] <= x) {
      const [x0, y0] = line[i - 1], [x1, y1] = line[i];
      return y0 + (y1 - y0) * ((x - x0) / (x1 - x0 || 1));
    }
  }
  return line[line.length - 1][1];
}

// Fills the strip between two lines: the first forward, the second back.
function fillBetween(context, first, second, color) {
  context.fillStyle = color;
  context.beginPath();
  first.forEach(([x, y], i) => (i ? context.lineTo(x, y) : context.moveTo(x, y)));
  [...second].reverse().forEach(([x, y]) => context.lineTo(x, y));
  context.closePath();
  context.fill();
}

// Tail and body in one piece: olive back, cream belly strip, and two rows of armor bumps on top.
function paintTrunk(context, size, pose) {
  const top = edgeLine(TOP, size, pose.tail);
  const bottom = edgeLine(BOTTOM, size, pose.tail);
  fillBetween(context, top, bottom, OLIVE);
  const strip = bottom.map(([x, y]) => [x, y - Math.min(size * 0.13, (y - edgeY(top, x)) * 0.28)]);
  fillBetween(context, bottom, strip, CREAM);
  paintScutes(context, top, size, DARK, 0.5);
  paintScutes(context, top, size, LIGHT, 0);
}

// One row of pointed armor bumps from the shoulders to the tail tip, shrinking as they go.
function paintScutes(context, line, size, color, shift) {
  const count = 17;
  context.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const u = (i + shift) / count;
    const x = size * (1.1 - u * 4.3);
    const height = size * (0.11 - 0.075 * u), width = height * 1.15;
    context.save();
    context.translate(x, edgeY(line, x));
    context.rotate(Math.atan2(edgeY(line, x + size * 0.05) - edgeY(line, x - size * 0.05), size * 0.1));
    context.beginPath();
    context.moveTo(-width, height * 0.3);
    context.quadraticCurveTo(-width * 0.9, -height, -width * 0.15, -height);
    context.quadraticCurveTo(width * 0.7, -height, width, height * 0.3);
    context.closePath();
    context.fill();
    context.restore();
  }
}

// A short sprawled leg: round shoulder, bent limb, and a flat foot that stays on the ground.
function paintLeg(context, size, leg, pose) {
  const swing = pose.walking ? Math.sin(pose.phase + leg.phase) : 0;
  const lifted = pose.walking ? Math.max(0, Math.cos(pose.phase + leg.phase)) : 0;
  const hip = [size * leg.hip, -size * 0.27];
  const foot = [size * (leg.rest + swing * 0.2), -size * (0.06 + lifted * 0.1) + pose.rise * size];
  const knee = [size * (leg.hip + leg.bend), -size * (0.1 + lifted * 0.05) + pose.rise * size];
  const color = leg.far ? FAR : LIGHT;
  fillOval(context, color, hip[0], hip[1], size * 0.14, size * 0.12, -0.3);
  context.strokeStyle = color;
  context.lineWidth = size * 0.15;
  context.beginPath();
  context.moveTo(...hip);
  context.lineTo(...knee);
  context.lineTo(foot[0], foot[1] - size * 0.03);
  context.stroke();
  paintFoot(context, size, foot, leg.far);
}

// A flat foot with four toes, each tipped with a small cream claw.
function paintFoot(context, size, foot, far) {
  fillOval(context, far ? FAR : LIGHT, foot[0] + size * 0.05, foot[1], size * 0.14, size * 0.055);
  for (let toe = 0; toe < 4; toe++) {
    const x = foot[0] + size * (0.2 + 0.025 * toe), y = foot[1] + size * (toe - 1.5) * 0.017;
    fillOval(context, far ? DARK : TOE, x, y, size * 0.07, size * 0.028);
    fillOval(context, far ? FAR : CREAM, x + size * 0.06, y, size * 0.02, size * 0.014);
  }
}

// Height of the mouth line at x (units of size): a gentle smile that turns up at the back.
function lipY(x) {
  const back = (3.2 - x) / 1.8;
  return -0.34 - 0.05 * back * back;
}

function traceLip(context, size, from, to) {
  for (let i = 0; i <= 12; i++) {
    const x = from + ((to - from) * i) / 12;
    context.lineTo(size * x, size * lipY(x));
  }
}

// The head, raised as a whole when alert: open mouth inside, lower jaw, then the gaping upper jaw on top.
function paintHead(context, size, pose) {
  context.save();
  context.translate(size * 1.3, -size * 0.06);
  context.rotate(-pose.lift);
  context.translate(-size * 1.3, size * 0.06);
  paintMouthInside(context, size, pose.gape);
  paintLowerJaw(context, size);
  context.save();
  context.translate(size * 1.42, size * lipY(1.42));
  context.rotate(-pose.gape * GAPE_ANGLE);
  context.translate(-size * 1.42, -size * lipY(1.42));
  paintUpperJaw(context, size, pose);
  context.restore();
  context.restore();
}

// The open mouth: a dark red wedge with a darker throat at the back and the pink tongue on the lower jaw.
function paintMouthInside(context, size, gape) {
  if (gape < 0.02) return;
  fillWedge(context, size, gape * GAPE_ANGLE, 3.08, MOUTH);
  fillWedge(context, size, gape * GAPE_ANGLE, 2.0, THROAT);
  fillOval(context, TONGUE, size * 2.4, size * (lipY(2.4) + 0.005), size * 0.55, size * 0.07);
}

// The gap between the lower mouth line and the raised upper one, from the hinge out to x = front.
function fillWedge(context, size, angle, front, color) {
  const hx = size * 1.42, hy = size * lipY(1.42);
  const dx = size * front - hx, dy = size * lipY(front) - hy;
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(hx, hy);
  traceLip(context, size, 1.42, front);
  context.lineTo(hx + dx * Math.cos(angle) + dy * Math.sin(angle), hy - dx * Math.sin(angle) + dy * Math.cos(angle));
  context.closePath();
  context.fill();
}

// Lower jaw: olive side, cream chin, and a row of small teeth that only show when the mouth is open.
function paintLowerJaw(context, size) {
  context.save();
  context.beginPath();
  context.moveTo(size * 1.3, size * lipY(1.3));
  traceLip(context, size, 1.3, 3.2);
  context.quadraticCurveTo(size * 3.32, -size * 0.34, size * 3.3, -size * 0.2);
  context.quadraticCurveTo(size * 3.26, -size * 0.03, size * 3.05, -size * 0.03);
  context.lineTo(size * 1.65, -size * 0.03);
  context.quadraticCurveTo(size * 1.3, -size * 0.05, size * 1.3, -size * 0.22);
  context.closePath();
  context.fillStyle = OLIVE;
  context.fill();
  context.clip();
  context.fillStyle = CREAM;
  context.fillRect(size * 1.2, -size * 0.14, size * 2.3, size * 0.2);
  context.restore();
  paintTeeth(context, size, 2.0, 3.05, 7, -1);
}

// A row of white teeth along the mouth line: hanging down (hang = 1) from the upper jaw, or pointing up (-1).
function paintTeeth(context, size, from, to, count, hang) {
  context.fillStyle = TEETH;
  for (let i = 0; i < count; i++) {
    const x = from + ((to - from) * i) / (count - 1);
    const base = size * lipY(x), length = size * (0.065 + 0.025 * (i % 2));
    context.beginPath();
    context.moveTo(size * (x - 0.04), base);
    context.lineTo(size * x, base + hang * length);
    context.lineTo(size * (x + 0.04), base);
    context.fill();
  }
}

// Skull and upper jaw with the broad rounded snout, nostril bumps, eye bumps, ear groove and upper teeth.
function paintUpperJaw(context, size, pose) {
  context.fillStyle = OLIVE;
  context.beginPath();
  context.moveTo(size * 1.3, size * lipY(1.3));
  context.lineTo(size * 1.3, -size * 0.6);
  context.quadraticCurveTo(size * 1.36, -size * 0.79, size * 1.65, -size * 0.78);
  context.quadraticCurveTo(size * 1.98, -size * 0.77, size * 2.3, -size * 0.72);
  context.quadraticCurveTo(size * 2.8, -size * 0.69, size * 3.1, -size * 0.7);
  context.quadraticCurveTo(size * 3.34, -size * 0.7, size * 3.34, -size * 0.52);
  context.quadraticCurveTo(size * 3.34, -size * 0.34, size * 3.2, -size * 0.34);
  traceLip(context, size, 3.2, 1.3);
  context.closePath();
  context.fill();
  paintTeeth(context, size, 1.85, 3.12, 11, 1);
  paintNostrils(context, size);
  paintEyeBumps(context, size);
  paintEye(context, size, pose.lid);
}

// Raised nostril bumps at the tip of the snout.
function paintNostrils(context, size) {
  fillOval(context, DARK, size * 2.94, -size * 0.71, size * 0.1, size * 0.05);
  fillOval(context, LIGHT, size * 3.06, -size * 0.72, size * 0.11, size * 0.055);
  fillOval(context, PUPIL, size * 3.12, -size * 0.73, size * 0.035, size * 0.02);
}

// Two eye bumps, the far one darker and peeking out a little ahead, and the ear groove behind them.
function paintEyeBumps(context, size) {
  fillOval(context, DARK, size * 1.98, -size * 0.8, size * 0.15, size * 0.12);
  fillOval(context, OLIVE, size * 1.78, -size * 0.84, size * 0.19, size * 0.17);
  context.strokeStyle = DARK;
  context.lineWidth = Math.max(1.2, size * 0.03);
  context.beginPath();
  context.arc(size * 1.5, -size * 0.68, size * 0.07, Math.PI * 1.05, Math.PI * 1.95);
  context.stroke();
}

// Yellow-green eye with an upright slit pupil and a white glint; the lid droops a little and closes to blink.
function paintEye(context, size, lid) {
  const x = size * 1.82, y = -size * 0.85, radius = size * 0.105;
  fillOval(context, EYE, x, y, radius, radius);
  fillOval(context, PUPIL, x + radius * 0.1, y, radius * 0.3, radius * 0.82);
  const glint = Math.max(1, radius * 0.22);
  fillOval(context, "#ffffff", x + radius * 0.4, y - radius * 0.35, glint, glint);
  context.save();
  context.beginPath();
  context.arc(x, y, radius * 1.06, 0, Math.PI * 2);
  context.clip();
  context.fillStyle = OLIVE;
  context.fillRect(x - radius * 1.1, y - radius * 1.1, radius * 2.2, radius * 2.2 * lid);
  context.restore();
}
