// Small drawing primitives shared by the bird, mammal, reptile, and insect painters.
export function oval(c, x, y, rx, ry, color, rotation = 0) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  c.fill();
}
export function shape(c, points, color) {
  c.fillStyle = color;
  c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.closePath();
  c.fill();
}
export function line(c, points, color, width = 0.035) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.stroke();
}
export function eye(c, x, y, time) {
  oval(c, x, y, 0.032, Math.sin(time * 1.7) > 0.995 ? 0.008 : 0.032, '#172523');
  oval(c, x + 0.01, y - 0.01, 0.009, 0.009, '#fff');
}
