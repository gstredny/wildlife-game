// Wires the game together: the start screen, walking, taking pictures, the card, the Field Guide and
// the Junior Ranger cheer. The rules live in trail.js; drawing lives in render.js.
import { againLines, cardSpeech, ANIMALS } from "./animals.js";
import { fillCard } from "./card-view.js";
import { loadFound, saveFound } from "./field-guide.js";
import { fillGuide } from "./guide-view.js";
import { animalAtPoint, cameraFor, screenToWorld, viewFor } from "./layout.js";
import { FIRST_TIP, VOICE_ON, WALK_CLOSER } from "./lines.js";
import { PLACES, placeKinds } from "./places.js";
import { paintFrame } from "./render.js";
import { createSound } from "./sound.js";
import { createWalk, inReach, snap, snapTarget, stepWalk, walkTo } from "./trail.js";
import { createVoice } from "./voice.js";

const $ = id => document.getElementById(id);
const canvas = $("trail");
const context = canvas.getContext("2d");
const voice = createVoice();
const sound = createSound();
const found = loadFound();
const place = PLACES.bayou;
const keys = new Set();
const SNAP_POSE = 0.7;

let walk = null; // the walk under way, or null on the start screen
const preview = createWalk(place, new Set());
preview.x = 520;
let camera = 0;
let hold = 0;
let posing = 0;
let tipped = false;
let rangerNext = false;
let cardFrom = null;
let view = viewFor(innerWidth, innerHeight, 0);

// ---- Screens ----

const PANELS = ["start", "card", "guide", "ranger"];
function show(panel) {
  $("overlay").hidden = !panel;
  for (const name of PANELS) $(name).hidden = name !== panel;
  const walking = Boolean(walk) && !panel;
  $("hud").hidden = !walk;
  $("controls").hidden = !walking;
  if (!walking) release();
}
const openPanel = () => PANELS.find(name => !$(name).hidden) ?? null;

function counts() {
  const total = placeKinds(place).length;
  const have = placeKinds(place).filter(kind => found.has(kind)).length;
  $("hud-count").textContent = $("place-count").textContent = `${have} of ${total} found`;
}

function goHome() {
  voice.stop();
  walk = null;
  counts();
  show("start");
}

function startWalk() {
  walk = createWalk(place, found);
  tipped = found.size > 0;
  $("hud-place").textContent = place.name;
  counts();
  show(null);
  voice.say(place.welcome);
}

// ---- Pictures and cards ----

function takePicture({ kind, first }) {
  posing = SNAP_POSE;
  sound.play("shutter");
  $("flash").classList.remove("go");
  void $("flash").offsetWidth;
  $("flash").classList.add("go");
  if (!first) {
    const lines = againLines(kind);
    voice.say(lines[Math.floor(Math.random() * lines.length)], { polite: true });
    return;
  }
  saveFound(found);
  counts();
  sound.play("found");
  rangerNext = placeKinds(place).every(each => found.has(each));
  release();
  setTimeout(() => openCard(kind, true, null), 450);
}

function openCard(kind, isNew, from) {
  cardFrom = from;
  fillCard(kind, isNew);
  $("card-hear").onclick = () => voice.say(cardSpeech(kind), { force: true });
  show("card");
  voice.say(cardSpeech(kind));
}

function closeCard() {
  voice.stop();
  if (cardFrom === "guide") return openGuide();
  if (rangerNext) {
    rangerNext = false;
    show("ranger");
    sound.play("ranger");
    voice.say(place.ranger);
    return;
  }
  show(walk ? null : "start");
}

function openGuide() {
  $("guide-title").textContent = place.name;
  $("guide-hint").textContent = "Tap an animal to hear about it.";
  fillGuide($("guide-grid"), place, found, (kind, isFound) => {
    if (isFound) return openCard(kind, false, "guide");
    $("guide-hint").textContent = ANIMALS[kind].hint;
    voice.say(ANIMALS[kind].hint, { force: true });
  });
  show("guide");
}

// ---- Walking ----

function direction() {
  const left = keys.has("ArrowLeft") || keys.has("a");
  const right = keys.has("ArrowRight") || keys.has("d");
  return hold || (right - left);
}

function trySnap() {
  const target = snapTarget(walk);
  if (target) takePicture(snap(walk, target));
  else voice.say(WALK_CLOSER, { polite: true });
}

function release() {
  hold = 0;
  keys.clear();
  for (const id of ["left-button", "right-button"]) $(id).classList.remove("held");
}

function tick(dt) {
  if (!walk || openPanel()) {
    if (!walk) preview.time += dt;
    return;
  }
  posing = Math.max(0, posing - dt);
  const result = stepWalk(walk, posing > 0 ? 0 : dt, posing > 0 ? 0 : direction());
  if (posing > 0) walk.time += dt;
  if (result.snap) takePicture(result.snap);
  if (result.end && !placeKinds(place).every(kind => found.has(kind))) voice.say(place.end, { polite: true });
  const target = snapTarget(walk);
  const fresh = target && !found.has(target.kind);
  $("snap-button").classList.toggle("ready", Boolean(fresh));
  // The first time an animal is close, Ranger Mike says how to snap it, once the welcome is over.
  if (fresh && !tipped) tipped = voice.say(FIRST_TIP, { polite: true });
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  tick(dt);
  const shown = walk ?? preview;
  view = viewFor(canvas.width, canvas.height, 0);
  camera += (cameraFor(shown, view.width) - camera) * Math.min(1, dt * 4);
  if (!walk) camera = cameraFor(shown, view.width);
  view = viewFor(canvas.width, canvas.height, camera);
  paintFrame(context, shown, view, posing > 0);
  requestAnimationFrame(frame);
}

function resize() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * ratio);
  canvas.height = Math.round(innerHeight * ratio);
}

// ---- Input ----

// Phones allow sound only after a tap, so the first touch, click or key wakes up voice and sound.
function wake() {
  voice.unlock();
  sound.unlock();
}
addEventListener("pointerdown", wake, { capture: true });
addEventListener("keydown", wake, { capture: true });

canvas.addEventListener("pointerdown", event => {
  if (!walk || openPanel()) return;
  const ratio = canvas.width / innerWidth;
  const point = screenToWorld(view, event.clientX * ratio, event.clientY * ratio);
  const animal = animalAtPoint(walk, point);
  if (animal && inReach(walk, animal)) takePicture(snap(walk, animal));
  else walkTo(walk, point.x, animal);
});

for (const [id, step] of [["left-button", -1], ["right-button", 1]]) {
  const button = $(id);
  button.addEventListener("pointerdown", event => {
    button.setPointerCapture?.(event.pointerId);
    hold = step;
    button.classList.add("held");
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    button.addEventListener(type, () => {
      if (hold === step) hold = 0;
      button.classList.remove("held");
    });
  }
}

addEventListener("keydown", event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === "Escape") {
    if (openPanel() === "card") closeCard();
    else if (openPanel() === "guide" || openPanel() === "ranger") show(walk ? null : "start");
    return;
  }
  if (!walk || openPanel()) return;
  if (key === " " || key === "Enter") {
    event.preventDefault();
    trySnap();
  }
  keys.add(key);
});
addEventListener("keyup", event => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
addEventListener("blur", release);
addEventListener("resize", resize);

$("place-bayou").addEventListener("click", startWalk);
$("snap-button").addEventListener("click", () => walk && trySnap());
$("card-close").addEventListener("click", closeCard);
$("guide-button").addEventListener("click", openGuide);
$("start-guide-button").addEventListener("click", openGuide);
$("guide-close").addEventListener("click", () => show(walk ? null : "start"));
$("home-button").addEventListener("click", goHome);
$("ranger-close").addEventListener("click", () => show(null));
$("ranger-home").addEventListener("click", goHome);

// The speaker buttons turn the voice and the sounds off and on; the device remembers.
function showVoice() {
  for (const button of document.querySelectorAll(".voice-toggle")) {
    button.textContent = voice.muted ? "🔇" : "🔊";
    button.setAttribute("aria-label", voice.muted ? "Turn the voice on" : "Turn the voice off");
  }
  sound.setMuted(voice.muted);
}
for (const button of document.querySelectorAll(".voice-toggle")) {
  button.addEventListener("click", () => {
    voice.setMuted(!voice.muted);
    showVoice();
    if (!voice.muted) voice.say(VOICE_ON);
  });
}

// When an update takes over in the background, show it straight away, but only from the start
// screen: never mid-walk or with a card open. Once per launch.
if ("serviceWorker" in navigator) {
  const updating = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.register("./sw.js").then(registration => {
    document.addEventListener("visibilitychange", () => { if (!document.hidden) registration.update().catch(() => {}); });
  }).catch(() => {});
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!updating || walk || openPanel() !== "start") return;
    try {
      if (sessionStorage.getItem("wildlife-updated")) return;
      sessionStorage.setItem("wildlife-updated", "1");
    } catch { /* no session storage: still reload once, as the page is fresh after it */ }
    location.reload();
  });
}

resize();
showVoice();
counts();
show("start");
requestAnimationFrame(frame);
