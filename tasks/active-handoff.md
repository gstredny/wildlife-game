# Active handoff — Wildlife Game

2026-10-01. Branch main, pushed. Live on GitHub Pages: https://gstredny.github.io/wildlife-game/
(built 29f5763; live browser check 12 of 12 PASS).

Active task: [006-trail-map.md](006-trail-map.md), done and live. Like Donkey Kong Country, the six
places are levels 1 to 6 (Backyard, Woods, Bayou, Swamp, Prairie, Gulf), played one at a time. The
home screen is a trail map: the level you are on as a big card, beaten levels as gold badges to replay,
the levels ahead as misty "?" stops. The goal flag beats the level and saves it at once; confetti, the
cheer names the trail that opened, and Next trail starts it; the sixth gives the Master Ranger cheer
(new recorded line). Up to three players, each on their own level; Remove needs a second tap. A player
saved before the map starts past the levels whose animals they had all found. Cache
wildlife-habitats-v8.

Verified: `npm test` 80 passed, 0 failed, 0 skipped. `node tools/browser-habitats.mjs desktop phone`
12 of 12 PASS local (phone prairie hung once in the batch, passed alone) and 12 of 12 PASS live.

Before that: [005-lives.md](005-lives.md) (hearts, game over), [004-mario-level.md](004-mario-level.md)
(bushes, hazards, goal flag), [003-voice-guess-players-jumping.md](003-voice-guess-players-jumping.md).

Open:
- Not heard by George yet: the Master Ranger line, `afplay voice/69fdeb95904a.mp3` (checker 4% off,
  not flagged), and the Katy Prairie welcome from task 004, `afplay voice/0477f7ebd124.mp3`.
- `tools/browser-walk.mjs` waits forever for a Chrome reply; a hung phone run eats the batch. A
  per-command timeout would fail it in seconds. Meanwhile run levels one at a time under
  `perl -e 'alarm 420; exec @ARGV' --`.
- Ideas not built: the same guess card and trail map in the fish game.
- Older: look-alike drawings (armadillo, nutria, opossum, otter), the kestrel drawing, and the
  photo-source link still showing under a fallback drawing.
