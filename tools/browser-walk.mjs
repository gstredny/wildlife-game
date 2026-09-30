// Plays the Bayou Trail in its own muted, headless Chrome with real input: walks right, snaps each
// animal the camera button offers, reads every card, and ends as a Junior Ranger. Saves screenshots
// and fails on any page error. No packages (Node 22+).
//
//   python3 -m http.server 8790 --bind 127.0.0.1 &
//   node tools/browser-walk.mjs desktop   # 1280×800, keyboard
//   node tools/browser-walk.mjs phone     # 844×390 sideways phone, touch
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MODE = process.argv[2] || "desktop";
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
const evaluate = async expression => (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.result?.value;
let shots = 0;
async function shot(name) {
  const { result } = await send("Page.captureScreenshot", { format: "png" });
  const file = `${OUT}/${MODE}-${String(++shots).padStart(2, "0")}-${name}.png`;
  writeFileSync(file, Buffer.from(result.data, "base64"));
  console.log("shot", file);
}
const centerOf = async id => JSON.parse(await evaluate(`(() => { const r = document.getElementById("${id}").getBoundingClientRect(); return JSON.stringify({ x: r.x + r.width / 2, y: r.y + r.height / 2 }); })()`));
const visible = id => evaluate(`!document.getElementById("${id}").closest("[hidden]")`);

// A real tap (phone) or click (computer) in the middle of an element.
async function press(id) {
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

// Walk right for a moment: hold the arrow key, or a thumb on the right walk button.
async function walkRight(ms) {
  if (phone) {
    const { x, y } = await centerOf("right-button");
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await sleep(ms);
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } else {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    await sleep(ms);
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  }
}

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", size);
if (phone) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url: GAME });
await sleep(1500);
await shot("start");
// The Field Guide before any walk: every animal is a dark shape, and tapping one gives a clue.
await press("start-guide-button");
await evaluate(`document.querySelector(".guide-slot").id = "first-slot"`);
await press("first-slot");
await sleep(300);
await shot("field-guide-empty");
const clue = await evaluate(`document.getElementById("guide-hint").textContent`);
if (!/trees/.test(clue)) errors.push(`the cicada's clue did not show: ${clue}`);
await press("guide-close");
await press("place-bayou");
await sleep(600);
await shot("trail-start");

const cards = [];
let walked = 0;
for (let step = 0; step < 160; step++) {
  if (await visible("ranger")) break;
  if (await visible("card")) {
    const name = await evaluate(`document.getElementById("card-name").textContent`);
    cards.push(name);
    await sleep(700);
    await shot(`card-${name.toLowerCase().replace(/\W+/g, "-")}`);
    await press("card-close");
    await sleep(300);
    continue;
  }
  if (await evaluate(`document.getElementById("snap-button").classList.contains("ready")`)) {
    if (cards.length === 0) await shot("camera-ready");
    await press("snap-button");
    await sleep(700);
    continue;
  }
  await walkRight(350);
  walked += 350;
  if (walked % 3500 === 0) await shot(`walking-${walked / 1000}s`);
}
const count = await evaluate(`document.getElementById("hud-count").textContent`);
console.log("found:", count, "| cards:", cards.join(", "));
const ranger = await visible("ranger");
if (ranger) {
  await sleep(500);
  await shot("junior-ranger");
  await press("ranger-close");
}
await press("guide-button");
await sleep(500);
await shot("field-guide");
for (const error of errors) console.log("page error:", error);
const ok = ranger && cards.length === 8 && errors.length === 0;
console.log(ok ? "PASS: all eight found, Junior Ranger shown, no page errors" : "FAIL");
finish(ok ? 0 : 1);
