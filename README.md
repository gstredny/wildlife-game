# Wildlife Game

A game for young children about the real animals around Katy, Texas. Each place is a little level,
like a Super Mario level: a young explorer runs and jumps along a trail, dodges what comes at them,
catches stars, finds the animals hiding in bushes along the way, and ends at a goal flag. Each
new animal opens a card with a real photo and the question "What animal is this?"; when the child is
ready, **Tell me!** shows the name and Ranger Mike (a warm, recorded male voice) reads a fact about it. Every animal found
goes into the **Field Guide**; the ones still out there show as dark shapes with a question mark, and
tapping one gives a clue.

It is a sister to [Little Fish, Big Ocean](https://github.com/gstredny/fish-game), built the same
way: plain JavaScript modules, no build step, works offline.

## Choose a habitat

The home screen has six illustrated places. Each has its own scenery and animals:

| Place | Animals to find | What you will meet |
| --- | ---: | --- |
| Swamp Boardwalk | 14 | Bullfrogs, night herons, whistling-ducks, crawfish, sliders, water snakes, and alligators |
| Bayou Trail | 14 | Wading birds, kingfishers, river otters, free-tailed bats, coyotes, hogs, and deer |
| Woodland Walk | 11 | Raccoons, opossums, armadillos, bobcats, a Houston toad, woodpeckers, and an owl |
| Backyard Safari | 11 | Cardinals, blue jays, mockingbirds, hummingbirds, butterflies, anoles, and toads |
| Katy Prairie | 15 | Attwater's prairie chickens, snow geese, sandhill cranes, caracaras, and white-tailed hawks |
| Gulf Shore | 9 | Pelicans, gulls, terns, avocets, plovers, ghost crabs, and a rare sea turtle |

There are **60 different animals**. Nine are Katy specials: animals that live only in Texas (the
Houston toad, Attwater's prairie chicken), that in the U.S. live mostly in Texas (the white-tailed
hawk, crested caracara), or that Katy and Houston are known for (snow geese and sandhill cranes on the
Katy Prairie, whistling-ducks, crawfish, and Houston's bridge bats). Shared animals count once in your collection. Reaching the goal
flag at the end of a place earns its Junior Ranger cheer. The Field Guide lets you browse all
animals or choose one habitat; missing animals give a clue and name the places where you can find them.

The Gulf Shore is a Galveston day trip. Cards explain seasonal visitors and rare sightings rather
than suggesting every animal will be visible on every real outing. This is a local learning
collection, not a complete inventory of Texas wildlife.

Facts link to [Texas Parks & Wildlife](https://tpwd.texas.gov/huntwild/wild/species/), its official
magazine, or Cornell's bird guides. Both narrated facts appear on the card, along with diet,
predators, and a photo-source link.

## How to play

Walk with the arrow buttons in the bottom left (or the arrow keys, or A and D) and jump with the big
orange button in the bottom right (or Space, the up arrow, or W). Tap anywhere on the trail to walk
there, hopping over logs on the way.

- **Find the animals.** Every animal not found yet hides in a rustling bush with a bouncing **?** over
  it. Walk into the bush: the animal comes out, the camera flashes, and its card opens.
- **Dodge what comes at you.** Each place sends something along the path: mosquitoes on the Swamp
  Boardwalk, acorns on the Bayou Trail, pinecones in the Woodland Walk, fire ants in the Backyard,
  tumbleweeds on the Katy Prairie, and beach balls on the Gulf Shore. Jump over them. Something still
  dropping in can't hurt you yet, so watch it land.
- **Three hearts.** A hit knocks the explorer out: they tumble off the screen and lose a heart, then
  start again at the last bush they reached, blinking for a moment. Lose all three and it's game over:
  try the place again from the start. Animals you found stay in your Field Guide.
- **Jump.** Logs block the path until you jump over them or onto them; stars float along the way,
  some only reachable with a jump.
- **Reach the goal flag.** The flag at the end goes up, and the Junior Ranger cheer shows how many
  stars you caught.

Animals you have found stay out in the open: tap one (or the camera, or Enter, near one) to take its
picture again.

**Players:** the 👤 button on the home screen shows who is exploring. Each player has their own Field
Guide, and the players screen lists how many animals each found and their five latest finds, with the
place and time. Players are saved on this device only.

## Play on a Mac

```sh
python3 -m http.server 8790
```

Open <http://localhost:8790>.

## The voice

Every line is recorded ahead of time in `voice/` with Qwen3-TTS 1.7B (Apache-2.0), speaker `ryan`,
running on the Mac's GPU through mlx-audio, so it sounds the same on every phone and works offline.
After changing any spoken words (facts, lines, clues), record again; `npm test` fails until you do.
The recorder writes each clip back down with a small speech-to-text model and records it again (up to
three tries) when the words don't match, then lists any line still off to listen to by ear. Words the
voice says wrong are respelled for the voice only in `tools/say-like.json` (`"roseate": "Rosie-it"`).

```sh
python3.12 -m venv .venv && .venv/bin/pip install -r tools/voice-requirements.txt   # once, Apple-silicon Mac
node tools/voice-lines.mjs > /tmp/lines.json
.venv/bin/python tools/make-voice.py /tmp/lines.json voice --prune
```

The first run downloads about 3 GB of models. On a work Mac that inspects HTTPS, point Python at a
certificate bundle built from the keychain, as the fish game's README shows (`SSL_CERT_FILE=...`).
Bump the cache name in `sw.js` afterwards.

## Photos and offline illustrations

All 60 animals have local WebP photographs from Wikimedia Commons, saved for offline play. The
Field Guide shows 400px copies from `art/animals/thumbs/`. Each new animal also has an original SVG
illustration: a card shows it, clearly labeled, only if its photo fails to load, or before a new
animal's photo is downloaded. The illustration is never credited as a photograph.

To download a new animal's photo, then refresh the thumbnails (requires network access and `cwebp`):

```sh
python3 tools/fetch-habitat-photos.py newAnimal
tools/make-thumbs.sh
node tools/cache-files.mjs
```

The downloader preserves each successful file, updates the image catalog, and regenerates the
offline cache list. It scales the complete photograph rather than cropping away identification
features. Photo metadata lives in `src/photos-new.js`; attribution is in [CREDITS.md](CREDITS.md).
The original downloader remains `tools/fetch-photos.py`.

After changing an animal drawing or adding game modules:

```sh
node tools/export-illustrations.mjs
node tools/cache-files.mjs
```

## Checks

```sh
npm test                                   # rules, UI flow, saving, image references, narration, offline list
node tools/browser-habitats.mjs desktop     # real Chrome input through all six areas
node tools/browser-habitats.mjs phone       # same on a sideways touch phone
node tools/browser-walk.mjs phone swamp     # one place
node tools/shot.mjs "http://127.0.0.1:8790/tools/zoo.html?only=bullfrog,nightHeron,woodDuck,slider" screenshots/swamp-animals.png 1600x1400
```

Browser checks require the local server running. They save screenshots in `screenshots/`, replay a
known card, reload offline, and check saved habitat progress. The zoo page draws still, walking,
alert, and small poses with the tap boxes.

Current verification (2026-09-30): `npm test` **72 passed, 0 failed, 0 skipped**;
`node tools/browser-habitats.mjs desktop phone` passed 12 of 12 runs (all 60 animals, no page errors).
See [tasks/005-lives.md](tasks/005-lives.md).

## App icon

The icon is the game's own spoonbill drawing, painted by `tools/icon.html`:

```sh
node tools/shot.mjs "http://127.0.0.1:8790/tools/icon.html" icons/icon-512.png 512x512
sips -z 192 192 icons/icon-512.png --out icons/icon-192.png
sips -z 180 180 icons/icon-512.png --out icons/apple-touch-icon.png
```
