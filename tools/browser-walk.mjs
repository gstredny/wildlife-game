// Plays one level in its own muted, headless Chrome with real input, as a saved player who has
// reached it: walks and jumps right to each hiding animal, reads every card, and ends as a Junior
// Ranger with the next trail opened on the map. It plays like the careful child in tests/careful.js,
// looking at the game about 30 times a second; after a game over it taps Try again (found animals
// stay found). Saves screenshots and fails on any page error. No packages (Node 22+).
//
//   python3 -m http.server 8790 --bind 127.0.0.1 &
//   node tools/browser-walk.mjs desktop   # 1280×800, keyboard
//   node tools/browser-walk.mjs phone     # 844×390 sideways phone, touch
import { spawn } from "node:child_process";
import { levelNumber } from "../src/levels.js";
import { PLACES, placeKinds } from "../src/places.js";
import { PLAYERS_KEY } from "../src/players.js";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MODE = process.argv[2] || "desktop";
const HABITAT = process.argv[3] || "bayou";
const TOTAL = placeKinds(PLACES[HABITAT]).length;
const OUT = process.env.OUT || "screenshots/walk";
const GAME = process.env.GAME || "http://127.0.0.1:8790/";
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const phone = MODE === "phone";
const size = phone ? { width: 844, height: 390, deviceScaleFactor: 2, mobile: true } : { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
mkdirSync(OUT, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), "wildlife-walk-"));
const port = 9500 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ["--headless=new", "--mute-audio", `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
const finish = code => {
  chrome.once("exit", () => { rmSync(profile, { recursive: true, force: true, maxRetries: 5 }); process.exit(code); });
  chrome.kill();
};

let target = null;
for (let tries = 0; tries < 50 && !target; tries++) {
  await sleep(100);
  try { target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json(); } catch {}
}
if (!target) {
  console.error("Browser verification blocked: Chrome could not start.");
  chrome.kill();
  rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  process.exit(1);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => { ws.onopen = resolve; });
let nextId = 1;
const pending = new Map();
const errors = [];
ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push(message.params.args.map(arg => arg.value ?? arg.description).join(" "));
};
const send = (method, params = {}) => new Promise(resolve => { const id = nextId++; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async expression => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
let shots = 0;
async function shot(name) {
  const { result } = await send("Page.captureScreenshot", { format: "png" });
  const file = `${OUT}/${MODE}-${HABITAT}-${String(++shots).padStart(2, "0")}-${name}.png`;
  writeFileSync(file, Buffer.from(result.data, "base64"));
  console.log("shot", file);
}
const centerOf = async id => JSON.parse(await evaluate(`(() => { const r = document.getElementById("${id}").getBoundingClientRect(); return JSON.stringify({ x: r.x + r.width / 2, y: r.y + r.height / 2 }); })()`));
const visible = id => evaluate(`!document.getElementById("${id}").closest("[hidden]")`);

// A real tap (phone) or click (computer) in the middle of an element.
// Gives the right name button on the card (or a wrong one not yet tapped) an id, so press() can tap it.
const markChoice = right => evaluate(`(() => {
  document.getElementById("pick")?.removeAttribute("id");
  const name = document.getElementById("card-name").textContent;
  const buttons = [...document.querySelectorAll("#card-choices button")];
  buttons.find(button => (button.textContent === name) === ${right} && !button.disabled).id = "pick";
  return "pick";
})()`);

async function press(id) {
  await evaluate(`document.getElementById("${id}").scrollIntoView({ block: "center" })`);
  const { x, y } = await centerOf(id);
  if (phone) {
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await sleep(60);
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } else {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  }
  await sleep(150);
}

// What the careful child would press now, as "r" (right) and "j" (jump), with how many animals are
// found and whether the explorer is tumbling or at the flag; null with a panel open.
const LOOK = `Promise.all([import("./src/main.js"), import("./tests/careful.js")]).then(([game, { carefulJump }]) => {
  const walk = game.currentWalk();
  if (!walk || !document.getElementById("overlay").hidden) return null;
  return { move: carefulJump(walk) ? "rj" : "r", found: walk.found.size, stop: walk.dying > 0 || walk.endedAt !== null };
})`;
const KEYS = { r: ["ArrowRight", "ArrowRight", 39], j: [" ", "Space", 32] };
const BUTTONS = { r: "right-button", j: "jump-button" };

// Press and hold what `move` names, letting go of the rest: keys on a computer, thumbs on the walk
// and jump buttons on a phone.
async function hold(move, held) {
  if (phone) {
    if (held) await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    const touches = [];
    for (const part of move) touches.push(await centerOf(BUTTONS[part]));
    if (touches.length) await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touches });
    return;
  }
  for (const part of "rj") {
    const [key, code, windowsVirtualKeyCode] = KEYS[part];
    if (held.includes(part) !== move.includes(part)) {
      await send("Input.dispatchKeyEvent", { type: move.includes(part) ? "keyDown" : "keyUp", key, code, windowsVirtualKeyCode });
    }
  }
}

// Play for a moment with real input, looking at the game about 30 times a second. Fingers come off
// the buttons as soon as an animal is found, a hazard hits, or the flag is reached, before a panel
// covers them: a touch held down while its button disappears jams Chrome's touch input.
let foundSoFar = 0;
async function walkRight(ms) {
  let held = "";
  let settle = false;
  for (const end = Date.now() + ms; Date.now() < end;) {
    const look = await evaluate(LOOK);
    settle = !look || look.stop || look.found !== foundSoFar;
    if (settle) {
      foundSoFar = look?.found ?? foundSoFar;
      break;
    }
    if (look.move !== held) {
      await hold(look.move, held);
      held = look.move;
    }
    await sleep(25);
  }
  if (held) await hold("", held);
  await sleep(settle ? 900 : 50); // after a find, a hit or the flag, wait for the panel about to open
}

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("Network.setBlockedURLs", { urls: ["*commons.wikimedia.org*", "*upload.wikimedia.org*"] });
await send("Emulation.setDeviceMetricsOverride", size);
if (phone) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url: GAME });
await sleep(1500);
// A saved player who has reached this level, as a child who beat the ones before it would be.
const saved = { current: "Explorer", list: { Explorer: { found: [], log: [], level: levelNumber(HABITAT) } } };
await evaluate(`localStorage.setItem(${JSON.stringify(PLAYERS_KEY)}, ${JSON.stringify(JSON.stringify(saved))})`);
await send("Page.reload");
await sleep(1500);
await shot("trail-map");
// The Field Guide before any walk: every animal is a dark shape, and tapping one gives a clue.
await press("start-guide-button");
await evaluate(`document.querySelector(".guide-slot").id = "first-slot"`);
await press("first-slot");
await sleep(300);
await shot("field-guide-empty");
const clue = await evaluate(`document.getElementById("guide-hint").textContent`);
if (!/trees/.test(clue)) errors.push(`the cicada's clue did not show: ${clue}`);
await press("guide-close");
await press(`place-${HABITAT}`);
await sleep(600);
await shot("trail-start");

const cards = [];
let walked = 0;
let gameOvers = 0;
for (let step = 0; step < 300; step++) {
  if (await visible("ranger")) break;
  if (await visible("gameover")) {
    if (gameOvers++ === 0) await shot("game-over");
    await press("gameover-retry");
    continue;
  }
  if (await visible("card")) {
    // The card asks "What animal is this?" with three names. On the first card, tap a wrong name
    // first; then tap the right one, which shows the answer.
    if (await evaluate(`document.getElementById("card").classList.contains("guessing")`)) {
      if (cards.length === 0) {
        await shot("card-guess");
        await press(await markChoice(false));
        await sleep(500);
        await shot("card-wrong");
      }
      await press(await markChoice(true));
    }
    const name = await evaluate(`document.getElementById("card-name").textContent`);
    cards.push(name);
    await sleep(700);
    await shot(`card-${name.toLowerCase().replace(/\W+/g, "-")}`);
    await press("card-close");
    await sleep(300);
    continue;
  }
  await walkRight(350);
  walked += 350;
  if (walked % 3500 === 0) await shot(`walking-${walked / 1000}s`);
}
const count = await evaluate(`document.getElementById("hud-count").textContent`);
console.log("found:", count, "| game overs:", gameOvers, "| cards:", cards.join(", "));
const ranger = await visible("ranger");
if (ranger) {
  await sleep(500);
  await shot("junior-ranger");
  const cheer = await evaluate(`document.getElementById("ranger-message").textContent`);
  if (!/A new trail opened: |every trail/.test(cheer)) errors.push(`the cheer opened no trail: ${cheer}`);
  console.log("cheer:", cheer);
  await press("ranger-home");
  await sleep(400);
  await shot("trail-map-after");
}
await press("start-guide-button");
await sleep(500);
await shot("field-guide");
// Replay a discovered card, then find this level beaten on the map after an offline reload.
await evaluate(`document.querySelector(".guide-slot:not(.missing)").id = "known-slot"`);
await press("known-slot");
await sleep(600);
if (!await evaluate(`document.getElementById("card-image").naturalWidth > 0`)) errors.push("card image failed to render");
await shot("guide-replay");
await press("card-close");
await press("guide-close");
await evaluate(`navigator.serviceWorker.ready.then(() => new Promise(resolve => {
  if (navigator.serviceWorker.controller) resolve(true);
  else navigator.serviceWorker.addEventListener("controllerchange", () => resolve(true), { once: true });
}))`);
await send("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
await send("Page.reload");
await sleep(1500);
const beaten = await evaluate(`document.getElementById("place-${HABITAT}")?.className ?? "missing"`);
if (beaten !== "map-stop beaten") errors.push(`offline saved progress: ${HABITAT} on the map is "${beaten}", not a beaten badge`);
console.log("after the offline reload, the map shows:", await evaluate(`document.querySelector(".level-now, .level-done").textContent`));
await press(`place-${HABITAT}`);
await sleep(400);
await shot("offline-return");
// Players: these finds belong to the first explorer; a new player starts with an empty Field Guide.
await press("home-button");
await press("players-button");
await shot("players");
await press("player-name");
await send("Input.insertText", { text: "Emma" });
await press("player-add");
const newCount = await evaluate(`document.getElementById("collection-count").textContent`);
if (!newCount.startsWith("0 of")) errors.push(`new player's count: ${newCount}`);
await press("players-button");
await shot("players-two");
for (const error of errors) console.log("page error:", error);
const ok = ranger && cards.length === TOTAL && errors.length === 0;
console.log(ok ? `PASS: level ${levelNumber(HABITAT)} ${HABITAT}, ${TOTAL} animals found, Junior Ranger shown, no page errors` : "FAIL");
finish(ok ? 0 : 1);
