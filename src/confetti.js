// A burst of paper confetti over the whole screen, for beating a level. The pieces fall with CSS
// (see .confetti in style.css) and are cleared once the last one is down.
const COLORS = ["#ffd166", "#ef476f", "#06d6a0", "#118ab2", "#fff7e6", "#f78c6b"];
const PIECES = 70;
const CLEAR_AFTER = 4500;

export function throwConfetti(layer) {
  layer.replaceChildren(...Array.from({ length: PIECES }, (_, index) => {
    const piece = document.createElement("i");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = COLORS[index % COLORS.length];
    piece.style.animationDelay = `${Math.random() * 0.9}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 1.5}s`;
    return piece;
  }));
  setTimeout(() => layer.replaceChildren(), CLEAR_AFTER);
}
