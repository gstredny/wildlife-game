# Active handoff — Wildlife Game

2026-09-30. Branch main, pushed. Live on GitHub Pages: https://gstredny.github.io/wildlife-game/
(built 1e15135; live browser check 12 of 12 PASS).

Active task: [005-lives.md](005-lives.md), done and live. Like Super Mario Land, a hazard hit now
kills: the explorer tumbles off, loses one of three hearts, and starts again at the last bush reached;
no hearts left is game over (Try again / Home, Ranger Mike says so). Hazards were tuned so every jump
window is about half a second or more, and a hazard can't hit while dropping in, just after landing,
or flying away. A careful-child test plays every place without dying. Cache wildlife-habitats-v7.

Verified: `npm test` 72 passed, 0 failed, 0 skipped. `node tools/browser-habitats.mjs desktop phone`
12 of 12 PASS, local and live.

Before that: [004-mario-level.md](004-mario-level.md) (bushes, hazards, goal flag).
Previous task: [003-voice-guess-players-jumping.md](003-voice-guess-players-jumping.md).

Open:
- Ideas not built: the same guess card in the fish game.
- Not heard by George yet: the Katy Prairie welcome the checker flagged (its words were all right):
  `afplay voice/0477f7ebd124.mp3`.
- Older: look-alike drawings (armadillo, nutria, opossum, otter), the kestrel drawing, and the
  photo-source link still showing under a fallback drawing.
