// Three wading birds for the bayou trail: roseate spoonbill, white ibis and great blue heron.
// Each painter draws its bird facing right with its feet on (0, 0); y goes up as negative.
// Drawing is in units of size (the bird is 1 unit tall), so every number is a fraction of its height.
// BIRD_BOXES is where the drawings reach, in units of size: x from left to right, y from top to 0.

const TAU = Math.PI * 2;
const lerp = (from, to, amount) => from + (to - from) * amount;
const lerpPoint = (from, to, amount) => [lerp(from[0], to[0], amount), lerp(from[1], to[1], amount)];
const plus = (point, offset) => [point[0] + offset[0], point[1] + offset[1]];
const ease = amount => amount * amount * (3 - 2 * amount);

// 0 -> 1 -> 0 once per period: eases in for `ramp` seconds at `start`, holds for `hold`, eases out.
function pulse(time, period, start, hold, ramp) {
  const since = (time % period) - start;
  const length = hold + 2 * ramp;
  if (since < 0 || since > length) return 0;
  return ease(Math.min(1, since / ramp, (length - since) / ramp));
}

// How open the eye is, 1 to 0: it shuts for about 0.12 s at the end of every period.
function eyeOpen(time, period) {
  const shut = (time % period) - (period - 0.12);
  return shut < 0 ? 1 : 1 - Math.sin((shut / 0.12) * Math.PI);
}

function fillEllipse(context, x, y, rx, ry, angle, color) {
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, rx, ry, angle, 0, TAU);
  context.fill();
}

// A big friendly eye: coloured iris, dark pupil, small white glint. Blinking squashes it to a lid line.
function paintEye(context, x, y, radius, iris, open) {
  if (open < 0.3) {
    context.strokeStyle = "#2a2230";
    context.lineWidth = radius * 0.45;
    context.beginPath();
    context.moveTo(x - radius * 0.85, y);
    context.lineTo(x + radius * 0.85, y);
    context.stroke();
    return;
  }
  context.save();
  context.translate(x, y);
  context.scale(1, open);
  fillEllipse(context, 0, 0, radius, radius, 0, iris);
  fillEllipse(context, radius * 0.12, 0, radius * 0.62, radius * 0.62, 0, "#1d1824");
  fillEllipse(context, radius * 0.35, -radius * 0.3, radius * 0.22, radius * 0.22, 0, "#ffffff");
  context.restore();
}

// Sets up the drawing: unit scale, round ends. Callers restore when done.
function begin(context, size) {
  context.save();
  context.scale(size, size);
  context.lineCap = "round";
  context.lineJoin = "round";
}

// ---- Necks and heads -----------------------------------------------------------------------

function bezier([a, b, c, d], t) {
  const k = 1 - t;
  return [0, 1].map(axis => k * k * k * a[axis] + 3 * k * k * t * b[axis] + 3 * k * t * t * c[axis] + t * t * t * d[axis]);
}

// A smooth tube along a bezier curve that tapers from radius r0 to r1: the neck.
function paintTube(context, curve, r0, r1, color) {
  context.fillStyle = color;
  for (let step = 0; step <= 28; step++) {
    const [x, y] = bezier(curve, step / 28);
    context.beginPath();
    context.arc(x, y, lerp(r0, r1, step / 28), 0, TAU);
    context.fill();
  }
}

// Neck curve from the shoulder to the head: it leaves the shoulder by `leave` and arrives at the head from `arrive`.
const neckCurve = (base, pose) => [base, plus(base, pose.leave), plus(pose.head, pose.arrive), pose.head];

// Halfway between two head poses: { head, leave, arrive, angle }.
const lerpPose = (a, b, amount) => ({
  head: lerpPoint(a.head, b.head, amount),
  leave: lerpPoint(a.leave, b.leave, amount),
  arrive: lerpPoint(a.arrive, b.arrive, amount),
  angle: lerp(a.angle, b.angle, amount)
});

// Where the head sits so the bill tip (given in head space) lands on `tip` when the head is turned by `angle`.
function headForTip(tip, tipInHead, angle) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return [tip[0] - (tipInHead[0] * cos - tipInHead[1] * sin), tip[1] - (tipInHead[0] * sin + tipInHead[1] * cos)];
}

// ---- Legs ----------------------------------------------------------------------------------

// Middle joint of a two-part leg. It bends backwards, like a bird's real "reverse knee".
function legJoint(hip, foot, upper, lower) {
  const dx = foot[0] - hip[0], dy = foot[1] - hip[1];
  const reach = Math.hypot(dx, dy);
  const along = (upper * upper - lower * lower + reach * reach) / (2 * reach);
  const out = Math.sqrt(Math.max(0, upper * upper - along * along));
  return [hip[0] + (dx / reach) * along - (dy / reach) * out, hip[1] + (dy / reach) * along + (dx / reach) * out];
}

// Toes: two reaching forward, one small one behind. They droop while the foot is lifted.
function paintToes(context, sole, width, length, lift, color) {
  const droop = Math.min(0.8, Math.asin(Math.min(1, lift / length)));
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  for (const [reach, tilt] of [[1, 0], [0.8, -0.35], [-0.4, 0]]) {
    const angle = droop + tilt;
    context.moveTo(sole[0], sole[1]);
    context.lineTo(sole[0] + Math.cos(angle) * reach * length, sole[1] + Math.sin(angle) * reach * length);
  }
  context.stroke();
}

// One leg from the hip down to a foot (x ahead of the hip, lift off the ground).
function paintLeg(context, hip, foot, leg, color) {
  const toe = leg.width * 0.7;
  const sole = [hip[0] + foot.x, -toe / 2 - foot.lift];
  const joint = legJoint(hip, sole, leg.upper, leg.lower);
  context.strokeStyle = color;
  context.lineWidth = leg.width;
  context.beginPath();
  context.moveTo(hip[0], hip[1]);
  context.lineTo(joint[0], joint[1]);
  context.lineTo(sole[0], sole[1] - (leg.width - toe) / 2);
  context.stroke();
  fillEllipse(context, joint[0], joint[1], leg.width * 0.7, leg.width * 0.7, 0, color);
  paintToes(context, sole, toe, leg.toe, foot.lift, color);
}

// The far leg first, in a darker colour, then the near one.
function paintLegs(context, hip, feet, leg) {
  paintLeg(context, hip, feet.far, leg, leg.far);
  paintLeg(context, hip, feet.near, leg, leg.color);
}

// A foot's place in a step: it slides back on the ground, then swings forward through the air.
function footAt(phase, stride, lift) {
  const angle = phase * TAU;
  return { x: stride * Math.cos(angle), lift: lift * Math.max(0, -Math.sin(angle)) };
}

// Both feet now. Standing, they rest a little apart; walking, they trade places half a step apart.
function feetPose(time, state, gait) {
  if (!state.walking) return { near: { x: gait.apart, lift: 0 }, far: { x: -gait.apart, lift: 0 } };
  const phase = time / gait.period;
  return { near: footAt(phase, gait.stride, gait.lift), far: footAt(phase + 0.5, gait.stride, gait.lift) };
}

// The body rises and falls a touch with every step.
const bodyBob = (time, state, gait) => (state.walking ? gait.bob * Math.sin((time / gait.period) * TAU * 2) : 0);

// The head pumps forward and back a little with every step.
const headPump = (time, state, gait, amount) => (state.walking ? amount * Math.sin((time / gait.period) * TAU) : 0);

// Legs as thick as the bird needs, but never thinner than a couple of pixels.
const legFor = (leg, size) => ({ ...leg, width: Math.max(leg.width, 2.2 / size) });

// ---- Great blue heron ----------------------------------------------------------------------

const HERON = {
  body: "#8aa0b5", wing: "#6e869d", quill: "#4e6378", neck: "#9db0c2", plume: "#d6dee6",
  face: "#f7f5ee", black: "#23232b", bill: "#e9ae30", billShade: "#cf8d20", thigh: "#b8683d", eye: "#f4d23c"
};
const HERON_LEG = { upper: 0.2, lower: 0.235, width: 0.03, toe: 0.1, color: "#57524a", far: "#3f3b35" };
const HERON_GAIT = { period: 1.8, stride: 0.07, lift: 0.1, apart: 0.035, bob: 0.008 };
const HERON_HIP = [0.02, -0.41];
const HERON_SHOULDER = [0.19, -0.6];
const HERON_STAND = { head: [0.3, -0.93], leave: [0.3, -0.03], arrive: [-0.3, 0.13], angle: 0.14 };
const HERON_TALL = { head: [0.27, -0.94], leave: [0.04, -0.12], arrive: [0, 0.14], angle: -0.03 };

// Mostly still: a slow neck sway, and every so often a quick stretch tall. Alert holds the stretch.
function heronPose(time, state) {
  const stretch = state.alert ? 1 : pulse(time, 11, 6.5, 0.7, 0.3);
  const sway = Math.sin(time * 0.9) * (1 - stretch);
  const pose = lerpPose(HERON_STAND, HERON_TALL, stretch);
  pose.head = plus(pose.head, [sway * 0.02 + headPump(time, state, HERON_GAIT, 0.012), 0]);
  pose.arrive = plus(pose.arrive, [sway * 0.05, 0]);
  pose.angle += sway * 0.03;
  return pose;
}

// Body: a long blue-gray oval tipped tail-down, with a darker folded wing whose feather tips reach back.
function paintHeronBody(context) {
  fillEllipse(context, -0.03, -0.54, 0.3, 0.125, -0.3, HERON.body);
  context.fillStyle = HERON.wing;
  context.beginPath();
  context.moveTo(0.16, -0.62);
  context.quadraticCurveTo(-0.08, -0.7, -0.36, -0.54);
  context.lineTo(-0.45, -0.42);
  context.quadraticCurveTo(-0.12, -0.45, 0.12, -0.52);
  context.closePath();
  context.fill();
  context.fillStyle = HERON.quill;
  context.beginPath();
  context.moveTo(-0.45, -0.42);
  context.lineTo(-0.3, -0.52);
  context.lineTo(-0.1, -0.52);
  context.quadraticCurveTo(-0.12, -0.46, -0.2, -0.45);
  context.closePath();
  context.fill();
}

// Shaggy pale plumes hanging from the lower neck over the chest, swaying a little.
function paintHeronPlumes(context, time, stretch) {
  context.fillStyle = HERON.plume;
  for (let plume = 0; plume < 6; plume++) {
    const x = 0.13 + plume * 0.035;
    const top = -0.64 + plume * 0.012;
    const length = (0.17 + (plume % 2) * 0.08) * (1 - 0.3 * stretch);
    const sway = Math.sin(time * 1.3 + plume * 1.1) * 0.012;
    context.beginPath();
    context.moveTo(x, top);
    context.quadraticCurveTo(x + 0.05 + sway, top + length * 0.55, x - 0.03 + sway * 2, top + length);
    context.quadraticCurveTo(x - 0.04 + sway, top + length * 0.5, x, top);
    context.fill();
  }
}

// Head: white face and crown, a black stripe above the eye streaming back into a thin plume, a yellow dagger bill.
function paintHeronHead(context, pose, size, time) {
  const flutter = Math.sin(time * 1.7) * 0.012;
  context.save();
  context.translate(pose.head[0], pose.head[1]);
  context.rotate(pose.angle);
  context.fillStyle = HERON.bill;
  context.beginPath();
  context.moveTo(0.04, -0.03);
  context.lineTo(0.27, 0.002);
  context.lineTo(0.04, 0.032);
  context.closePath();
  context.fill();
  context.fillStyle = HERON.billShade;
  context.beginPath();
  context.moveTo(0.04, 0.004);
  context.lineTo(0.27, 0.002);
  context.lineTo(0.04, 0.032);
  context.closePath();
  context.fill();
  fillEllipse(context, 0, 0, 0.078, 0.05, 0, HERON.face);
  context.fillStyle = HERON.black;
  context.beginPath();
  context.moveTo(0.05, -0.034);
  context.quadraticCurveTo(0, -0.054, -0.07, -0.038);
  context.quadraticCurveTo(-0.16, -0.03 + flutter, -0.27, 0.03 + flutter * 2);
  context.quadraticCurveTo(-0.16, -0.004 + flutter, -0.07, -0.016);
  context.quadraticCurveTo(0, -0.02, 0.05, -0.034);
  context.fill();
  paintEye(context, 0.03, -0.004, Math.max(0.03, 2.2 / size), HERON.eye, eyeOpen(time, 5.1));
  context.restore();
}

function paintHeron(context, size, time, state = {}) {
  const pose = heronPose(time, state);
  const bob = bodyBob(time, state, HERON_GAIT);
  begin(context, size);
  paintLegs(context, plus(HERON_HIP, [0, bob]), feetPose(time, state, HERON_GAIT), legFor(HERON_LEG, size));
  context.translate(0, bob);
  paintHeronBody(context);
  paintTube(context, neckCurve(HERON_SHOULDER, pose), 0.052, 0.032, HERON.neck);
  fillEllipse(context, 0.03, -0.46, 0.052, 0.055, 0, HERON.thigh);
  fillEllipse(context, 0.03, -0.4, 0.034, 0.05, 0, HERON.thigh);
  paintHeronPlumes(context, time, state.alert ? 1 : 0);
  paintHeronHead(context, pose, size, time);
  context.restore();
}

// ---- Roseate spoonbill ---------------------------------------------------------------------

const SPOONBILL = {
  body: "#f79cbb", wing: "#ee7ba3", quill: "#e0608f", shoulder: "#d42b4f", tail: "#f5ae72",
  neck: "#fcf8f3", skin: "#cfca8f", bill: "#93a596", spoon: "#b3c4b6", eye: "#d6222e"
};
const SPOONBILL_LEG = { upper: 0.165, lower: 0.19, width: 0.028, toe: 0.09, color: "#d95a6c", far: "#b44356" };
const SPOONBILL_GAIT = { period: 1.5, stride: 0.06, lift: 0.07, apart: 0.03, bob: 0.008 };
const SPOONBILL_HIP = [0.02, -0.34];
const SPOONBILL_SHOULDER = [0.2, -0.54];
const SPOONBILL_STAND = { head: [0.3, -0.85], leave: [0.22, -0.05], arrive: [-0.2, 0.1], angle: 0.55 };
const SPOONBILL_TALL = { head: [0.27, -0.94], leave: [0.04, -0.12], arrive: [-0.02, 0.13], angle: 0.2 };
const SPOON_TIP = [0.4, 0];

// Every few seconds the head swings down and the spoon sweeps side to side in the water, then lifts.
function spoonbillPose(time, state) {
  const dip = state.alert || state.walking ? 0 : pulse(time, 8, 3.2, 2.2, 0.7);
  const sweep = Math.sin(time * 3.4);
  const pose = lerpPose(SPOONBILL_STAND, SPOONBILL_TALL, state.alert ? 1 : 0);
  const angle = 1.2;
  const low = { head: headForTip([0.62 + sweep * 0.07, -0.02], SPOON_TIP, angle), leave: [0.1, 0.06], arrive: [-0.08, -0.1], angle };
  const posed = lerpPose(pose, low, dip);
  posed.head = plus(posed.head, [headPump(time, state, SPOONBILL_GAIT, 0.012), 0]);
  return posed;
}

// Body: a plump pink oval, a darker folded wing with a deep carmine shoulder, and a small buff tail.
function paintSpoonbillBody(context) {
  context.fillStyle = SPOONBILL.tail;
  context.beginPath();
  context.moveTo(-0.25, -0.52);
  context.lineTo(-0.44, -0.37);
  context.lineTo(-0.22, -0.39);
  context.closePath();
  context.fill();
  fillEllipse(context, -0.03, -0.47, 0.29, 0.15, -0.12, SPOONBILL.body);
  context.fillStyle = SPOONBILL.wing;
  context.beginPath();
  context.moveTo(0.15, -0.57);
  context.quadraticCurveTo(-0.1, -0.65, -0.3, -0.49);
  context.lineTo(-0.4, -0.38);
  context.quadraticCurveTo(-0.1, -0.37, 0.12, -0.43);
  context.closePath();
  context.fill();
  context.fillStyle = SPOONBILL.quill;
  context.beginPath();
  context.moveTo(-0.4, -0.38);
  context.lineTo(-0.27, -0.47);
  context.lineTo(-0.08, -0.47);
  context.quadraticCurveTo(-0.1, -0.4, -0.2, -0.385);
  context.closePath();
  context.fill();
  fillEllipse(context, 0.12, -0.52, 0.075, 0.045, -0.5, SPOONBILL.shoulder);
}

// The bill: a narrow shaft that widens into a big round flat spoon at the tip.
function paintSpoon(context) {
  context.fillStyle = SPOONBILL.bill;
  context.beginPath();
  context.moveTo(0.05, -0.036);
  context.lineTo(0.16, -0.028);
  context.bezierCurveTo(0.21, -0.025, 0.23, -0.072, 0.3, -0.072);
  context.bezierCurveTo(0.36, -0.072, 0.4, -0.04, 0.4, 0);
  context.bezierCurveTo(0.4, 0.04, 0.36, 0.072, 0.3, 0.072);
  context.bezierCurveTo(0.23, 0.072, 0.21, 0.025, 0.16, 0.028);
  context.lineTo(0.05, 0.036);
  context.closePath();
  context.fill();
  fillEllipse(context, 0.312, 0, 0.068, 0.046, 0, SPOONBILL.spoon);
}

// Head: bare greenish skin (no feathers) running into the bill, with a red eye.
function paintSpoonbillHead(context, pose, size, time) {
  context.save();
  context.translate(pose.head[0], pose.head[1]);
  context.rotate(pose.angle);
  paintSpoon(context);
  fillEllipse(context, 0, 0, 0.076, 0.058, 0, SPOONBILL.skin);
  fillEllipse(context, 0.05, 0.006, 0.05, 0.04, 0, SPOONBILL.skin);
  paintEye(context, 0.02, -0.012, Math.max(0.034, 2.4 / size), SPOONBILL.eye, eyeOpen(time, 3.7));
  context.restore();
}

function paintSpoonbill(context, size, time, state = {}) {
  const pose = spoonbillPose(time, state);
  const bob = bodyBob(time, state, SPOONBILL_GAIT);
  begin(context, size);
  paintLegs(context, plus(SPOONBILL_HIP, [0, bob]), feetPose(time, state, SPOONBILL_GAIT), legFor(SPOONBILL_LEG, size));
  context.translate(0, bob);
  paintSpoonbillBody(context);
  paintTube(context, neckCurve(SPOONBILL_SHOULDER, pose), 0.058, 0.04, SPOONBILL.neck);
  paintSpoonbillHead(context, pose, size, time);
  context.restore();
}

// ---- White ibis ----------------------------------------------------------------------------

const IBIS = {
  body: "#ffffff", shade: "#e1e7ee", wing: "#e8eef4", quill: "#d3dde8", tip: "#26262b", face: "#e64f64",
  bill: "#f26a3f", billTip: "#d5482e", eye: "#a9dcf0"
};
const IBIS_LEG = { upper: 0.14, lower: 0.17, width: 0.03, toe: 0.085, color: "#f06a7a", far: "#c95566" };
const IBIS_GAIT = { period: 0.55, stride: 0.05, lift: 0.045, apart: 0.025, bob: 0.01 };
const IBIS_HIP = [0.02, -0.3];
const IBIS_SHOULDER = [0.2, -0.58];
const IBIS_STAND = { head: [0.32, -0.85], leave: [0.22, -0.05], arrive: [-0.22, 0.1], angle: 0.3 };
const IBIS_TALL = { head: [0.3, -0.93], leave: [0.05, -0.12], arrive: [-0.02, 0.11], angle: 0.15 };
const IBIS_TIP = [0.335, 0.125];

// Now and then the ibis stabs its bill down at the ground a few times, like probing for crayfish.
function ibisPose(time, state) {
  const probe = state.alert || state.walking ? 0 : pulse(time, 6, 2, 2, 0.35) * (0.5 + 0.5 * Math.sin(time * 8));
  const pose = lerpPose(IBIS_STAND, IBIS_TALL, state.alert ? 1 : 0);
  const angle = 1.0;
  const low = { head: headForTip([0.62, -0.02], IBIS_TIP, angle), leave: [0.12, 0.06], arrive: [-0.1, -0.1], angle };
  const posed = lerpPose(pose, low, probe);
  posed.head = plus(posed.head, [headPump(time, state, IBIS_GAIT, 0.02), 0]);
  return posed;
}

// Body: a plump white oval with a soft shaded tummy, a pale wing, and black wingtips at the back.
function paintIbisBody(context) {
  for (const [x, y, angle] of [[-0.4, -0.46, 0.55], [-0.43, -0.41, 0.25], [-0.4, -0.36, -0.05]]) {
    fillEllipse(context, x, y, 0.085, 0.022, angle, IBIS.tip);
  }
  fillEllipse(context, -0.04, -0.46, 0.3, 0.2, -0.1, IBIS.shade);
  fillEllipse(context, -0.035, -0.485, 0.285, 0.18, -0.1, IBIS.body);
  context.fillStyle = IBIS.wing;
  context.beginPath();
  context.moveTo(0.14, -0.6);
  context.quadraticCurveTo(-0.12, -0.68, -0.32, -0.5);
  context.lineTo(-0.38, -0.42);
  context.quadraticCurveTo(-0.1, -0.38, 0.1, -0.46);
  context.closePath();
  context.fill();
  context.fillStyle = IBIS.quill;
  context.beginPath();
  context.moveTo(-0.38, -0.42);
  context.lineTo(-0.26, -0.49);
  context.lineTo(-0.06, -0.47);
  context.quadraticCurveTo(-0.1, -0.4, -0.2, -0.395);
  context.closePath();
  context.fill();
}

// Head: white crown, a bare pinkish-red face round a pale blue eye, and a long down-curved red-orange bill.
function paintIbisHead(context, pose, size, time) {
  context.save();
  context.translate(pose.head[0], pose.head[1]);
  context.rotate(pose.angle);
  context.fillStyle = IBIS.bill;
  context.beginPath();
  context.moveTo(0.05, -0.035);
  context.quadraticCurveTo(0.26, -0.06, 0.335, 0.125);
  context.quadraticCurveTo(0.22, 0.0, 0.05, 0.03);
  context.closePath();
  context.fill();
  context.fillStyle = IBIS.billTip;
  context.beginPath();
  context.moveTo(0.05, 0.004);
  context.quadraticCurveTo(0.23, -0.02, 0.335, 0.125);
  context.quadraticCurveTo(0.22, 0.0, 0.05, 0.03);
  context.closePath();
  context.fill();
  fillEllipse(context, 0, 0, 0.076, 0.066, 0, IBIS.body);
  fillEllipse(context, 0.03, 0.014, 0.062, 0.05, 0, IBIS.face);
  fillEllipse(context, 0.0, 0.05, 0.04, 0.03, 0, IBIS.face);
  paintEye(context, 0.024, -0.006, Math.max(0.034, 2.4 / size), IBIS.eye, eyeOpen(time, 4.3));
  context.restore();
}

function paintIbis(context, size, time, state = {}) {
  const pose = ibisPose(time, state);
  const bob = bodyBob(time, state, IBIS_GAIT);
  begin(context, size);
  paintLegs(context, plus(IBIS_HIP, [0, bob]), feetPose(time, state, IBIS_GAIT), legFor(IBIS_LEG, size));
  context.translate(0, bob);
  paintIbisBody(context);
  paintTube(context, neckCurve(IBIS_SHOULDER, pose), 0.065, 0.048, IBIS.body);
  paintIbisHead(context, pose, size, time);
  context.restore();
}

export const BIRD_PAINTERS = { spoonbill: paintSpoonbill, ibis: paintIbis, heron: paintHeron };
export const BIRD_BOXES = {
  spoonbill: { left: -0.45, right: 0.74, top: -1.01 },
  ibis: { left: -0.52, right: 0.69, top: -1.01 },
  heron: { left: -0.46, right: 0.61, top: -1.01 }
};
