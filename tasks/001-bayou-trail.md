# Bayou Trail: the first walk

Date: 2026-09-30
Status: slice 1 done and committed on `main`; not pushed (no GitHub repo yet)

## Intent contract (George's words)

"Make a new game but call it like Wildlife Game ... Texas animals, so like when they see a cicada or
roseate spoonbill, white ibis, a great blue heron, they see coyotes, wild boar, white-tailed deer,
everything that exists in Katy, Texas, and around us for my kids to learn ... similar game like the
Fish Game. It pops up an image of the actual animal. It has a nice voiceover. Maybe change the voice
to like a nice male voice ... a person walking, to be a creature hunt, and they come in to find these
animals. Get creative ... be brave and ambitious."

Today: there is no wildlife game. The fish game (`~/fish-game`) teaches ocean animals.

After this slice: `~/wildlife-game` is its own repo. A child opens it, picks **Bayou Trail**, and
walks a young explorer along a Katy bayou trail (like George Bush Park). Eight real local animals
live along the trail: cicada, roseate spoonbill, white ibis, great blue heron, American alligator,
coyote, wild hog, white-tailed deer. Walking near one makes a camera sparkle; tapping it snaps a
photo, and a card shows a real photo of the animal while a warm male voice (a park ranger) reads a
fact. Every animal found goes into the **Field Guide**, where animals not yet found show as "?"
shapes. Finding all eight ends the walk with a Junior Ranger cheer. It works offline on a phone.

Assumptions (George vetoes in one line):
- Name on screen: "Wildlife Game". Repo `~/wildlife-game`, branch `main`.
- The voice is Kokoro-82M `am_michael` (the same engine as the fish game, a male voice).
- Photos come from Wikimedia Commons, public domain first (US Fish & Wildlife, National Park Service).
- Not pushed to GitHub until George says so (the fish game lives on GitHub Pages; this can too).

## Slice order

1. Bayou Trail (this file): walk, find, photo card, male voice, Field Guide, offline.
2. Sneak and hide: animals hide in grass and trees; walk slowly or birds fly off; binoculars.
3. More places around Katy: Backyard, Katy Prairie, Night Walk (flashlight, eye-shine),
   the Gulf beach, and a Road Trip beyond Texas (elk, moose, bison).
4. Junior Ranger badges and missions ("find two birds that wade").
5. Real animal sounds: "Listen! Who makes that sound?"

## Done criteria

- [x] `npm test`: all checks pass (discovery rules, Field Guide saving, every line recorded).
- [x] `node tools/browser-walk.mjs`: headless, muted Chrome walks the whole trail on a computer and a
      sideways phone, finds all eight animals, and saves screenshots; screenshots inspected.
- [x] Every animal card shows its real photo, and CREDITS.md lists each photo's author and license.
- [x] Offline: the service worker caches every file the game loads (a test checks the list).

## Attempt log (append-only)

- 2026-09-30: repo created. The fish game tree has another session's uncommitted work
  (task 015), so nothing is copied from or written to it; code is read from it only.
- Photos: Commons search hit HTTP 429 at first; a named User-Agent plus 2 s pauses fixed it.
  Eight photos picked by eye from contact sheets (the Texas superb cicada, a USFWS public-domain
  wild hog family); `tools/fetch-photos.py` crops them to 960×720 WebP.
- Voice: `am_michael` downloaded through a keychain CA bundle (`SSL_CERT_FILE`); 46 lines recorded
  with the fish game's `.venv` (generated 46, 1.8 MB).
- Drawings: three helper agents drew the wading birds, the mammals, and the alligator + cicada
  against a fixed painter contract (`src/painters.js`), checked on `tools/zoo.html`.
- `npm test`: 18 passed, 0 failed, 0 skipped.
- `node tools/browser-walk.mjs desktop` and `phone`: both PASS (all eight found, Junior Ranger
  shown, no page errors); screenshots inspected: trail, camera bubble, cards, boardwalk, Field Guide.
- Final run after the helpers finished: `npm test` 18 passed, 0 failed, 0 skipped;
  `browser-walk.mjs desktop` PASS and `phone` PASS. The phone Field Guide first cut off its second
  row; it now shows all eight in one row on short screens. Committed in 8 commits (6f41c6f..023307f).
- Not done: pushing to GitHub and GitHub Pages (George's call), and trying it on a real phone.
