# Active handoff — Wildlife Game

2026-09-30. Branch main, pushed. Live on GitHub Pages: https://gstredny.github.io/wildlife-game/
(built 50ab791; a live phone walk of the Katy Prairie passed).

Active task: [003-voice-guess-players-jumping.md](003-voice-guess-players-jumping.md).

Done and live: Ranger Mike re-recorded in Qwen3-TTS `ryan` (George picked it by ear) with a
speech-to-text check per clip and `tools/say-like.json` respellings; new animal cards ask "What animal
is this?" and wait for **Tell me!**; players with their own Field Guides and latest finds; logs to jump
and stars to catch on every trail; nine Katy animals (60 in all). Cache wildlife-habitats-v3.

Verified: `npm test` 43 passed, 0 failed, 0 skipped. `node tools/browser-habitats.mjs desktop phone`
on the final tree (see the task file).

Open:
- Ideas not built: fire ants or other hazards, a star total at the trail end, the same guess card in
  the fish game.
- Older: look-alike drawings (armadillo, nutria, opossum, otter), the kestrel drawing, and the
  photo-source link still showing under a fallback drawing.
