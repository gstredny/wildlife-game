// The young explorer: a ranger hat, a green shirt, a backpack and a camera. Drawn facing right,
// boots on (0, 0); `size` is the explorer's height. state: { walking, snapping }.
const SKIN = "#e0a57c", SKIN_DARK = "#c98c63", HAIR = "#5a3a22", SHIRT = "#5f8d4e", SHIRT_DARK = "#4c7640";
const SHORTS = "#c9b08a", BOOT = "#5b3c25", HAT = "#d8b878", HAT_BAND = "#7a5231", PACK = "#d9623b";

export function paintExplorer(context, size, time, state = {}) {
  const s = size;
  const step = state.walking ? time * 10 : 0;
  const swing = Math.sin(step);
  const bob = state.walking ? Math.abs(Math.cos(step)) * s * 0.02 : Math.sin(time * 2) * s * 0.004;
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  paintLeg(context, s, -0.02, -swing, SKIN_DARK);
  if (!state.snapping) paintArm(context, s, bob, swing, SKIN_DARK, -0.04);
  context.translate(0, -bob);
  paintBackpack(context, s);
  paintBody(context, s);
  context.translate(0, bob);
  paintLeg(context, s, 0.02, swing, SKIN);
  context.translate(0, -bob);
  paintHead(context, s, time);
  if (state.snapping) paintCameraUp(context, s);
  else {
    paintCamera(context, s);
    context.translate(0, bob);
    paintArm(context, s, bob, -swing, SKIN, 0.03);
  }
  context.restore();
}

// A leg swinging from the hip, with a boot.
function paintLeg(context, s, hipX, swing, skin) {
  context.save();
  context.translate(s * hipX, -s * 0.27);
  context.rotate(swing * 0.42);
  context.strokeStyle = skin;
  context.lineWidth = s * 0.075;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, s * 0.22);
  context.stroke();
  context.fillStyle = BOOT;
  context.beginPath();
  context.roundRect(-s * 0.045, s * 0.2, s * 0.12, s * 0.07, s * 0.025);
  context.fill();
  context.restore();
}

// An arm swinging from the shoulder.
function paintArm(context, s, bob, swing, skin, shoulderX) {
  context.save();
  context.translate(s * shoulderX, -s * 0.57 - bob);
  context.rotate(swing * 0.5);
  context.strokeStyle = skin;
  context.lineWidth = s * 0.062;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(s * 0.02, s * 0.22);
  context.stroke();
  context.restore();
}

function paintBackpack(context, s) {
  context.fillStyle = PACK;
  context.beginPath();
  context.roundRect(-s * 0.2, -s * 0.62, s * 0.13, s * 0.25, s * 0.04);
  context.fill();
  context.fillStyle = "#b44c2c";
  context.beginPath();
  context.roundRect(-s * 0.215, -s * 0.5, s * 0.07, s * 0.1, s * 0.02);
  context.fill();
}

// Shirt with a pocket, shorts, and the camera strap across the chest.
function paintBody(context, s) {
  context.fillStyle = SHORTS;
  context.beginPath();
  context.roundRect(-s * 0.1, -s * 0.36, s * 0.2, s * 0.12, s * 0.03);
  context.fill();
  context.fillStyle = SHIRT;
  context.beginPath();
  context.roundRect(-s * 0.11, -s * 0.63, s * 0.22, s * 0.3, s * 0.07);
  context.fill();
  context.fillStyle = SHIRT_DARK;
  context.fillRect(s * 0.02, -s * 0.55, s * 0.06, s * 0.05);
  context.strokeStyle = "#333";
  context.lineWidth = s * 0.012;
  context.beginPath();
  context.moveTo(-s * 0.08, -s * 0.61);
  context.lineTo(s * 0.07, -s * 0.44);
  context.stroke();
}

function paintHead(context, s, time) {
  const x = s * 0.02, y = -s * 0.76, r = s * 0.15;
  context.fillStyle = HAIR;
  context.beginPath();
  context.arc(x - r * 0.25, y + r * 0.05, r * 0.95, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = SKIN;
  context.beginPath();
  context.arc(x + r * 0.08, y + r * 0.1, r * 0.88, 0, Math.PI * 2);
  context.fill();
  // Ear, eye (blinking now and then), rosy cheek and a smile.
  context.fillStyle = SKIN_DARK;
  context.beginPath();
  context.arc(x - r * 0.25, y + r * 0.15, r * 0.2, 0, Math.PI * 2);
  context.fill();
  const blink = time % 3.7 < 0.12;
  context.fillStyle = "#2b1d14";
  context.beginPath();
  if (blink) context.fillRect(x + r * 0.35, y + r * 0.02, r * 0.26, r * 0.07);
  else context.ellipse(x + r * 0.48, y + r * 0.02, r * 0.12, r * 0.16, 0, 0, Math.PI * 2);
  context.fill();
  if (!blink) {
    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(x + r * 0.52, y - r * 0.04, r * 0.05, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = "rgba(230,110,100,.45)";
  context.beginPath();
  context.arc(x + r * 0.42, y + r * 0.42, r * 0.14, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#7a3b2a";
  context.lineWidth = s * 0.012;
  context.beginPath();
  context.arc(x + r * 0.62, y + r * 0.35, r * 0.2, 0.2, 1.6);
  context.stroke();
  paintHat(context, s, x, y, r);
}

// A tan ranger hat with a wide brim and a brown band.
function paintHat(context, s, x, y, r) {
  context.fillStyle = HAT;
  context.beginPath();
  context.ellipse(x, y - r * 0.55, r * 1.55, r * 0.26, -0.05, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(x - r * 0.8, y - r * 0.6);
  context.quadraticCurveTo(x - r * 0.75, y - r * 1.45, x, y - r * 1.45);
  context.quadraticCurveTo(x + r * 0.75, y - r * 1.45, x + r * 0.8, y - r * 0.6);
  context.fill();
  context.fillStyle = HAT_BAND;
  context.fillRect(x - r * 0.8, y - r * 0.82, r * 1.6, r * 0.2);
}

// The camera hanging on the chest.
function paintCamera(context, s) {
  context.fillStyle = "#2e2e33";
  context.beginPath();
  context.roundRect(s * 0.02, -s * 0.47, s * 0.12, s * 0.08, s * 0.015);
  context.fill();
  context.fillStyle = "#7fb3d5";
  context.beginPath();
  context.arc(s * 0.1, -s * 0.43, s * 0.025, 0, Math.PI * 2);
  context.fill();
}

// Both hands up, holding the camera to the eye.
function paintCameraUp(context, s) {
  context.strokeStyle = SKIN;
  context.lineWidth = s * 0.062;
  context.beginPath();
  context.moveTo(s * 0.03, -s * 0.57);
  context.lineTo(s * 0.14, -s * 0.66);
  context.stroke();
  context.fillStyle = "#2e2e33";
  context.beginPath();
  context.roundRect(s * 0.1, -s * 0.8, s * 0.15, s * 0.1, s * 0.02);
  context.fill();
  context.fillStyle = "#7fb3d5";
  context.beginPath();
  context.arc(s * 0.25, -s * 0.75, s * 0.035, 0, Math.PI * 2);
  context.fill();
}
