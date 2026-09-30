# Wildlife Game

A walking game for young children about the real animals around Katy, Texas. A young explorer walks
a trail, finds animals hiding along it, and snaps their pictures. Each new animal opens a card with a
real photo, and Ranger Mike (a warm, recorded male voice) reads a fact about it. Every animal found
goes into the **Field Guide**; the ones still out there show as dark shapes with a question mark, and
tapping one gives a clue.

It is a sister to [Little Fish, Big Ocean](https://github.com/gstredny/fish-game), built the same
way: plain JavaScript modules, no build step, works offline.

## The Bayou Trail

The first trail is a bayou like George Bush Park: a meadow, a boardwalk over the water, and the edge
of the woods. Eight animals live along it:

- a **cicada** buzzing on a live oak,
- a **great blue heron**, standing still in the water,
- a busy group of **white ibises**,
- a pink **roseate spoonbill**,
- an **American alligator** basking on a mud bar,
- a **coyote** trotting along,
- a **wild hog** rooting in the dirt,
- a **white-tailed deer** at the edge of the woods, which lifts its white tail like a flag when you
  come close.

Finding all eight makes you a **Junior Ranger**. More places are planned in
[tasks/001-bayou-trail.md](tasks/001-bayou-trail.md).

## How to play

Walk with the arrow buttons in the bottom corners (or the arrow keys, or A and D). Tap anywhere on the
trail to walk there. When an animal is close, a camera bubble bounces over it and the camera button
lights up: tap the animal or the camera (or press Space) to take its picture. Tap an animal far away
and the explorer walks over to it.

## Play on a Mac

```sh
python3 -m http.server 8790
```

Open <http://localhost:8790>.

## The voice

Every line is recorded ahead of time in `voice/` with Kokoro-82M (Apache-2.0), voice `am_michael`,
so it sounds the same on every phone and works offline. After changing any spoken words (facts,
lines, clues), record again; `npm test` fails until you do. The recorder is the fish game's; its
Python setup is in the fish game's README (`tools/voice-requirements.txt`, Python 3.10 to 3.12).

```sh
node tools/voice-lines.mjs > /tmp/lines.json
.venv/bin/python tools/make-voice.py /tmp/lines.json voice --prune
```

On a work Mac that inspects HTTPS, point Python at a certificate bundle built from the keychain, as the
fish game's README shows (`SSL_CERT_FILE=...`). Bump the cache name in `sw.js` afterwards.

## Photos

`python3 tools/fetch-photos.py` downloads each card photo from Wikimedia Commons and crops it to a
960×720 WebP (needs `cwebp`). Credits are on each card and in [CREDITS.md](CREDITS.md).

## Checks

```sh
npm test                              # rules, saving, photos, every line recorded, offline list
node tools/browser-walk.mjs desktop   # a muted, headless Chrome walks the trail and finds all eight
node tools/browser-walk.mjs phone     # the same on a sideways phone, with touch
node tools/shot.mjs "http://127.0.0.1:8790/tools/zoo.html" screenshots/zoo.png 1600x1400
```

The browser checks start their own muted Chrome and save screenshots in `screenshots/`. The zoo page
draws every animal in its still, walking and alert poses, with the box a tap must land in.

## App icon

The icon is the game's own spoonbill drawing, painted by `tools/icon.html`:

```sh
node tools/shot.mjs "http://127.0.0.1:8790/tools/icon.html" icons/icon-512.png 512x512
sips -z 192 192 icons/icon-512.png --out icons/icon-192.png
sips -z 180 180 icons/icon-512.png --out icons/apple-touch-icon.png
```
