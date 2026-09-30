# Wildlife Game

A walking game for young children about the real animals around Katy, Texas. A young explorer walks
a trail, finds animals hiding along it, and snaps their pictures. Each new animal opens a card with a
real photo online (or a labeled offline illustration), and Ranger Mike (a warm, recorded male voice) reads a fact about it. Every animal found
goes into the **Field Guide**; the ones still out there show as dark shapes with a question mark, and
tapping one gives a clue.

It is a sister to [Little Fish, Big Ocean](https://github.com/gstredny/fish-game), built the same
way: plain JavaScript modules, no build step, works offline.

## Choose a habitat

The home screen has six illustrated places. Each has its own scenery and animals:

| Place | Animals to find | What you will meet |
| --- | ---: | --- |
| Swamp Boardwalk | 12 | Bullfrogs, night herons, wood ducks, sliders, water snakes, and alligators |
| Bayou Trail | 13 | Wading birds, kingfishers, river otters, coyotes, hogs, and white-tailed deer |
| Woodland Walk | 10 | Raccoons, opossums, armadillos, bobcats, squirrels, woodpeckers, and an owl |
| Backyard Safari | 11 | Cardinals, blue jays, mockingbirds, hummingbirds, butterflies, anoles, and toads |
| Katy Prairie | 10 | Cottontails, meadowlarks, killdeer, kestrels, hawks, and scissor-tailed flycatchers |
| Gulf Shore | 9 | Pelicans, gulls, terns, avocets, plovers, ghost crabs, and a rare sea turtle |

There are **51 different animals**. Shared animals count once in your collection. Finding every
animal in an area earns that area's Junior Ranger cheer. The Field Guide lets you browse all
animals or choose one habitat; missing animals give a clue and name the places where you can find them.

The Gulf Shore is a Galveston day trip. Cards explain seasonal visitors and rare sightings rather
than suggesting every animal will be visible on every real outing. This is a local learning
collection, not a complete inventory of Texas wildlife.

Facts link to [Texas Parks & Wildlife](https://tpwd.texas.gov/huntwild/wild/species/), its official
magazine, or Cornell's bird guides. Both narrated facts appear on the card, along with diet,
predators, and a photo-source link.

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

## Photos and offline illustrations

The original eight animals have local WebP photographs. All 43 new animals have verified Wikimedia
Commons photo references, author/license credits, and original local SVG illustrations. Until
photographs are downloaded, the new cards load real photos online and use a clearly labeled
illustration when offline or when a photo fails. The illustration is never credited as a photograph.

To store the expanded photographs locally (requires network access and `cwebp`):

```sh
python3 tools/fetch-habitat-photos.py
```

The downloader preserves each successful file, updates the image catalog, and regenerates the
offline cache list. It scales the complete photograph rather than cropping away identification
features. Photo metadata lives in `art/photo-sources.json`; attribution is in [CREDITS.md](CREDITS.md).
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

Current verification: **31 tests passed, 0 failed, 0 skipped**. Actual browser rendering and local
expanded photo downloads could not be verified in the restricted implementation session; see
[tasks/002-texas-habitats.md](tasks/002-texas-habitats.md). No deployment was performed.

## App icon

The icon is the game's own spoonbill drawing, painted by `tools/icon.html`:

```sh
node tools/shot.mjs "http://127.0.0.1:8790/tools/icon.html" icons/icon-512.png 512x512
sips -z 192 192 icons/icon-512.png --out icons/icon-192.png
sips -z 180 180 icons/icon-512.png --out icons/apple-touch-icon.png
```
