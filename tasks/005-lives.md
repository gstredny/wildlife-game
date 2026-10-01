# Getting hit means you die, like Super Mario Land

Date: 2026-09-30
Status: in progress

## Intent contract (George's words)

"One thing I noticed is you didn't die when you got hit by an acorn. I thought it was like Mario; if
you get hit, then you died. The whole point is to try to make it through the game, right? So again,
needs to be like Super Mario Land." "When you're done, commit and push it live so I can test on my
phone."

Today: a hit bumps the explorer back and they blink; nothing is lost.

After:
1. A hit kills the explorer: they tumble off the screen with a sad sound.
2. Three hearts per level, shown in the corner; each death costs one.
3. After a death the explorer starts again at the last bush they reached, blinking for a moment so
   nothing hits them straight away.
4. Losing the last heart is game over: Ranger Mike says so, and the child can try the level again
   from the start or go home. Animals already found stay in the Field Guide.
5. Every level can be finished without dying by jumping at the right time (a test plays each one
   like a careful child).

## Done criteria

- [x] `npm test`: all pass, including death, starting again at the last bush, the blink after it,
  game over, and a careful child finishing every level with all three hearts.
- [x] The game-over line recorded (make-voice.py).
- [x] `node tools/browser-habitats.mjs desktop phone`: all six places, no page errors (12 of 12).
- [x] Screenshots looked at: the tumble, the hearts, the game-over panel.
- [ ] Pushed and live; a live browser walk passes.

## Attempt log (append-only)

- Rules (`src/trail.js`): a hit sets `dying` (1.6 s tumble: pop up 900, fall through the path) and costs
  a heart; then the explorer starts again at `checkpoint` (the furthest bush reached) with `safe` 1.5 s
  of blinking, or `{ gameOver }` once with no hearts left, after which the walk does nothing. Bump,
  push and the "bonk" sound are gone.
- Fairness, found by the new careful-child test (`tests/careful.js`): a mosquito dropping in landed on
  the child before they could react, and one flying away rose into a child jumping off a log. Now a
  hazard can't hit while `falling` (drop-in) or `leaving` (fly-away). With that, a careful child
  finishes all six places with all three hearts.
- Screen: hearts in the HUD, a spinning tumble, a "wah-wah" sound, a game-over panel with Try again
  and Home, and Ranger Mike's "Oh no! You're out of hearts. Let's try again!" (recorded, 0% off).
- Tests: the screen tests read the walk through `currentWalk()` from `src/main.js`, so a careful
  player can play the screen flow and a careless one can reach game over and Try again.
- Browser check: it now plays like the careful child, looking ~30 times a second, and taps Try again
  after a game over. Phone mode jammed Chrome's touch input when a card opened under a held finger;
  it now lifts its fingers on a find, a hit or the flag and waits for the panel. Phone bayou: PASS,
  14 animals, 1 game over then Try again; screenshots: game-over panel, hearts 2 of 3, the tumble.
  `npm test` 72 passed, 0 failed, 0 skipped. Cache wildlife-habitats-v7.
- Local browser check (f3d3a75): swamp, bayou, woods, backyard PASS; prairie desktop FAIL (15 of 15
  found, 3 game overs, out of steps before the flag). Measured why: the time window to start a jump
  that clears each hazard was 0.26 s (tumbleweed), 0.27 (beach ball), 0.28 (mosquito), 0.30 (fire
  ants), against 0.42 (pinecone) and 0.46 (acorn); a careful child reacting 0.15-0.2 s late died 3-9
  times per level. Tuned: mosquito, tumbleweed and beach ball slower with lower bob/bounces; smaller
  hit boxes; the explorer's jump 820 -> 900 (rises ~175, floatier, like Mario) and a hit zone 18 wide
  each side instead of the 26 body. Windows now 0.46-0.59 s. A hazard stays harmless 0.25 s after it
  lands, so it never lands on a child. Stars over a log now need a timed jump (the higher jump can sail
  over them). The careful child is now simply "run right, jump at logs and anything within 150";
  with a 0.2 s reaction delay it loses 0-2 hearts per level (was 7-9). `npm test` 72 passed, 0 failed.
- Local browser check on 1726cc5: `node tools/browser-habitats.mjs desktop phone` 12 of 12 PASS, no page
  errors (the looking bot hit game over once in woods desktop, woods phone and prairie phone, then
  finished after Try again).
