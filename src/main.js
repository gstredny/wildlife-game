// Wires the game together: the trail map, walking, taking pictures, the card, the Field Guide, the
// hearts and game over, and the Junior Ranger cheer at the goal flag that opens the next level. The
// rules live in trail.js and levels.js; drawing lives in render.js.
import { cardSpeech, ANIMALS } from "./animals.js";
import { fillCard } from "./card-view.js";
import { fillChoices } from "./choices-view.js";
import { throwConfetti } from "./confetti.js";
import { fillGuide } from "./guide-view.js";
import { animalAtPoint, cameraFor, screenToWorld, viewFor } from "./layout.js";
import { allBeaten, beatLevel, currentLevel, LEVELS, levelNumber } from "./levels.js";
import { FINALE, GAME_OVER, GUESSES, VOICE_ON, WALK_CLOSER } from "./lines.js";
import { PLACES, placeKinds } from "./places.js";
import { fillMap, progress } from "./place-view.js";
import { addPlayer, loadPlayers, MAX_PLAYERS, recordFind, removePlayer, savePlayers } from "./players.js";
import { fillPlayers } from "./players-view.js";
import { paintFrame } from "./render.js";
import { createSound } from "./sound.js";
import { createWalk, inReach, jump, LIVES, snap, snapTarget, stepWalk, walkTo } from "./trail.js";
import { createVoice } from "./voice.js";

const $ = id => document.getElementById(id);
const canvas = $("trail");
const context = canvas.getContext("2d");
const voice = createVoice();
const sound = createSound();
const players = loadPlayers();
const player = () => players.list[players.current];
const found = new Set(player().found); // the current player's animals
// The place behind the trail map: the level the player is on, or the last once every level is beaten.
const homeKey = () => currentLevel(player()) ?? LEVELS.at(-1);
let place = PLACES[homeKey()];
const keys = new Set();
const SNAP_POSE = 0.7;

let walk = null; // the walk under way, or null on the trail map
let preview = createWalk(place, new Set());
preview.x = 520;
let camera = 0;
let hold = 0;
let jumpHeld = false;
let posing = 0;
let cardFrom = null;
const named = new Set(); // the animals named right on the first try on this walk, each a gold paw
let view = viewFor(innerWidth, innerHeight, 0);
// The walk under way, for the screen tests to see where the explorer is.
export const currentWalk = () => walk;

// ---- Screens ----

const PANELS = ["start", "card", "guide", "ranger", "players", "gameover"];
function show(panel) {
  $("card").classList.remove("guessing");
  $("overlay").hidden = !panel;
  for (const name of PANELS) $(name).hidden = name !== panel;
  const walking = Boolean(walk) && !panel;
  $("hud").hidden = !walk;
  $("controls").hidden = !walking;
  if (!walking) release();
}
const openPanel = () => PANELS.find(name => !$(name).hidden) ?? null;
const placeKey = () => Object.keys(PLACES).find(key => PLACES[key] === place);
// The explorer can be steered: on a walk, with no panel open, not tumbling, and with hearts left.
const playing = () => walk && !openPanel() && !walk.dying && walk.lives > 0;

function counts() {
  $("hud-count").textContent = progress(place, found);
  $("hud-stars").textContent = `⭐ ${walk?.stars.size ?? 0} of ${place.stars.length}`;
  const lives = walk?.lives ?? LIVES;
  $("hud-lives").textContent = "❤️".repeat(lives) + "🤍".repeat(LIVES - lives);
  $("hud-lives").setAttribute("aria-label", `${lives} of ${LIVES} hearts left`);
  const kinds = placeKinds(place);
  const gold = kinds.filter(kind => named.has(kind)).length;
  const paws = (count, className) => Object.assign(document.createElement("span"), { className, textContent: "🐾".repeat(count) });
  $("hud-paws").replaceChildren(paws(gold, "paws-named"), paws(kinds.length - gold, "paws-left"));
  $("hud-paws").setAttribute("aria-label", `${gold} of ${kinds.length} animals named`);
  $("collection-count").textContent = `${found.size} of ${Object.keys(ANIMALS).length} animals in your Field Guide`;
  $("players-button").textContent = `👤 ${players.current}`;
  fillMap($("places"), player(), found, startWalk);
}

// The place shown: on a walk, or as the scenery behind the trail map.
function setPlace(key) {
  place = PLACES[key];
  preview = createWalk(place);
  preview.x = 520;
}

function goHome() {
  voice.stop();
  walk = null;
  setPlace(homeKey());
  counts();
  show("start");
}

function startWalk(key) {
  setPlace(key);
  camera = 0;
  posing = 0;
  walk = createWalk(place, found);
  named.clear();
  $("hud-level").textContent = `Level ${levelNumber(key)}`;
  $("hud-place").textContent = place.name;
  counts();
  show(null);
  voice.say(place.welcome);
}

// ---- Pictures and cards ----

// Every picture opens the animal's card; a first find also goes into the Field Guide.
function takePicture({ kind, first }) {
  posing = SNAP_POSE;
  sound.play("shutter");
  $("flash").classList.remove("go");
  void $("flash").offsetWidth;
  $("flash").classList.add("go");
  if (first) {
    recordFind(players, kind, placeKey());
    savePlayers(players);
    counts();
    sound.play("found");
  }
  release();
  const picturedWalk = walk;
  setTimeout(() => { if (walk === picturedWalk) openCard(kind, first, null); }, 450);
}

function openCard(kind, isNew, from) {
  cardFrom = from;
  fillCard(kind, isNew);
  $("card-hear").onclick = () => voice.say(cardSpeech(kind), { force: true });
  show("card");
  if (from === "guide") return void voice.say(cardSpeech(kind));
  // On the trail: the ranger asks, then waits with the picture until the child picks the right name.
  const question = GUESSES[Math.floor(Math.random() * GUESSES.length)];
  $("card").classList.add("guessing");
  $("card-kicker").textContent = question;
  fillChoices($("card-choices"), kind, firstTry => tell(kind, isNew, firstTry));
  voice.say(question);
}

// The right name: the answer shows, and the first time on this walk it was named right away, a gold paw.
function tell(kind, isNew, firstTry) {
  $("card").classList.remove("guessing");
  $("card-kicker").textContent = isNew ? "That's right! A new animal!" : "That's right!";
  if (firstTry && !named.has(kind)) {
    named.add(kind);
    sound.play("star");
    counts();
  }
  voice.say(cardSpeech(kind));
}

function closeCard() {
  voice.stop();
  if (cardFrom === "guide") return openGuide();
  show(walk ? null : "start");
}

// The goal flag beats the level and opens the next one, saved at once. A fanfare while the flag goes
// up, then confetti and the Junior Ranger cheer naming the trail that opened; after the last level,
// the Master Ranger cheer. Every hiding spot is on the way, so every animal here is found by now.
function reachGoal() {
  sound.play("ranger");
  release();
  const finished = walk;
  const key = placeKey();
  const opened = beatLevel(player(), key);
  savePlayers(players);
  const finale = key === LEVELS.at(-1) && allBeaten(player());
  setTimeout(() => {
    if (walk !== finished) return;
    show("ranger");
    throwConfetti($("confetti"));
    $("ranger-place").textContent = `Level ${levelNumber(key)} · ${place.name}`;
    $("ranger-title").textContent = finale ? "Master Ranger!" : "Junior Ranger!";
    $("ranger-badge").textContent = finale ? "🏅" : "★";
    const total = placeKinds(place).length;
    const cheer = `You found all ${total} animals and caught ${walk.stars.size} of ${place.stars.length} stars! You named ${named.size} of ${total} on the first try!`;
    $("ranger-message").textContent = finale ? `${cheer} You explored every trail around Katy, Texas!`
      : opened ? `${cheer} A new trail opened: ${PLACES[opened].name}!` : cheer;
    $("ranger-next").hidden = !nextLevel();
    voice.say(finale ? FINALE : place.ranger);
  }, 900);
}

// The level after the one just played, if there is one; it is open, since this one is beaten.
const nextLevel = () => LEVELS[levelNumber(placeKey())] ?? null;

function openGuide() {
  const scope = $("guide-place").value;
  const guidePlace = scope === "all" ? { animals: Object.keys(ANIMALS).map(kind => ({ kind })) } : PLACES[scope];
  $("guide-title").textContent = scope === "all" ? "Texas wildlife" : guidePlace.name;
  $("guide-progress").textContent = progress(guidePlace, found);
  $("guide-hint").textContent = "Tap an animal to hear about it.";
  fillGuide($("guide-grid"), guidePlace, found, (kind, isFound) => {
    if (isFound) return openCard(kind, false, "guide");
    const homes = Object.values(PLACES).filter(each => placeKinds(each).includes(kind)).map(each => each.name);
    $("guide-hint").textContent = `${ANIMALS[kind].hint} Explore: ${homes.join(", ")}.`;
    voice.say(ANIMALS[kind].hint, { force: true });
  });
  show("guide");
}

// ---- Players ----

function openPlayers() {
  fillPlayers($("players-list"), players, pickPlayer, dropPlayer);
  const full = Object.keys(players.list).length >= MAX_PLAYERS;
  $("player-form").hidden = full;
  $("players-full").hidden = !full;
  show("players");
}

// The current player's animals, after switching or removing a player.
function useCurrent() {
  found.clear();
  for (const kind of player().found) found.add(kind);
}

function pickPlayer(name) {
  players.current = name;
  savePlayers(players);
  useCurrent();
  goHome();
}

function dropPlayer(name) {
  if (!removePlayer(players, name)) return;
  savePlayers(players);
  useCurrent();
  counts();
  openPlayers();
}

// ---- Walking ----

function direction() {
  const left = keys.has("ArrowLeft") || keys.has("a");
  const right = keys.has("ArrowRight") || keys.has("d");
  return hold || (right - left);
}

// Space, the up arrow, W, or the jump button. Holding it keeps hopping.
function tryJump() {
  if (jump(walk)) sound.play("hop");
}
const jumping = () => jumpHeld || keys.has(" ") || keys.has("ArrowUp") || keys.has("w");

function trySnap() {
  if (!playing()) return;
  const target = snapTarget(walk);
  if (target) takePicture(snap(walk, target));
  else voice.say(WALK_CLOSER, { polite: true });
}

function release() {
  hold = 0;
  jumpHeld = false;
  keys.clear();
  for (const id of ["left-button", "right-button", "jump-button"]) $(id).classList.remove("held");
}

function tick(dt) {
  if (!walk || openPanel()) {
    if (!walk) preview.time += dt;
    return;
  }
  posing = Math.max(0, posing - dt);
  if (jumping() && posing === 0) tryJump();
  const result = stepWalk(walk, posing > 0 ? 0 : dt, posing > 0 ? 0 : direction());
  if (posing > 0) walk.time += dt;
  if (result.snap) takePicture(result.snap);
  if (result.died) {
    sound.play("lose");
    release();
    counts();
  }
  if (result.gameOver) {
    $("gameover-place").textContent = place.name;
    show("gameover");
    voice.say(GAME_OVER);
  }
  if (result.stomped) sound.play("hop");
  if (result.stars) {
    sound.play("star");
    counts();
  }
  if (result.end) reachGoal();
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
  if (!playing()) return;
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

const jumpButton = $("jump-button");
jumpButton.addEventListener("pointerdown", event => {
  jumpButton.setPointerCapture?.(event.pointerId);
  jumpHeld = true;
  jumpButton.classList.add("held");
  if (walk && !openPanel()) tryJump();
});
for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
  jumpButton.addEventListener(type, () => {
    jumpHeld = false;
    jumpButton.classList.remove("held");
  });
}

addEventListener("keydown", event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === "Escape") {
    if (openPanel() === "card") closeCard();
    else if (openPanel() === "gameover") goHome();
    else if (["guide", "ranger", "players"].includes(openPanel())) show(walk ? null : "start");
    return;
  }
  if (!walk || openPanel()) return;
  if (key === "Enter") trySnap();
  if (key === " " || key === "ArrowUp") event.preventDefault();
  keys.add(key);
});
addEventListener("keyup", event => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
addEventListener("blur", release);
addEventListener("resize", resize);

$("snap-button").addEventListener("click", () => walk && trySnap());
$("card-close").addEventListener("click", closeCard);
$("guide-button").addEventListener("click", () => {
  $("guide-place").value = placeKey();
  openGuide();
});
$("start-guide-button").addEventListener("click", () => { $("guide-place").value = "all"; openGuide(); });
$("guide-place").addEventListener("change", openGuide);
$("guide-close").addEventListener("click", () => show(walk ? null : "start"));
$("home-button").addEventListener("click", goHome);
$("ranger-next").addEventListener("click", () => startWalk(nextLevel()));
$("ranger-home").addEventListener("click", goHome);
$("gameover-retry").addEventListener("click", () => startWalk(placeKey()));
$("gameover-home").addEventListener("click", goHome);
$("players-button").addEventListener("click", openPlayers);
$("players-close").addEventListener("click", () => show("start"));
$("player-form").addEventListener("submit", event => {
  event.preventDefault();
  const name = addPlayer(players, $("player-name").value);
  if (!name) return;
  $("player-name").value = "";
  pickPlayer(name);
});

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
for (const [key, each] of Object.entries(PLACES)) $("guide-place").add(new Option(each.name, key));
showVoice();
counts();
show("start");
requestAnimationFrame(frame);
