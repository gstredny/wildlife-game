// Checks "I saw it for real!" in its own muted, headless Chrome: on a Field Guide card the camera
// button opens the real file picker, the picked photo shows as a polaroid with the day, is kept on the
// device shrunk to a JPEG, is still there after a reload, belongs only to its player, and goes when
// that player is removed. Saves screenshots and fails on any page error. No packages (Node 22+).
//
//   python3 -m http.server 8790 --bind 127.0.0.1 &
//   node tools/browser-seen.mjs desktop phone
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PLAYERS_KEY } from "../src/players.js";

const MODES = process.argv.slice(2).length ? process.argv.slice(2) : ["desktop"];
const OUT = process.env.OUT || "screenshots/seen";
const GAME = process.env.GAME || "http://127.0.0.1:8790/";
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PHOTO = resolve("art/animals/cardinal.webp"); // 960×1120, so the copy kept is 1024 tall
const SIZES = {
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
  phone: { width: 844, height: 390, deviceScaleFactor: 2, mobile: true }
};
const sleep = ms => new Promise(done => setTimeout(done, ms));
mkdirSync(OUT, { recursive: true });

async function check(mode) {
  const phone = mode === "phone";
  const errors = [];
  const profile = mkdtempSync(join(tmpdir(), "wildlife-seen-"));
  const port = 9500 + Math.floor(Math.random() * 400);
  const chrome = spawn(CHROME, ["--headless=new", "--mute-audio", `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
  let target = null;
  for (let tries = 0; tries < 50 && !target; tries++) {
    await sleep(100);
    try { target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json(); } catch {}
  }
  if (!target) {
    chrome.kill();
    return [`${mode}: Chrome could not start`];
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(done => { ws.onopen = done; });
  let nextId = 1;
  const pending = new Map();
  let chooser = null; // the file picker the page opened, as Chrome reports it
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
    if (message.method === "Page.fileChooserOpened") chooser = message.params;
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push(message.params.args.map(arg => arg.value ?? arg.description).join(" "));
  };
  const send = (method, params = {}) => new Promise(done => { const id = nextId++; pending.set(id, done); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
  const expect = (ok, problem) => { if (!ok) errors.push(problem); };
  let shots = 0;
  async function shot(name) {
    const { result } = await send("Page.captureScreenshot", { format: "png" });
    const file = `${OUT}/${mode}-${String(++shots).padStart(2, "0")}-${name}.png`;
    writeFileSync(file, Buffer.from(result.data, "base64"));
    console.log("shot", file);
  }
  const visible = id => evaluate(`!document.getElementById("${id}").closest("[hidden]")`);
  // A real tap (phone) or click (computer) in the middle of an element.
  async function press(id) {
    await evaluate(`document.getElementById("${id}").scrollIntoView({ block: "center" })`);
    const { x, y } = JSON.parse(await evaluate(`(() => { const r = document.getElementById("${id}").getBoundingClientRect(); return JSON.stringify({ x: r.x + r.width / 2, y: r.y + r.height / 2 }); })()`));
    if (phone) {
      await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      await sleep(60);
      await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } else {
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    }
    await sleep(300);
  }
  // The cardinal's square in the Field Guide, found again each time, as the guide draws it anew.
  const markCardinal = () => evaluate(`[...document.querySelectorAll(".guide-slot")].find(slot => slot.getAttribute("aria-label").startsWith("Northern cardinal")).id = "cardinal-slot"`);
  const sticker = () => markCardinal().then(() => evaluate(`document.getElementById("cardinal-slot").classList.contains("seen")`));
  async function openCardinal() {
    await press("start-guide-button");
    await markCardinal();
  }
  // The photos kept on the device, as [player, animal, type, longest side].
  const kept = () => evaluate(`new Promise(done => {
    const request = indexedDB.open("wildlife-real-photos");
    request.onsuccess = () => {
      const all = request.result.transaction("photos").objectStore("photos").openCursor();
      const rows = [];
      all.onsuccess = async () => {
        const cursor = all.result;
        if (!cursor) return done(JSON.stringify(await Promise.all(rows)));
        const [player, kind] = cursor.key;
        const photo = cursor.value;
        rows.push(createImageBitmap(photo).then(image => [player, kind, photo.type, Math.max(image.width, image.height)]));
        cursor.continue();
      };
    };
  })`).then(JSON.parse);

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Network.setBlockedURLs", { urls: ["*commons.wikimedia.org*", "*upload.wikimedia.org*"] });
  await send("Page.setInterceptFileChooserDialog", { enabled: true });
  await send("Emulation.setDeviceMetricsOverride", SIZES[mode]);
  if (phone) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Page.navigate", { url: GAME });
  await sleep(1500);
  // Two players who have both found the cardinal in the game.
  const saved = { current: "Georgie", list: {
    Georgie: { found: ["cardinal", "blueJay", "mockingbird"], log: [], level: 2 },
    Dora: { found: ["cardinal"], log: [], level: 1 } } };
  await evaluate(`localStorage.setItem(${JSON.stringify(PLAYERS_KEY)}, ${JSON.stringify(JSON.stringify(saved))})`);
  await send("Page.reload");
  await sleep(1500);

  // The Field Guide card has the button; it opens the real file picker, and the photo shows at once.
  await openCardinal();
  await press("cardinal-slot");
  expect(await visible("card-seen-button"), "no camera button on the Field Guide card");
  expect(!await visible("card-seen"), "a polaroid before any photo");
  await press("card-seen-button");
  await sleep(300);
  expect(chooser, "the camera button did not open the file picker");
  if (chooser) await send("DOM.setFileInputFiles", { files: [PHOTO], backendNodeId: chooser.backendNodeId });
  await sleep(1200);
  expect(await visible("card-seen"), "no polaroid after the photo");
  expect(await evaluate(`document.getElementById("card-seen-image").naturalWidth > 0`), "the photo did not show");
  const day = await evaluate(`document.getElementById("card-seen-date").textContent`);
  expect(day.startsWith("Seen for real! ") && day.includes(String(new Date().getFullYear())), `the day reads "${day}"`);
  await shot("card-seen");
  const photos = await kept();
  expect(JSON.stringify(photos) === JSON.stringify([["Georgie", "cardinal", "image/jpeg", 1024]]), `photos kept: ${JSON.stringify(photos)}`);
  await press("card-close");
  expect(await sticker(), "no sticker in the Field Guide");
  await shot("guide-sticker");

  // Closed and opened again: the photo comes back from the device.
  await send("Page.reload");
  await sleep(1500);
  await openCardinal();
  await press("cardinal-slot");
  await sleep(500);
  expect(await evaluate(`document.getElementById("card-seen-image").naturalWidth > 0`), "the photo did not come back after a reload");
  await shot("card-after-reload");
  await press("card-close");
  await press("guide-close");

  // Dora has her own Field Guide: no sticker and no polaroid. Removing Georgie removes the photo.
  await evaluate(`[...document.querySelectorAll("#player-names button")].find(button => button.textContent.includes("Dora")).id = "dora"`);
  await press("dora");
  await openCardinal();
  expect(!await sticker(), "Dora has Georgie's sticker");
  await press("cardinal-slot");
  expect(!await visible("card-seen"), "Dora sees Georgie's polaroid");
  await press("card-close");
  await press("guide-close");
  await press("players-button");
  // Remove asks for a second tap, and each tap draws the list again.
  for (let tap = 0; tap < 2; tap++) {
    await evaluate(`document.querySelector('[aria-label="Remove Georgie"]').id = "remove-georgie"`);
    await press("remove-georgie");
  }
  await sleep(300);
  const left = await kept();
  expect(left.length === 0, `photos left after removing Georgie: ${JSON.stringify(left)}`);

  ws.close();
  await new Promise(done => { chrome.once("exit", done); chrome.kill(); });
  rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  return errors.map(error => `${mode}: ${error}`);
}

const problems = [];
for (const mode of MODES) problems.push(...await check(mode));
for (const problem of problems) console.log("problem:", problem);
console.log(problems.length ? "FAIL" : `PASS: ${MODES.join(" and ")}: photo picked, shown, kept shrunk, back after a reload, one player's only, gone with the player`);
process.exit(problems.length ? 1 : 0);
