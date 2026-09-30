# Make each place a Mario-style level

Date: 2026-09-30
Status: done and live (pushed to main; GitHub Pages https://gstredny.github.io/wildlife-game/)

## Intent contract (George's words)

"Can we work on making it more like objective-oriented? Like they have to get somewhere to find the
animal, not just you're walking through and clicking animals. They're not gonna want to play that like
Mario; there going towards a location. I like how you can run and jump, but like stuff should be coming
at you; you have to avoid it. And then you get to a spot and you learn about that animal. Think Super
Mario Land for Super Nintendo type vibes."

Today: each place is a flat trail with logs and stars. Every animal stands in the open; the child taps
it (or walks near and taps the camera) to take its picture. Nothing comes at the explorer.

After:
1. Things come at you: pinecones drop in and roll toward the explorer. Jump over them. A hit bumps
   the explorer back and makes them blink for a moment. Nobody loses; there is no game over.
2. Animals hide at stops: each animal waits in a "?" bush. Reaching the bush brings it out and opens
   its card. No tapping animals from far away.
3. Each place has its own hazard (fire ants, tumbleweeds, crabs, and so on).
4. A goal flag at the trail end shows the stars caught.

Assumptions (George vetoes in one line): the six places stay; each is one level; no new Ranger Mike
lines until slice 2 or later (new lines mean recording the voice again).

## Done criteria

Slice 1 (pinecones):
- [x] `npm test`: all pass, including new pinecone rules (roll toward you, bump, blink, jump clears).
  47 passed, 0 failed, 0 skipped.
- [x] `node tools/browser-habitats.mjs desktop phone`: all six places, no page errors. 12 of 12 PASS;
  swamp desktop run again after the radius change: PASS, 14 animals, no page errors.
- [x] Screenshot of a pinecone rolling at the explorer, looked at (scratch pose page on the bayou and
  woods; in the real game, `desktop-woods-13-walking-10.5s.png` shows one rolling past).
- [x] Pushed with slices 2–4 (George chose "build step 2 now, then push both together", then
  "finish it all").

Slices 2–4 (George: "finish it all"):
- [x] `npm test`: all pass, including hiding spots, one hazard kind per place (each bumps and can be
  jumped), the goal flag reported once with every animal found, and the recording check.
  66 passed, 0 failed, 0 skipped.
- [x] Ranger Mike's six new welcome lines recorded (make-voice.py: generated 6, reused 311, pruned 13).
  One flagged (Katy Prairie, 8% off); the checker's words were all right ("Katie Prairie",
  "fifteen" for 15), so no retake. George can listen: `afplay voice/0477f7ebd124.mp3`.
- [x] `node tools/browser-habitats.mjs desktop phone`: 12 of 12 PASS, every animal found, Junior
  Ranger at the flag ("You found all 14 animals and caught 39 of 39 stars!" on the swamp), no page
  errors.
- [x] Screenshots looked at: "?" bushes (bayou, beach, phone bayou), all six hazards, the flag down and
  raised, the Junior Ranger panel over the raised flag.
- [x] Pushed and live on GitHub Pages; the live page serves the new code.

## Attempt log (append-only)

- Slice 1 (pinecones): lanes in every gap without a log (`src/course.js`); `src/hazards.js` says where a
  lane's pinecone is from the time alone (drop 0.5 s, roll 170/s, one every 2.8 s); `src/trail.js` bumps
  the explorer (little hop, slide back 0.3 s, blink 1.2 s, no second bump while blinking). A bump pauses
  a tap-walk and it carries on, so tapping still reaches every animal. Drawn by `src/paint-hazards.js`;
  "bonk" sound. First radius 18 looked small on a 1280x720 shot; now 22.
  `npm test`: 47 passed, 0 failed, 0 skipped.
- George: "yes finish it all please" (build slices 2–4, then push together).
- Slice 2 (bushes): a hiding animal is found by coming within 50 of its spot (`SPOT`); a step is at
  most 16.5, so no spot can be skipped. Hiding animals can't be tapped or photographed from afar; found
  ones stay out and the camera re-snaps them. The camera glow and the "tap it" first tip went away
  (nothing new to glow for). A tap-walk stops at the first bush on the way. Phone bayou walk: PASS.
- Slice 3 (hazards): `HAZARDS` in `src/hazards.js` (speed, size, bump box, drop, lift/bob, hop);
  lanes carry the place's kind; each lane's gap between hazards is its own (`cycle`). Hits now need
  the hazard between the explorer's feet and head, so a pinecone dropping in bonks only when it
  comes down to head height. Ants and acorns looked too small on screenshots; made bigger.
- Slice 4 (flag): the goal flag stands where the end is reached; `walk.endedAt` raises it over 0.8 s
  with the fanfare, and 0.9 s later the Junior Ranger panel shows "You found all N animals and caught
  S of T stars!". The old "walk back for the animals you missed" line is gone (none can be missed).
- Voice: six new welcomes recorded, 13 old clips pruned (six welcomes, six trail-end lines, the tip).
  Final checks on eebae5a: `npm test` 66 passed, 0 failed, 0 skipped; `git diff --check` clean;
  `node tools/browser-habitats.mjs desktop phone` 12 of 12 PASS, no page errors.
- Deployed: `git push origin main` d8d8982..2c38ea3; GitHub Pages "built 2c38ea3"; live sw.js is
  wildlife-habitats-v4 and serves `src/paint-hiding.js` and the new clips. Live phone walk of the
  Backyard (`GAME=https://gstredny.github.io/wildlife-game/ node tools/browser-walk.mjs phone
  backyard`): PASS, 11 animals, Junior Ranger shown, no page errors.
- George: "the mosquitoes are disappearing before they get to me. Everything else looks to be working
  well." Cause: every lane ended 120 short of the bush on its left (kept bushes safe), and a child
  stands at that bush after each card, so every hazard vanished just in front of them; mosquitoes
  showed it most, vanishing in mid-air. Fix (eb03c3e): lanes run past the bush to the log behind it;
  a flier flies up and off the screen at its lane's end. New tests: a child waiting at each place's
  bush gets reached; a mosquito's last height is off the top of the screen. `npm test` 68 passed,
  0 failed, 0 skipped; `node tools/browser-habitats.mjs desktop phone` 12 of 12 PASS, no page errors.
  Cache wildlife-habitats-v5.
- George: "Checked every one to make sure they all work." After the mosquito fix: live site
  `GAME=https://gstredny.github.io/wildlife-game/ node tools/browser-habitats.mjs desktop phone`
  12 of 12 PASS. Screenshots of all six hazards at a child waiting at the bush (each reaches them) and
  at the lane end: rollers and ants stop at the log, the mosquito flies off, but a tumbleweed or beach
  ball could vanish mid-bounce beside the log. Fix (eb9ef10): a ball's bounces fit its lane, so it
  lands at the end; test checks the first and last height on every prairie and gulf lane. `npm test`
  69 passed, 0 failed, 0 skipped; local browser check 12 of 12 PASS. Cache wildlife-habitats-v6.
- Deployed eb9ef10 (Pages "built 47298c8", live sw.js wildlife-habitats-v6). Live check
  `node tools/browser-habitats.mjs desktop phone`: 10 PASS, then the batch stopped right after the
  prairie phone run's first screenshot (start screen, before any play) with no result line; cause not
  found (the filter hid the output). Re-run one by one on the live site: prairie phone PASS (15
  animals), gulf phone PASS (9 animals), no page errors. So all 12 place-and-device runs passed live.
