// Screenshots one page in its own muted, headless Chrome, then closes it. No packages (Node 22+).
//
//   python3 -m http.server 8790 --bind 127.0.0.1 &
//   node tools/shot.mjs http://127.0.0.1:8790/tools/zoo.html screenshots/zoo.png [1400x900] [waitMs]
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const [url, out, size = "1400x900", wait = "800"] = process.argv.slice(2);
if (!url || !out) {
  console.error("usage: node tools/shot.mjs <url> <out.png> [WIDTHxHEIGHT] [waitMs]");
  process.exit(2);
}
const [width, height] = size.split("x").map(Number);
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = mkdtempSync(join(tmpdir(), "wildlife-shot-"));
const port = 9500 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ["--headless=new", "--mute-audio", `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// Chrome keeps writing its profile until it exits, so the profile goes only after that.
const done = code => {
  chrome.once("exit", () => { rmSync(profile, { recursive: true, force: true, maxRetries: 5 }); process.exit(code); });
  chrome.kill();
};

let target = null;
for (let tries = 0; tries < 50 && !target; tries++) {
  await sleep(100);
  try { target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json(); } catch {}
}
if (!target) { console.error("shot: Chrome did not start"); done(1); }
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

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url });
await sleep(Number(wait));
const { result } = await send("Page.captureScreenshot", { format: "png" });
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(result.data, "base64"));
console.log("shot", out);
for (const error of errors) console.log("page error:", error);
done(errors.length ? 1 : 0);
