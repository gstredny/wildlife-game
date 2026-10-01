# Name the animal from three choices

Date: 2026-10-01
Status: in progress

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

Assumptions (George vetoes in one line): three choices; the wrong names come from all 60 animals;
Ranger Mike does not read the choices aloud yet (that needs 60 new recordings); the Field Guide card
still just shows the facts.

Slices, smallest first: (1) the three choices on every picture; (2) the paw ladder and the cheer;
(3) every animal hides again on each walk.

## Done criteria

- [ ] `npm test`: all pass, including the choices (right name always there, three different names,
  order and wrong names change), a wrong tap grays out, the right tap tells, a second picture of the
  same animal asks again, the paws fill, the cheer counts them, and a new walk hides every animal.
- [ ] `node tools/browser-habitats.mjs desktop phone`: all six levels, no page errors, choices
  answered in a real browser; screenshots of the asking card and the paw row on a phone.
- [ ] Pushed and live on GitHub Pages; the live check passes.

## Attempt log

- 2026-10-01, slice 1 (three choices on every picture): 433f8b7, cache v9 in 2747e96, pushed at
  George's ask so he can try it on his phone. `npm test` 82 passed, 0 failed, 0 skipped.
  `node tools/browser-walk.mjs phone backyard` PASS locally and live (11 of 11 cards answered: a
  wrong name first on the first card, then the right one). First try put the choices inside
  `.card-actions`, which the asking card hides; moved them above it.
