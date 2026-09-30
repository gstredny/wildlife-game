// Freshwater, woodland, and sea turtles use different shells and feet.
import { eye, line, oval } from './paint-shapes.js';
const TURTLES = {
  slider: { shell: '#57765b', skin: '#83a66c', red: true },
  boxTurtle: { shell: '#977c51', skin: '#b59c65', dome: true },
  seaTurtle: { shell: '#829186', skin: '#aebcaf', flippers: true }
};
function paintTurtle(c, size, time, state, turtle) {
  c.save(); c.scale(size, size);
  for (const dx of [-0.32, 0.28]) {
    const motion = state.walking ? Math.sin(time * 6 + dx * 8) * 0.08 : 0;
    oval(c, dx, -0.08, turtle.flippers ? 0.26 : 0.08, 0.08, turtle.skin, motion - (turtle.flippers ? 0.35 : 0));
  }
  line(c, [[-0.42, -0.14], [-0.67, -0.08]], turtle.skin, 0.055);
  oval(c, 0.43, -0.19, 0.23, 0.13, turtle.skin);
  oval(c, 0.03, -0.28, 0.48, turtle.dome ? 0.36 : 0.24, turtle.shell);
  for (let n = 0; n < 5; n++) line(c, [[-0.33 + n * 0.15, -0.39], [-0.28 + n * 0.13, -0.1]], '#384d45', 0.025);
  line(c, [[-0.37, -0.24], [0.43, -0.24]], '#c5be8e', 0.02);
  if (turtle.red) line(c, [[0.42, -0.24], [0.5, -0.22]], '#dd6050', 0.05);
  eye(c, 0.55, -0.24, time);
  c.restore();
}
export const TURTLE_PAINTERS = Object.fromEntries(Object.entries(TURTLES).map(([kind, turtle]) =>
  [kind, (c, size, time, state = {}) => paintTurtle(c, size, time, state, turtle)]));
export const TURTLE_BOXES = Object.fromEntries(Object.keys(TURTLES).map(kind =>
  [kind, { left: -0.73, right: 0.7, top: -0.68 }]));
