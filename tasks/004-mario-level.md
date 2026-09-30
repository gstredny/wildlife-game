# Make each place a Mario-style level

Date: 2026-09-30
Status: slice 1 done and committed locally (not pushed, not live); slices 2–4 not started

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
- [ ] Pushed and live: waits for George's OK to push.

Slices 2–4: criteria written when each starts.

## Attempt log (append-only)

- Slice 1 (pinecones): lanes in every gap without a log (`src/course.js`); `src/hazards.js` says where a
  lane's pinecone is from the time alone (drop 0.5 s, roll 170/s, one every 2.8 s); `src/trail.js` bumps
  the explorer (little hop, slide back 0.3 s, blink 1.2 s, no second bump while blinking). A bump pauses
  a tap-walk and it carries on, so tapping still reaches every animal. Drawn by `src/paint-hazards.js`;
  "bonk" sound. First radius 18 looked small on a 1280x720 shot; now 22.
  `npm test`: 47 passed, 0 failed, 0 skipped.
