// Draws every animal (or ?only=heron,deer) in six frames: still, later, walking twice, alert, and small.
// The dashed box is BOXES[kind], which the game uses to tell whether a tap hit the animal.
// ?size=160 sets the big size. Open with tools/shot.mjs to get a screenshot.
import { BOXES, PAINTERS } from "../src/painters.js";

const params = new URLSearchParams(location.search);
const kinds = params.get("only")?.split(",") ?? Object.keys(PAINTERS);
const size = Number(params.get("size") ?? 150);
const FRAMES = [
  { label: "still t=0", time: 0, state: {} },
  { label: "still t=1.3", time: 1.3, state: {} },
  { label: "walk t=0.1", time: 0.1, state: { walking: true } },
  { label: "walk t=0.35", time: 0.35, state: { walking: true } },
  { label: "alert", time: 0.6, state: { alert: true } },
  { label: "small", time: 0, state: {}, small: true }
];
const widest = Math.max(...kinds.map(kind => BOXES[kind].right - BOXES[kind].left));
const cell = { w: Math.max(size * widest + 40, 220), h: size * 1.35 + 40 };
const canvas = document.getElementById("zoo");
canvas.width = cell.w * FRAMES.length;
canvas.height = cell.h * kinds.length;
const context = canvas.getContext("2d");
context.font = "14px system-ui";

kinds.forEach((kind, row) => {
  FRAMES.forEach((frame, column) => {
    const scale = frame.small ? 60 : size;
    const box = BOXES[kind];
    const x = column * cell.w + 20 - box.left * scale;
    const y = row * cell.h + cell.h - 30;
    context.fillStyle = "#b9c99a";
    context.fillRect(column * cell.w, y, cell.w, 30);
    context.fillStyle = "#333";
    context.fillText(`${kind} · ${frame.label}`, column * cell.w + 8, row * cell.h + 18);
    context.save();
    context.translate(x, y);
    PAINTERS[kind](context, scale, frame.time, frame.state);
    context.restore();
    context.setLineDash([5, 4]);
    context.strokeStyle = "#d33";
    context.strokeRect(x + box.left * scale, y + box.top * scale, (box.right - box.left) * scale, -box.top * scale);
    context.setLineDash([]);
  });
});
