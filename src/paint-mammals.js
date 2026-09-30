// Three mammals for the bayou trail: white-tailed deer, coyote and feral hog.
// Each painter draws its animal facing right with its feet on (0, 0): paint(context, size, time, state).
// Inside a painter everything is in units of `size`; MAMMAL_BOXES says how far each drawing reaches.
const TAU = Math.PI * 2;
const DARK = "#15100e";
const lerp = (from, to, amount) => from + (to - from) * amount;
const smooth = x => x * x * (3 - 2 * x);

// 0, then up to 1 and back to 0 once every `period` seconds: starts at `start`, rises over `ramp`, holds for `hold`.
function pulse(time, period, start, ramp, hold = 0) {
  const t = (time % period) - start;
  if (t < 0 || t > ramp * 2 + hold) return 0;
  if (t < ramp) return smooth(t / ramp);
  return t < ramp + hold ? 1 : smooth(1 - (t - ramp - hold) / ramp);
}

// How open an eye is: shut for 0.12 s every 3.7 s. `phase` keeps the animals from blinking together.
const blinkOpen = (time, phase) => ((time + phase) % 3.7 < 0.12 ? 0.08 : 1);

// A flat oval of colour, used for shading and markings.
function patch(context, color, x, y, radiusX, radiusY, angle = 0) {
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, angle, 0, TAU);
  context.fill();
}

// A teardrop hanging from (0, 0) down the +y axis: a tail, or a tuft.
function drop(context, width, length) {
  context.beginPath();
  context.moveTo(-width * 0.5, 0);
  context.quadraticCurveTo(-width * 1.2, length * 0.6, 0, length);
  context.quadraticCurveTo(width * 1.2, length * 0.6, width * 0.5, 0);
  context.fill();
}

// A big friendly eye: coloured iris, dark pupil, small white highlight. `open` 1 to 0 shuts it for a blink, as a curved lid line.
function eye(context, x, y, radius, open, iris) {
  if (open < 0.5) {
    context.save();
    context.strokeStyle = DARK;
    context.lineWidth = radius * 0.4;
    context.lineCap = "round";
    context.beginPath();
    context.arc(x, y - radius * 0.35, radius * 0.9, Math.PI * 0.12, Math.PI * 0.88);
    context.stroke();
    context.restore();
    return;
  }
  patch(context, iris, x, y, radius, radius);
  patch(context, DARK, x + radius * 0.12, y, radius * 0.62, radius * 0.62);
  patch(context, "#ffffff", x + radius * 0.3, y - radius * 0.3, radius * 0.27, radius * 0.27);
}

// A pointed ear standing on (x, y), leaning `angle` radians forward of straight up, with a paler inside.
function ear(context, x, y, angle, length, width, outer, inner) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  for (const [color, wide, tall] of [[outer, 1, 1], [inner, 0.36, 0.62]]) {
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(-width * wide, 0);
    context.quadraticCurveTo(-width * wide * 1.2, -length * tall * 0.65, width * wide * 0.15, -length * tall);
    context.quadraticCurveTo(width * wide * 1.3, -length * tall * 0.5, width * wide, 0);
    context.fill();
  }
  context.restore();
}

// The neck: a tapered band from the shoulders (base) to the back of the head (pivot); `stripe` paints a band down the throat.
function paintNeck(context, base, pivot, widths, coat, stripe) {
  const dx = pivot[0] - base[0], dy = pivot[1] - base[1], length = Math.hypot(dx, dy);
  const edge = (point, width, side) => [point[0] - (dy / length) * (width / 2) * side, point[1] + (dx / length) * (width / 2) * side];
  const throat = [edge(pivot, widths[1], 1), edge(base, widths[0], 1)];
  context.save();
  context.fillStyle = coat;
  context.beginPath();
  context.moveTo(...edge(base, widths[0], -1));
  context.lineTo(...edge(pivot, widths[1], -1));
  context.lineTo(...throat[0]);
  context.lineTo(...throat[1]);
  context.fill();
  if (stripe) {
    context.clip();
    context.strokeStyle = stripe.color;
    context.lineWidth = stripe.width;
    context.beginPath();
    context.moveTo(...throat[0]);
    context.lineTo(...throat[1]);
    context.stroke();
  }
  context.restore();
}

// A stroke from one point to another that narrows from width `a` to width `b`, drawn in a few round-ended pieces.
function taper(context, from, to, a, b) {
  for (let i = 0; i < 4; i++) {
    context.lineWidth = lerp(a, b, (i + 0.5) / 4);
    context.beginPath();
    context.moveTo(lerp(from[0], to[0], i / 4), lerp(from[1], to[1], i / 4));
    context.lineTo(lerp(from[0], to[0], (i + 1) / 4), lerp(from[1], to[1], (i + 1) / 4));
    context.stroke();
  }
}

// A leg of two bones from hip to foot; the middle joint bends forward (bend 1) or backward (bend -1). `look` holds colours and widths.
function limb(context, hip, foot, bones, bend, look) {
  const [upper, lower] = bones;
  const dx = foot[0] - hip[0], dy = foot[1] - look.bottom * 0.55 - hip[1];
  const distance = Math.hypot(dx, dy), reach = Math.min(distance, upper + lower - 0.002);
  const along = (upper * upper - lower * lower + reach * reach) / (2 * reach);
  const out = Math.sqrt(Math.max(0, upper * upper - along * along)) * bend;
  const ux = dx / distance, uy = dy / distance;
  const knee = [hip[0] + ux * along + uy * out, hip[1] + uy * along - ux * out];
  const toe = [hip[0] + ux * reach, hip[1] + uy * reach];
  const back = Math.hypot(knee[0] - toe[0], knee[1] - toe[1]);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = look.color;
  taper(context, hip, knee, look.top, look.bottom * 1.25);
  taper(context, knee, toe, look.bottom * 1.25, look.bottom);
  context.strokeStyle = look.tip;
  context.lineWidth = look.bottom * 1.08;
  context.beginPath();
  context.moveTo(...toe);
  context.lineTo(toe[0] + ((knee[0] - toe[0]) / back) * look.tipLength, toe[1] + ((knee[1] - toe[1]) / back) * look.tipLength);
  context.stroke();
}

// Where a walking foot is relative to its standing spot, `phase` (0 to 1) of the way through a step: back on the ground, then forward in the air.
function step(phase, stride, lift) {
  const angle = phase * TAU;
  return [Math.cos(angle) * stride, -Math.max(0, -Math.sin(angle)) * lift];
}

// The legs behind (far) or in front of (near) the body. Walking moves them in diagonal pairs.
function paintLegs(context, rig, cycle, walking, far, bob) {
  for (const [hipX, hipY, footX, bones, bend, phase, isFar] of rig.legs) {
    if (isFar !== far) continue;
    const [dx, dy] = walking ? step(cycle + phase, rig.stride, rig.lift) : [0, 0];
    limb(context, [hipX, hipY + bob], [footX + dx, dy], bones, bend, far ? rig.far : rig.near);
  }
}

// How much the body bobs while walking: it rises each time a pair of feet is under it.
const bounce = (cycle, walking, amount) => (walking ? -Math.abs(Math.sin(cycle * TAU)) * amount : 0);

// Where the neck ends and the head begins: `pose.length` from the base, `pose.angle` above level.
const neckPivot = (base, pose) => [base[0] + Math.cos(pose.angle) * pose.length, base[1] - Math.sin(pose.angle) * pose.length];

// ---- White-tailed deer ----

const DEER = { coat: "#b9733f", shade: "#9a5c33", dark: "#8c5230", white: "#f7f0e4", nose: "#1c1412", antler: "#dccaa0", antlerFar: "#b59c72" };
const DEER_FRONT = [0.2, 0.2], DEER_HIND = [0.22, 0.22];
const DEER_LEGS = {
  stride: 0.07, lift: 0.06, speed: 1.4,
  near: { color: DEER.coat, top: 0.05, bottom: 0.03, tip: "#2b201b", tipLength: 0.035 },
  far: { color: "#94592f", top: 0.05, bottom: 0.03, tip: "#2b201b", tipLength: 0.035 },
  legs: [
    [0.18, -0.4, 0.2, DEER_FRONT, 1, 0, false], [-0.29, -0.42, -0.3, DEER_HIND, -1, 0.5, false],
    [0.12, -0.4, 0.13, DEER_FRONT, 1, 0.5, true], [-0.35, -0.42, -0.36, DEER_HIND, -1, 0, true]
  ]
};
// The antler: one beam sweeping up and forward, with tines [beam point, x, y] growing off it.
const ANTLER_BEAM = [[0.02, -0.07], [0, -0.125], [0.03, -0.18], [0.1, -0.205], [0.19, -0.185]];
const ANTLER_TINES = [[1, 0.075, -0.15], [2, 0.015, -0.25], [3, 0.11, -0.27]];

// Head and neck: up and watchful, walking along, or lowered to graze every so often.
function deerPose(time, walking, alert) {
  if (alert) return { angle: 1, length: 0.2, pitch: 0.12, ear: 0.2, farEar: 0.1, flag: 1 };
  const graze = walking ? 0 : pulse(time, 13, 3, 1.4, 4);
  const flick = pulse(time, 4.7, 1.3, 0.06, 0.02);
  return {
    angle: lerp(walking ? 0.85 : 1, -0.65, graze),
    length: lerp(0.23, 0.27, graze),
    pitch: lerp(walking ? 0.4 : 0.3, 1.25, graze) + Math.sin(time * 9) * 0.05 * graze,
    ear: -0.15 - flick * 0.5,
    farEar: -0.3 + Math.sin(time * 0.8) * 0.12,
    flag: 0
  };
}

// Body: deep chest, tucked belly, round haunch, white belly and a darker back.
function paintDeerBody(context, flag) {
  context.fillStyle = DEER.coat;
  context.beginPath();
  context.moveTo(-0.4, -0.5);
  context.bezierCurveTo(-0.38, -0.6, -0.15, -0.62, 0.02, -0.6);
  context.bezierCurveTo(0.16, -0.59, 0.3, -0.57, 0.31, -0.46);
  context.bezierCurveTo(0.31, -0.36, 0.2, -0.3, 0.06, -0.31);
  context.bezierCurveTo(-0.08, -0.33, -0.18, -0.36, -0.28, -0.35);
  context.bezierCurveTo(-0.4, -0.35, -0.44, -0.42, -0.4, -0.5);
  context.fill();
  context.save();
  context.clip();
  patch(context, DEER.white, -0.04, -0.3, 0.34, 0.07);
  patch(context, DEER.shade, -0.04, -0.63, 0.42, 0.07);
  patch(context, "#a96839", -0.27, -0.43, 0.13, 0.12);
  if (flag) patch(context, DEER.white, -0.4, -0.45, 0.06, 0.1);
  context.restore();
}

// The tail: brown on top and hanging down, with a white fringe.
function paintHangingTail(context, time) {
  context.rotate(0.3 + Math.sin(time * 2.4) * 0.05);
  context.fillStyle = DEER.white;
  drop(context, 0.05, 0.18);
  context.fillStyle = DEER.dark;
  drop(context, 0.04, 0.17);
}

// The famous flag: tail straight up and back, a big fan showing its bright white underside, with a soft edge so the white stands out.
function paintFlag(context, time) {
  context.rotate(Math.PI - 0.22 + Math.sin(time * 5) * 0.03);
  for (const [color, grow] of [["#dfd4c0", 1.08], ["#fffdf8", 1]]) {
    context.save();
    context.scale(grow, grow);
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(-0.03, 0);
    context.bezierCurveTo(-0.06, 0.09, -0.115, 0.18, -0.095, 0.3);
    context.bezierCurveTo(-0.08, 0.37, 0.08, 0.37, 0.095, 0.3);
    context.bezierCurveTo(0.115, 0.18, 0.06, 0.09, 0.03, 0);
    context.fill();
    context.restore();
  }
}

// An antler seen from the side, `dx` along the head.
function paintAntler(context, color, dx) {
  context.save();
  context.translate(dx, 0);
  context.strokeStyle = color;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 0.026;
  for (const [from, x, y] of ANTLER_TINES) {
    context.beginPath();
    context.moveTo(...ANTLER_BEAM[from]);
    context.lineTo(x, y);
    context.stroke();
  }
  context.lineWidth = 0.034;
  context.beginPath();
  context.moveTo(...ANTLER_BEAM[0]);
  for (let i = 1; i < ANTLER_BEAM.length - 1; i++) {
    const [x, y] = ANTLER_BEAM[i], [nx, ny] = ANTLER_BEAM[i + 1];
    context.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
  }
  context.lineTo(...ANTLER_BEAM[ANTLER_BEAM.length - 1]);
  context.stroke();
  context.restore();
}

// Head with its white eye ring, white band behind the black nose, big ears and antlers.
function paintDeerHead(context, pivot, pose, open) {
  context.save();
  context.translate(...pivot);
  context.rotate(pose.pitch);
  context.scale(1.1, 1.1);
  paintAntler(context, DEER.antlerFar, -0.04);
  ear(context, -0.05, -0.055, pose.farEar - pose.pitch, 0.17, 0.05, DEER.dark, "#d9b9a0");
  context.fillStyle = DEER.coat;
  context.beginPath();
  context.moveTo(-0.04, -0.03);
  context.bezierCurveTo(0.02, -0.095, 0.12, -0.085, 0.27, -0.03);
  context.quadraticCurveTo(0.31, 0, 0.28, 0.035);
  context.bezierCurveTo(0.2, 0.06, 0.12, 0.1, 0.04, 0.09);
  context.bezierCurveTo(-0.04, 0.085, -0.07, 0.02, -0.04, -0.03);
  context.fill();
  context.save();
  context.clip();
  patch(context, DEER.shade, 0.04, -0.075, 0.09, 0.03);
  patch(context, DEER.white, 0.17, 0.095, 0.14, 0.035);
  patch(context, DEER.white, 0.235, 0, 0.02, 0.12);
  patch(context, DEER.white, 0.105, -0.012, 0.046, 0.038);
  context.restore();
  patch(context, DEER.nose, 0.285, -0.004, 0.022, 0.019);
  eye(context, 0.105, -0.012, 0.03, open, "#2a170e");
  paintAntler(context, DEER.antler, 0);
  ear(context, -0.01, -0.065, pose.ear - pose.pitch, 0.19, 0.055, DEER.coat, "#e6cbb5");
  context.restore();
}

function paintDeer(context, size, time, state = {}) {
  const walking = !!state.walking, pose = deerPose(time, walking, !!state.alert);
  const cycle = time * DEER_LEGS.speed, bob = bounce(cycle, walking, 0.012);
  const base = [0.17, -0.52 + bob];
  const pivot = neckPivot(base, pose);
  context.save();
  context.scale(size, size);
  paintLegs(context, DEER_LEGS, cycle, walking, true, bob);
  paintNeck(context, base, pivot, [0.2, 0.1], DEER.coat, { color: DEER.white, width: 0.1 });
  context.save();
  context.translate(0, bob);
  paintDeerBody(context, pose.flag);
  context.save();
  context.translate(-0.39, -0.51);
  if (pose.flag) paintFlag(context, time);
  else paintHangingTail(context, time);
  context.restore();
  context.restore();
  paintDeerHead(context, pivot, pose, blinkOpen(time, 0));
  paintLegs(context, DEER_LEGS, cycle, walking, false, bob);
  context.restore();
}

// ---- Coyote ----

const COYOTE = { coat: "#ad9b82", saddle: "#72695b", cream: "#eadfc8", rust: "#c0773a", tail: "#9b8c78", black: "#26201d" };
const COYOTE_FRONT = [0.23, 0.23], COYOTE_HIND = [0.25, 0.25];
const COYOTE_LEGS = {
  stride: 0.08, lift: 0.07, speed: 2,
  near: { color: "#c27a3c", top: 0.068, bottom: 0.034, tip: "#8a4f26", tipLength: 0.04 },
  far: { color: "#9a5c2b", top: 0.068, bottom: 0.034, tip: "#6f3e1e", tipLength: 0.04 },
  legs: [
    [0.25, -0.47, 0.27, COYOTE_FRONT, 1, 0, false], [-0.25, -0.48, -0.25, COYOTE_HIND, -1, 0.5, false],
    [0.18, -0.47, 0.19, COYOTE_FRONT, 1, 0.5, true], [-0.32, -0.48, -0.32, COYOTE_HIND, -1, 0, true]
  ]
};

// Head and tail: a low curious walk, a dip to sniff the ground now and then, or head up and listening.
function coyotePose(time, walking, alert) {
  if (alert) return { angle: 1, length: 0.25, pitch: 0.06, ear: 0.3, farEar: 0.22, tail: 0.3 };
  const sniff = walking ? 0 : pulse(time, 9, 2.5, 0.7, 2.4);
  return {
    angle: lerp(walking ? 0.3 : 0.55, -0.45, sniff),
    length: lerp(0.22, 0.25, sniff),
    pitch: lerp(0.3, 0.95, sniff) + Math.sin(time * 16) * 0.05 * sniff,
    ear: 0.05 - pulse(time, 4.3, 1.1, 0.05, 0.03) * 0.4,
    farEar: -0.05 - pulse(time, 5.9, 2, 0.05, 0.03) * 0.4,
    tail: walking ? 0.85 + Math.sin(time * 4) * 0.08 : 0.45 + Math.sin(time * 1.5) * 0.12
  };
}

// Lean body with a narrow waist, a dark saddle on the back and a cream chest and belly.
function paintCoyoteBody(context) {
  context.fillStyle = COYOTE.coat;
  context.beginPath();
  context.moveTo(-0.35, -0.56);
  context.bezierCurveTo(-0.26, -0.65, -0.04, -0.66, 0.12, -0.64);
  context.bezierCurveTo(0.26, -0.63, 0.34, -0.58, 0.34, -0.48);
  context.bezierCurveTo(0.34, -0.38, 0.26, -0.34, 0.16, -0.35);
  context.bezierCurveTo(0.02, -0.37, -0.06, -0.43, -0.16, -0.43);
  context.bezierCurveTo(-0.28, -0.43, -0.39, -0.44, -0.39, -0.52);
  context.bezierCurveTo(-0.39, -0.55, -0.37, -0.56, -0.35, -0.56);
  context.fill();
  context.save();
  context.clip();
  patch(context, COYOTE.saddle, -0.04, -0.67, 0.32, 0.07);
  patch(context, COYOTE.cream, 0.02, -0.38, 0.26, 0.06);
  patch(context, COYOTE.cream, 0.32, -0.44, 0.07, 0.1);
  context.restore();
}

// The bushy tail hangs low and sways; its last stretch is black.
function paintCoyoteTail(context, angle) {
  context.save();
  context.translate(-0.36, -0.55);
  context.rotate(angle);
  context.fillStyle = COYOTE.tail;
  context.beginPath();
  context.moveTo(-0.035, 0);
  context.bezierCurveTo(-0.1, 0.12, -0.1, 0.3, -0.02, 0.46);
  context.bezierCurveTo(0.1, 0.3, 0.1, 0.12, 0.035, 0);
  context.fill();
  context.save();
  context.clip();
  patch(context, COYOTE.saddle, -0.01, 0.12, 0.03, 0.12);
  patch(context, COYOTE.black, 0, 0.47, 0.14, 0.15);
  context.restore();
  context.restore();
}

// Long narrow muzzle, cream cheek ruff, rusty muzzle sides, yellow eyes and big pointed ears.
function paintCoyoteHead(context, pivot, pose, open) {
  context.save();
  context.translate(...pivot);
  context.rotate(pose.pitch);
  context.scale(1.15, 1.15);
  ear(context, -0.01, -0.085, pose.farEar - pose.pitch, 0.2, 0.068, "#8f5a30", COYOTE.cream);
  context.fillStyle = COYOTE.coat;
  context.beginPath();
  context.moveTo(-0.06, -0.01);
  context.bezierCurveTo(-0.05, -0.095, 0.06, -0.11, 0.13, -0.07);
  context.bezierCurveTo(0.16, -0.05, 0.2, -0.04, 0.25, -0.035);
  context.lineTo(0.31, -0.03);
  context.quadraticCurveTo(0.345, -0.01, 0.33, 0.02);
  context.bezierCurveTo(0.27, 0.035, 0.2, 0.04, 0.15, 0.055);
  context.bezierCurveTo(0.12, 0.11, 0.02, 0.125, -0.04, 0.09);
  context.bezierCurveTo(-0.08, 0.06, -0.08, 0.02, -0.06, -0.01);
  context.fill();
  context.save();
  context.clip();
  patch(context, "#7a6f60", 0.12, -0.09, 0.17, 0.035);
  patch(context, COYOTE.rust, 0.23, 0.0, 0.12, 0.04);
  patch(context, COYOTE.cream, 0.04, 0.1, 0.11, 0.05);
  patch(context, COYOTE.cream, 0.22, 0.05, 0.1, 0.022);
  context.restore();
  patch(context, COYOTE.black, 0.328, -0.005, 0.02, 0.017);
  patch(context, "#3c2f25", 0.115, -0.035, 0.037, 0.03);
  eye(context, 0.118, -0.035, 0.03, open, "#f0c030");
  ear(context, 0.03, -0.09, pose.ear - pose.pitch, 0.2, 0.07, COYOTE.rust, COYOTE.cream);
  context.restore();
}

function paintCoyote(context, size, time, state = {}) {
  const walking = !!state.walking, pose = coyotePose(time, walking, !!state.alert);
  const cycle = time * COYOTE_LEGS.speed, bob = bounce(cycle, walking, 0.015);
  const base = [0.26, -0.46 + bob];
  const pivot = neckPivot(base, pose);
  context.save();
  context.scale(size, size);
  paintLegs(context, COYOTE_LEGS, cycle, walking, true, bob);
  paintNeck(context, base, pivot, [0.26, 0.17], COYOTE.coat, { color: COYOTE.cream, width: 0.09 });
  context.save();
  context.translate(0, bob);
  paintCoyoteTail(context, pose.tail);
  paintCoyoteBody(context);
  context.restore();
  paintCoyoteHead(context, pivot, pose, blinkOpen(time, 1.3));
  paintLegs(context, COYOTE_LEGS, cycle, walking, false, bob);
  context.restore();
}

// ---- Feral hog ----

const HOG = {
  coat: "#4b3a30", shade: "#2c221e", face: "#66503f", bristle: "#1e1613", dirt: "#6c4b2c", disk: "#c4a8a0", tusk: "#f4efe2"
};
const HOG_FRONT = [0.19, 0.19], HOG_HIND = [0.19, 0.19];
const HOG_LEGS = {
  stride: 0.07, lift: 0.05, speed: 2.2,
  near: { color: "#44342b", top: 0.09, bottom: 0.055, tip: "#16100e", tipLength: 0.04 },
  far: { color: "#241c19", top: 0.09, bottom: 0.055, tip: "#100b0a", tipLength: 0.04 },
  legs: [
    [0.32, -0.36, 0.34, HOG_FRONT, 1, 0, false], [-0.46, -0.36, -0.47, HOG_HIND, -1, 0.5, false],
    [0.2, -0.36, 0.22, HOG_FRONT, 1, 0.5, true], [-0.58, -0.36, -0.6, HOG_HIND, -1, 0, true]
  ]
};
// The back line, as bezier curves, shared by the body outline and the bristle ridge that grows along it.
const HOG_BACK = [
  [[-0.72, -0.5], [-0.72, -0.6], [-0.5, -0.68], [-0.3, -0.73]],
  [[-0.3, -0.73], [-0.1, -0.79], [0.04, -0.9], [0.22, -0.9]],
  [[0.22, -0.9], [0.4, -0.9], [0.5, -0.76], [0.49, -0.58]]
];

// Head and bristles: snout low and sniffing, trotting, head up with bristles raised, or rooting in the dirt.
function hogPose(time, walking, alert) {
  if (alert) return { angle: 0.35, length: 0.14, pitch: -0.02, ear: 0.3, bristle: 0.085, root: 0 };
  const root = walking ? 0 : pulse(time, 7, 1.5, 0.7, 3.5);
  return {
    angle: lerp(walking ? 0.05 : -0.05, -0.8, root),
    length: 0.2,
    pitch: lerp(walking ? 0.45 : 0.35, 1.2, root) + Math.sin(time * 7) * 0.08 * root,
    ear: 0.15 - pulse(time, 3.9, 0.8, 0.05, 0.03) * 0.4,
    bristle: 0.045,
    root
  };
}

// A point `t` of the way along a bezier curve.
function along([p0, p1, p2, p3], t) {
  const u = 1 - t;
  const at = axis => u ** 3 * p0[axis] + 3 * u * u * t * p1[axis] + 3 * u * t * t * p2[axis] + t ** 3 * p3[axis];
  return [at(0), at(1)];
}

// The bristly mane: thin spikes along the spine, each a little different in length and lean.
function paintMane(context, bristle) {
  context.fillStyle = HOG.bristle;
  let spike = 0;
  for (const [curve, from, to] of [[HOG_BACK[0], 0.3, 1], [HOG_BACK[1], 0, 1], [HOG_BACK[2], 0, 0.5]]) {
    for (let t = from; t <= to + 0.001; t += 0.07) {
      const [x, y] = along(curve, t), wobble = Math.sin(spike++ * 2.1);
      const length = bristle * (0.85 + 0.35 * wobble * wobble), lean = -length * (0.25 + 0.3 * Math.sin(spike * 1.7));
      context.beginPath();
      context.moveTo(x - 0.02, y + 0.03);
      context.lineTo(x + lean, y - length);
      context.lineTo(x + 0.02, y + 0.03);
      context.fill();
    }
  }
}

// Body: a deep chest and humped shoulders tapering to narrower hams, with a darker back.
function paintHogBody(context) {
  context.fillStyle = HOG.coat;
  context.beginPath();
  context.moveTo(...HOG_BACK[0][0]);
  for (const [, c1, c2, end] of HOG_BACK) context.bezierCurveTo(...c1, ...c2, ...end);
  context.bezierCurveTo(0.48, -0.42, 0.4, -0.31, 0.24, -0.3);
  context.bezierCurveTo(0.05, -0.28, -0.15, -0.29, -0.35, -0.33);
  context.bezierCurveTo(-0.55, -0.35, -0.72, -0.37, -0.72, -0.5);
  context.fill();
  context.save();
  context.clip();
  patch(context, HOG.shade, -0.12, -0.84, 0.6, 0.12);
  patch(context, "#5a463c", -0.1, -0.35, 0.5, 0.09);
  context.restore();
}

// A thin straight tail with a dark tuft on the end.
function paintHogTail(context, time, walking) {
  context.save();
  context.translate(-0.71, -0.56);
  context.rotate(0.35 + Math.sin(time * (walking ? 6 : 2.5)) * 0.15);
  context.strokeStyle = HOG.shade;
  context.lineWidth = 0.022;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, 0.17);
  context.stroke();
  context.fillStyle = HOG.bristle;
  context.translate(0, 0.15);
  drop(context, 0.05, 0.1);
  context.restore();
}

// Long wedge head ending in a flat round disk nose, small curved tusks, small eye and small pointed ears.
function paintHogHead(context, pivot, pose, open) {
  context.save();
  context.translate(...pivot);
  context.rotate(pose.pitch);
  ear(context, 0.01, -0.11, pose.ear - pose.pitch - 0.1, 0.12, 0.06, HOG.shade, "#8b6a60");
  context.fillStyle = HOG.face;
  context.beginPath();
  context.moveTo(-0.06, -0.08);
  context.bezierCurveTo(0.05, -0.15, 0.2, -0.11, 0.32, -0.06);
  context.lineTo(0.43, -0.045);
  context.quadraticCurveTo(0.455, 0, 0.43, 0.05);
  context.bezierCurveTo(0.36, 0.075, 0.26, 0.1, 0.16, 0.14);
  context.bezierCurveTo(0.08, 0.17, -0.04, 0.15, -0.08, 0.06);
  context.bezierCurveTo(-0.1, 0, -0.09, -0.05, -0.06, -0.08);
  context.fill();
  context.save();
  context.clip();
  patch(context, HOG.coat, -0.02, -0.03, 0.12, 0.13);
  patch(context, HOG.shade, 0.05, -0.12, 0.1, 0.04);
  context.restore();
  context.fillStyle = HOG.tusk;
  context.beginPath();
  context.moveTo(0.27, 0.085);
  context.quadraticCurveTo(0.35, 0.05, 0.335, -0.03);
  context.quadraticCurveTo(0.3, 0.03, 0.24, 0.07);
  context.fill();
  patch(context, HOG.disk, 0.44, 0, 0.032, 0.062);
  patch(context, HOG.shade, 0.45, -0.014, 0.008, 0.012);
  patch(context, HOG.shade, 0.45, 0.018, 0.008, 0.012);
  eye(context, 0.15, -0.045, 0.03, open, "#3a2a20");
  ear(context, 0.04, -0.12, pose.ear - pose.pitch, 0.12, 0.06, HOG.coat, "#8b6a60");
  context.restore();
}

// Specks of dirt thrown up by the snout while it roots.
function paintDirt(context, nose, time, amount) {
  if (amount < 0.6) return;
  context.save();
  context.fillStyle = HOG.dirt;
  for (let i = 0; i < 5; i++) {
    const u = (time * 1.6 + i * 0.2) % 1, reach = 0.05 + 0.04 * (i % 3);
    context.globalAlpha = 1 - u * u;
    context.beginPath();
    context.arc(nose[0] + 0.03 + reach * 2 * u, nose[1] - (0.3 * u - 0.32 * u * u) * (0.6 + 0.15 * (i % 3)), 0.02 * (1 - 0.4 * u), 0, TAU);
    context.fill();
  }
  context.restore();
}

function paintHog(context, size, time, state = {}) {
  const walking = !!state.walking, pose = hogPose(time, walking, !!state.alert);
  const cycle = time * HOG_LEGS.speed, bob = bounce(cycle, walking, 0.012);
  const base = [0.28, -0.62 + bob];
  const pivot = neckPivot(base, pose);
  const nose = [pivot[0] + Math.cos(pose.pitch) * 0.44, pivot[1] + Math.sin(pose.pitch) * 0.44];
  context.save();
  context.scale(size, size);
  paintLegs(context, HOG_LEGS, cycle, walking, true, bob);
  paintNeck(context, base, pivot, [0.34, 0.2], HOG.coat);
  context.save();
  context.translate(0, bob);
  paintHogTail(context, time, walking);
  paintHogBody(context);
  paintMane(context, pose.bristle);
  context.restore();
  paintHogHead(context, pivot, pose, blinkOpen(time, 2.4));
  paintLegs(context, HOG_LEGS, cycle, walking, false, bob);
  paintDirt(context, nose, time, pose.root);
  context.restore();
}

export const MAMMAL_PAINTERS = { deer: paintDeer, coyote: paintCoyote, hog: paintHog };

// Measured over every pose and moment with the extents check, rounded outward.
export const MAMMAL_BOXES = {
  deer: { left: -0.58, right: 0.76, top: -1 },
  coyote: { left: -0.75, right: 0.86, top: -1 },
  hog: { left: -0.85, right: 1.06, top: -1 }
};
