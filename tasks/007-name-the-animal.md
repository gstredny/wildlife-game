# Name the animal from three choices

Date: 2026-10-01
Status: done and live (pushed to main; GitHub Pages https://gstredny.github.io/wildlife-game/)

## Intent contract (George's words)

"When they encounter an animal like they take a picture of an animal that it's not just a question
mark of what animal is this but it's a multiple choice ... and the multiple choice changes all the
time obviously except the answer so they can't memorize the answers easily but it teaches them like
they can select the answer and then if they get it right then they get to kind of move up through
that specific level. They don't complete the level fully but like they go to the next stage or
something ... So like they're rewarded for getting it right."

"It's not a quiz. It's just anytime they encounter an animal, it asks 'What is this?' and it gives
you multiple choice." "On every level, every animal they encounter ... That's the whole point: to
teach them."

Picked: the paw-print ladder (one paw per animal in the level, gold when named right on the first
try).

Today: a new animal's card asks "What animal is this?" and waits for **Tell me!**. An animal already
in the Field Guide stands in the open on later walks; its picture only plays a short "again" line.

After:
1. Every picture taken on a walk opens the card asking "What is this?" with three name buttons: the
   right name and two other animals, picked fresh and mixed up every time.
2. A wrong name wiggles and turns gray; nothing is lost. The right name shows the name and fact, and
   Ranger Mike reads them, as Tell me! did.
3. The top bar shows a paw print for each animal in the level; it turns gold when the child names
   that animal right on the first try. The Junior Ranger cheer says how many they knew.
4. Every walk hides every animal in its bush again, even ones already in the Field Guide, so each
   play of a level meets every animal.

Added while it was being built (George's words):
5. "The first level they can jump on the ant and kill the ants, but as the levels get harder, then
   they have to completely jump over it." → Levels 1 to 3 (fire ants, pinecones, acorns): landing on
   one squishes it and bounces the explorer up. Levels 4 to 6: any touch costs a heart. Walking into
   one always costs a heart.
6. "Why can't it save where they were when they died? ... They shouldn't have to start over." → After
   a game over, Try again starts at the last bush reached with three hearts; what was met and caught
   on that walk stays.
7. "Just put Georgie, Dora, whoever the name is, so I can click on it easier to switch between them."
   → Big name buttons on the trail map, one tap switches; the players screen shows just names.

Assumptions (George vetoes in one line): three choices; the wrong names come from all 60 animals;
Ranger Mike does not read the choices aloud yet (that needs 60 new recordings); the Field Guide card
still just shows the facts.

Slices, smallest first: (1) the three choices on every picture; (2) the paw ladder and the cheer;
(3) every animal hides again on each walk.

## Done criteria

- [x] `npm test`: all pass, including squishing on levels 1 to 3 but not 4 to 6, Try again at the
  last bush, and the name buttons switching players; and the choices (right name always there, three different names,
  order and wrong names change), a wrong tap grays out, the right tap tells, a second picture of the
  same animal asks again, the paws fill, the cheer counts them, and a new walk hides every animal.
- [x] `node tools/browser-habitats.mjs desktop phone`: all six levels, no page errors, choices
  answered in a real browser; screenshots of the asking card and the paw row on a phone.
- [x] Pushed and live on GitHub Pages; the live check passes.

## Attempt log

- 2026-10-01, slice 1 (three choices on every picture): 433f8b7, cache v9 in 2747e96, pushed at
  George's ask so he can try it on his phone. `npm test` 82 passed, 0 failed, 0 skipped.
  `node tools/browser-walk.mjs phone backyard` PASS locally and live (11 of 11 cards answered: a
  wrong name first on the first card, then the right one). First try put the choices inside
  `.card-actions`, which the asking card hides; moved them above it.
- 2026-10-01, paws and hide-again (9a63c40, cache v10 in 658758b), pushed. Slices 2 and 3 went in
  one commit: the cheer test only passes when replays hide every animal again (it found 7 of 11
  named, because animals found in earlier tests stood in the open). The phone browser check on the
  prairie caught a crash: after a level, Trail map threw "Invalid count value: -6" (paws counted the
  prairie's 15 against the Gulf's 9) and the map never opened. Fixed by counting only this level's
  animals; a screen test now goes prairie → Trail map → Gulf. The emoji paws were too dark on the
  green box; gold pills now (checked in a headless screenshot), and the empty pill is hidden (9a01df4).
  `tools/browser-walk.mjs` now counts different card names, since a game over replays the cards.
- 2026-10-01, squish (a2b168d): 85 passed. Proved the bounce test by setting the bounce to 0 (it
  failed). Real Chrome: explorer dropped on a fire ant → squished 1, hearts 3, not tumbling.
- 2026-10-01, Try again at the last bush (1171a46): 85 passed. Real Chrome: last heart lost on an
  ant at x 1492, last bush 1170; after Try again x 1170, hearts ❤️❤️❤️.
- 2026-10-01, name buttons (58f8bc7): 85 passed. Real Chrome phone: Georgie, Dora, Max as big
  buttons; tapping Dora switched to her Level 1; the players screen shows only names. The Chrome
  DevTools browser was busy with another session, so these checks used throwaway headless scripts.
- 2026-10-01, Learn more link removed (9659e17, George: "Nobody uses that ... they end up clicking
  and get lost"), cache v12 in f0ecde3, pushed and live (live index.html has no card-more).
- 2026-10-01, sideways lock: George asked; iPhone Safari supports neither screen.orientation.lock
  nor the manifest orientation (MDN compat data). Told him about Guided Access with Motion off.
  George: "let's just forget it." Nothing built.
- 2026-10-01, browser batch, local, one level at a time under a 420 s alarm: desktop 6 of 6 PASS;
  phone 6 of 6 PASS. `npm test` 85 passed, 0 failed, 0 skipped.
- 2026-10-01, live batch against https://gstredny.github.io/wildlife-game/ (cache v12): desktop 6 of 6
  and phone 6 of 6 PASS, no page errors. Task closed.
