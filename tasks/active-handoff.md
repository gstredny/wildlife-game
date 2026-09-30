# Active handoff — Wildlife Game

2026-09-30. Branch main, pushed. Live on GitHub Pages: https://gstredny.github.io/wildlife-game/
(built 50ab791; a live phone walk of the Katy Prairie passed).

Active task: [004-mario-level.md](004-mario-level.md). George asked for Mario-style levels: things
coming at you, and reaching a spot to meet each animal. Slice 1 (pinecones roll at you; a hit bumps
you back and you blink; no game over) is done and committed on main, NOT pushed, NOT live. Next:
slice 2, animals hide in "?" bushes you run to. Cache wildlife-habitats-v4 (local only).

Previous task: [003-voice-guess-players-jumping.md](003-voice-guess-players-jumping.md).

Done and live: Ranger Mike re-recorded in Qwen3-TTS `ryan` (George picked it by ear) with a
speech-to-text check per clip and `tools/say-like.json` respellings; new animal cards ask "What animal
is this?" and wait for **Tell me!**; players with their own Field Guides and latest finds; logs to jump
and stars to catch on every trail; nine Katy animals (60 in all). Cache wildlife-habitats-v3.

Verified: `npm test` 43 passed, 0 failed, 0 skipped. `node tools/browser-habitats.mjs desktop phone`
on the final tree (see the task file).

Open:
- Ideas not built: the same guess card in the fish game. (Hazards and the star total at the trail
  end are now slices 3 and 4 of task 004.)
- Older: look-alike drawings (armadillo, nutria, opossum, otter), the kestrel drawing, and the
  photo-source link still showing under a fallback drawing.
