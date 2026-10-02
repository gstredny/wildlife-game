# Active handoff — Wildlife Game

2026-10-02. Branch main, pushed. Live on GitHub Pages: https://gstredny.github.io/wildlife-game/
(cache wildlife-habitats-v13; live browser-seen PASS, live backyard walk PASS on desktop and phone).

Active task: [008-seen-for-real.md](008-seen-for-real.md), done and live; not yet tried on a
real iPhone. A Field Guide card has "📷 I saw one for real!": the child's own photo shows as a polaroid
with the day, a gold 📷 sticker goes on the Field Guide square, the photo is kept shrunk in IndexedDB
per player. `npm test` 88/0/0; `node tools/browser-seen.mjs desktop phone` PASS; habitats 12 of 12
PASS. Cache name bumped to wildlife-habitats-v13. Not tried on a real iPhone yet.

Before that: [007-name-the-animal.md](007-name-the-animal.md), done and live. Every animal met on a
walk asks "What is this?" with three names (the right one plus two random animals, mixed up every
time); a wrong name grays out. Every walk hides every animal in its bush again, even ones already in
the Field Guide. A paw per animal in the top bar turns gold when named right on the first try; the
cheer says how many. Also from George, same day: fire ants, pinecones, and acorns (levels 1 to 3) can
be squished by landing on them; Try again after a game over starts at the last bush; big name
buttons on the trail map switch players in one tap (the players screen shows just names); the Learn
more link is gone from the card.

Verified: `npm test` 85 passed, 0 failed, 0 skipped. Local and live browser batch 12 of 12 PASS each.

Before that: [006-trail-map.md](006-trail-map.md) (trail map, levels in order, three players),
[005-lives.md](005-lives.md) (hearts, game over), [004-mario-level.md](004-mario-level.md)
(bushes, hazards, goal flag), [003-voice-guess-players-jumping.md](003-voice-guess-players-jumping.md).

Open:
- Not heard by George yet: the Master Ranger line, `afplay voice/69fdeb95904a.mp3` (checker 4% off,
  not flagged), and the Katy Prairie welcome from task 004, `afplay voice/0477f7ebd124.mp3`.
- `tools/browser-walk.mjs` waits forever for a Chrome reply; a hung phone run eats the batch. A
  per-command timeout would fail it in seconds. Meanwhile run levels one at a time under
  `perl -e 'alarm 420; exec @ARGV' --`.
- Ideas not built: the same guess card and trail map in the fish game. Ranger Mike reading the three
  name choices aloud (needs 60 new recordings). Locking the phone sideways: iPhone Safari can't
  (George dropped it; Guided Access with Motion off does it on the phone itself).
- Not used any more: the "again" lines (`againLines` in animals.js) still have recordings but no
  longer play, since every picture now opens the card. The photo-source link still leaves the game.
- Older: look-alike drawings (armadillo, nutria, opossum, otter), the kestrel drawing, and the
  photo-source link still showing under a fallback drawing.
