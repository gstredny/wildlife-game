# I saw it for real!

Date: 2026-10-02
Status: live (pushed to main; GitHub Pages https://gstredny.github.io/wildlife-game/). Not yet tried on a real iPhone.

## Intent contract

George asked for "the single smartest ... addition" and picked this one: "Build slice 1 now". The
game is about the real animals around Katy, but today it stops at the screen: a child who learns the
cardinal in the game and then sees a real one in the yard has nowhere to put that.

Today: a Field Guide card shows the reference photo, the facts, and Keep exploring.

After:
1. A Field Guide card (opened from the Field Guide, not on the trail) has a **📷 I saw one for real!**
   button. It opens the phone's camera or photo library.
2. The child's photo shows on that card as a small tilted polaroid over the reference photo, with
   "Seen for real!" and the date. The happy chime plays.
3. The animal's square in the Field Guide gets a gold 📷 sticker.
4. The photo is kept on the device, shrunk to at most 1024 pixels across, one per player and animal;
   a new photo replaces the old one. It is still there after the app is closed and opened again.
   Each player has their own; removing a player removes their photos.

Assumptions (George vetoes in one line): no `capture` attribute, so iPhone offers Take Photo and Photo
Library (wildlife moves fast; a parent may snap it with the normal camera first); only animals already
found in the game can be marked; no new Ranger Mike lines yet (the chime instead); the date is saved
with the player in localStorage, the photo in IndexedDB (photos are too big for localStorage).

Slice order: this is slice 1. Later: Ranger Mike lines, a "seen for real" count on the trail map,
tapping the polaroid to see it big.

## Done criteria

- [x] `npm test`: all pass, including a sighting saved per player with its date, unknown animals
  dropped on load, the button only on Field Guide cards, a picked photo showing the polaroid and date,
  and the gold sticker in the Field Guide.
- [x] `node tools/browser-seen.mjs desktop phone`: in real Chrome, a photo picked through the real file
  input shows on the card, is saved shrunk in IndexedDB, is still there after a reload, and is gone
  after its player is removed; screenshots of the card and the Field Guide sticker.
- [x] Live on GitHub Pages after George says ship, with the cache name bumped.

## Attempt log

- 2026-10-02, attempt 1: tests first. `node --test tests/players.test.js` failed (no
  `recordSighting` export) and `tests/ui-flow.test.js` 8 pass 1 fail, as expected. Built
  `src/real-photos.js` (IndexedDB keyed [player, animal], shrink through an <img> so the photo stays
  the right way up), `fillSeen` in card-view.js, the sticker in guide-view.js, and the wiring in
  main.js. `npm test` 88 passed, 0 failed, 0 skipped.
- `node tools/browser-seen.mjs desktop phone`: first two runs failed on the check itself, not the
  game: the Remove button and the Field Guide squares are drawn anew after each tap, so an id set
  before the tap was gone. Screenshots showed the sticker there. Fixed the check to mark them again
  each time; third run PASS on both.
- Polaroid nudged 4px in so its corner clears the words on a sideways phone. Final runs:
  `npm test` 88 passed, 0 failed, 0 skipped. `node tools/browser-seen.mjs desktop phone` PASS.
  `node tools/browser-habitats.mjs desktop phone` 12 of 12 PASS ("PASS: every requested habitat and
  device mode", exit 0), since the card markup changed.
- Not checked: a real iPhone (camera, photo library, and a photo's EXIF turn). Chrome only.
  Known small gaps: if the device is out of space, the date and sticker save but the photo does not;
  reopening the card in the moment a new photo is still saving shows the old one that once.
- George said ship. Pushed bff2229..ed0d44e; live sw.js served wildlife-habitats-v13 after 70s.
  Live checks: `GAME=https://gstredny.github.io/wildlife-game/ node tools/browser-seen.mjs desktop
  phone` PASS; `browser-walk.mjs desktop backyard` and `phone backyard` against the live site both
  PASS (11 animals, Junior Ranger, no page errors).
- Open: George tries the button on his iPhone (Take Photo and Photo Library, photo the right way up).
