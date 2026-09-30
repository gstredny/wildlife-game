# Active handoff — Wildlife Game

2026-09-30. Branch main, pushed. Live on GitHub Pages: https://gstredny.github.io/wildlife-game/

Active task: [002-texas-habitats.md](002-texas-habitats.md).

Implemented: 6 habitats, 51 species, per-habitat progress, global/habitat Field Guide, TPWD/Cornell
source links, 276 Ranger Mike clips, and a browser walk for every habitat. Review fixes on top: all
51 photos are local WebPs (4 hard-to-see photos swapped), Field Guide uses 400px thumbnails, voice
clips keep their own cache across updates, and the home screen fits without scrolling on desktop,
tablets and sideways phones.

Verified: `npm test` 32 passed, 0 failed, 0 skipped. `node tools/browser-habitats.mjs desktop phone`
passed on the final tree: exit 0, 12 runs (6 places x desktop/phone), no page errors.
Zoo sheet: all 43 new drawings render and fit their tap boxes.

Open:
- Drawing quality: several new drawings share one body shape (armadillo, nutria, opossum, otter)
  and the kestrel reads poorly.
- Small: when a photo fails to load, the "Photo source and license" link still shows under the
  labeled drawing.
