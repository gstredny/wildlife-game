// Export the new species' canvas drawings as local SVG card fallbacks.
import { writeFileSync } from 'node:fs';
import { NEW_PHOTOS } from '../src/photos-new.js';
import { BOXES, PAINTERS } from '../src/painters.js';

function drawingContext() {
  const elements = [];
  let path = '';
  let transform = '';
  const stack = [];
  const c = {
    fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, lineCap: 'round', lineJoin: 'round',
    save() { stack.push({ transform, fillStyle: this.fillStyle, strokeStyle: this.strokeStyle, lineWidth: this.lineWidth }); },
    restore() { const state = stack.pop(); transform = state.transform; Object.assign(this, state); },
    translate(x, y) { transform += ` translate(${x} ${y})`; },
    scale(x, y) { transform += ` scale(${x} ${y})`; },
    beginPath() { path = ''; },
    moveTo(x, y) { path += `M${x},${y} `; },
    lineTo(x, y) { path += `L${x},${y} `; },
    closePath() { path += 'Z '; },
    fill() { elements.push(`<path d="${path}" fill="${this.fillStyle}" transform="${transform}"/>`); },
    stroke() { elements.push(`<path d="${path}" fill="none" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" stroke-linecap="round" stroke-linejoin="round" transform="${transform}"/>`); },
    ellipse(x, y, rx, ry, angle) {
      const rotation = angle * 180 / Math.PI;
      // All fallback painters use complete ellipses; preserve their fill through fill().
      path = '';
      this.fill = () => {
        elements.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${this.fillStyle}" transform="${transform} rotate(${rotation} ${x} ${y})"/>`);
        this.fill = fillPath;
      };
    },
    fillRect(x, y, w, h) { elements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${this.fillStyle}" transform="${transform}"/>`); }
  };
  const fillPath = c.fill;
  return { context: c, svg: () => elements.join('\n') };
}
for (const [kind, photo] of Object.entries(NEW_PHOTOS)) {
  const box = BOXES[kind];
  const size = Math.min(780 / (box.right - box.left), 540 / -box.top);
  const { context, svg } = drawingContext();
  context.translate(480 - (box.left + box.right) * size / 2, 620);
  PAINTERS[kind](context, size, 0, {});
  const output = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">\n<rect width="960" height="720" fill="#e0ead4"/>\n${svg()}\n</svg>\n`;
  writeFileSync(new URL(`../${photo.fallback}`, import.meta.url), output);
}
console.log(`Exported ${Object.keys(NEW_PHOTOS).length} original species illustrations`);
