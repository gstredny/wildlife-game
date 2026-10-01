# One trail at a time, like Donkey Kong Country

Date: 2026-10-01
Status: done and live (pushed to main; GitHub Pages https://gstredny.github.io/wildlife-game/)

## Intent contract (George's words)

"Can you make it kinda like Donkey Kong Country Super Nintendo where you don't see the next level;
there's just—you start a new game, and you only have that level until you get to the end. Where you
walk through the end or whatever, that means you beat the level, and it cheers, and then you move on
to the next one. And then each player...you can add up to three players. And their levels are saved,
so like George, he made it to level 3, the Bayou Trail, and it's saved there until he beats it, and
then Dora only makes it to level 1, then her level 1 is saved where she was. Can you add that feature?
And be creative and brave and ambitious."

Today: the home screen shows all six places; anyone can play any of them in any order. Players are
unlimited. Reaching the goal flag shows the Junior Ranger cheer with "Keep exploring" and "Home".

After:
1. The six places are levels 1 to 6, in a fixed order: Backyard Safari, Woodland Walk, Bayou Trail,
   Swamp Boardwalk, Katy Prairie, Gulf Shore. (Bayou Trail is level 3, as George said.)
2. The home screen is a trail map: the level you are on is the big card; beaten levels are gold
   badges you can play again; the levels ahead are misty "?" stops with no name.
3. Reaching the goal flag beats the level: the cheer, confetti, and "A new trail opened: X!" with a
   "Next trail" button that starts it. Beating level 6 makes you a Master Ranger (new recorded line).
4. Each player's level is saved on the device. Switching players switches the map.
5. Up to three players. With three, the add form goes away; a player can be removed (tap twice).
6. A player saved before the trail map starts at the first level whose animals they haven't all
   found, so nobody's finds are wasted.

Assumptions (George vetoes in one line): the level number is saved, not the spot inside the level
(as in Donkey Kong Country); beaten levels can be replayed; one new Ranger Mike line (the finale).

## Done criteria

- [x] `npm test`: all pass, including the level order, beating a level opens the next, a locked
  level can't be started, the three-player cap and removal, the migration of old finds, and the
  screen flow playing all six levels in order to the Master Ranger panel.
- [x] The finale line recorded (make-voice.py).
- [x] `node tools/browser-habitats.mjs desktop phone`: all six levels, no page errors (12 of 12).
- [x] Screenshots looked at: the trail map (level 1, a beaten badge, misty stops), the cheer with
  the next trail named, the players screen with levels, the phone layout.
- [x] Pushed and live; a live browser walk passes (12 of 12).

## Attempt log (append-only)

- Rules (`src/levels.js`): `LEVELS` is the order (backyard, woods, bayou, swamp, prairie, gulf);
  `player.level` is the level they are on, from 1, or 7 once all are beaten; `beatLevel` opens the
  next only for the level they are on; `startingLevel(found)` migrates old players. `players.js`:
  `level` on each record, `MAX_PLAYERS` 3, `removePlayer` (never the last; the current hands over to
  the first left). 12 tests, green.
- Screen: `place-view.js` is now the trail map (`fillMap`: hero card for the level you are on, or
  the Master Ranger card; one stop per level: gold ★ badge button for beaten, pulsing numbered dot
  for now, dotted "?" for locked). `players-view.js` shows "Level 3 · Bayou Trail" and a Remove
  button that asks for a second tap. `main.js`: `reachGoal` beats the level and saves at the flag,
  then confetti (`confetti.js`) and the cheer naming the trail opened; `ranger-next` starts it;
  `ranger-close` ("Keep exploring") is gone, `ranger-home` is "Trail map". HUD shows "Level N".
  `npm test` 80 passed, 0 failed, 0 skipped (after the recording and cache list).
- Voice: the finale line recorded with the cached models offline (`HF_HUB_OFFLINE=1`): 1 try, 4%
  off, `voice/69fdeb95904a.mp3`. Cache wildlife-habitats-v8 (+ `src/levels.js`, `src/confetti.js`).
- Browser check (`tools/browser-walk.mjs`) now seeds a saved Explorer on the level under test,
  checks the cheer names the next trail, presses Trail map, opens the guide from the home screen, and
  after the offline reload checks the level is a beaten badge. Desktop backyard: PASS, 11 animals,
  "A new trail opened: Woodland Walk!", map after reload shows Level 2.
- Screenshots looked at: trail map (level 1, five misty stops), the cheer with confetti and the next
  trail named, the map after with the gold badge and Level 2 revealed, the players screen with
  levels and Remove, the map on a sideways phone (fits, no scroll) and an upright phone (stops wrap
  three and three).
- Full browser check `OUT=screenshots/walk node tools/browser-habitats.mjs desktop phone`: 10 PASS
  (every desktop level, phone backyard, woods, bayou, swamp), then the phone prairie run hung after
  the snow goose card (no reply from Chrome to a touch command; the batch sat until its time limit,
  a headless Chrome left behind, killed by hand). Same flake as task 004. Run again one at a time:
  phone prairie PASS (15 animals, 1 game over then Try again, "A new trail opened: Gulf Shore!"),
  phone gulf PASS (9 animals, "You explored every trail around Katy, Texas!", map after reload shows
  the Master Ranger card). So 12 of 12 level-and-device runs passed, no page errors. Screenshots looked
  at: the Master Ranger cheer with the medal (desktop gulf), the map with six gold badges, the phone
  cheer, the phone players screen with levels.
- Open: `tools/browser-walk.mjs` waits forever for a Chrome reply; a per-command timeout would fail a
  hung run in seconds instead of eating the batch. Not changed here (not part of this ask).
- Deployed: `git push origin main` b502010..29f5763; live sw.js is wildlife-habitats-v8 and serves
  `src/levels.js` and the Master Ranger clip. Live check, each run under a 7-minute alarm:
  `GAME=https://gstredny.github.io/wildlife-game/ node tools/browser-walk.mjs <mode> <level>` for
  desktop and phone, all six levels: 12 of 12 PASS, no page errors, no hangs; every cheer named the
  next trail, and both gulf runs ended "You explored every trail around Katy, Texas!".
