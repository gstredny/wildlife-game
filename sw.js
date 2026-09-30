const CACHE = "wildlife-habitats-v2";
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./src/animals-backyard.js",
  "./src/animals-bayou.js",
  "./src/animals-gulf.js",
  "./src/animals-prairie.js",
  "./src/animals-swamp.js",
  "./src/animals-woods.js",
  "./src/animals.js",
  "./src/card-view.js",
  "./src/field-guide.js",
  "./src/guide-view.js",
  "./src/habitat-scenery.js",
  "./src/layout.js",
  "./src/lines.js",
  "./src/main.js",
  "./src/paint-alligator.js",
  "./src/paint-arthropods.js",
  "./src/paint-birds.js",
  "./src/paint-cicada.js",
  "./src/paint-explorer.js",
  "./src/paint-frogs.js",
  "./src/paint-mammals.js",
  "./src/paint-raptors.js",
  "./src/paint-scaled-reptiles.js",
  "./src/paint-shapes.js",
  "./src/paint-songbirds.js",
  "./src/paint-turtles.js",
  "./src/paint-waterbirds.js",
  "./src/paint-woodland-mammals.js",
  "./src/painters.js",
  "./src/photos-new.js",
  "./src/photos.js",
  "./src/place-view.js",
  "./src/places.js",
  "./src/render.js",
  "./src/scenery.js",
  "./src/sound.js",
  "./src/trail.js",
  "./src/voice.js",
  "./art/animals/alligator.webp",
  "./art/animals/anole.svg",
  "./art/animals/armadillo.svg",
  "./art/animals/avocet.svg",
  "./art/animals/barredOwl.svg",
  "./art/animals/blueJay.svg",
  "./art/animals/bobcat.svg",
  "./art/animals/boxTurtle.svg",
  "./art/animals/bullfrog.svg",
  "./art/animals/cardinal.svg",
  "./art/animals/cicada.webp",
  "./art/animals/cottonmouth.svg",
  "./art/animals/coyote.webp",
  "./art/animals/crab.svg",
  "./art/animals/deer.webp",
  "./art/animals/dove.svg",
  "./art/animals/dragonfly.svg",
  "./art/animals/egret.svg",
  "./art/animals/grackle.svg",
  "./art/animals/gull.svg",
  "./art/animals/hawk.svg",
  "./art/animals/heron.webp",
  "./art/animals/hog.webp",
  "./art/animals/hummingbird.svg",
  "./art/animals/ibis.webp",
  "./art/animals/kestrel.svg",
  "./art/animals/killdeer.svg",
  "./art/animals/kingfisher.svg",
  "./art/animals/leopardFrog.svg",
  "./art/animals/meadowlark.svg",
  "./art/animals/mockingbird.svg",
  "./art/animals/monarch.svg",
  "./art/animals/nightHeron.svg",
  "./art/animals/nutria.svg",
  "./art/animals/opossum.svg",
  "./art/animals/pelican.svg",
  "./art/animals/plover.svg",
  "./art/animals/rabbit.svg",
  "./art/animals/raccoon.svg",
  "./art/animals/redwing.svg",
  "./art/animals/riverOtter.svg",
  "./art/animals/scissortail.svg",
  "./art/animals/seaTurtle.svg",
  "./art/animals/slider.svg",
  "./art/animals/spoonbill.webp",
  "./art/animals/squirrel.svg",
  "./art/animals/tern.svg",
  "./art/animals/toad.svg",
  "./art/animals/watersnake.svg",
  "./art/animals/woodDuck.svg",
  "./art/animals/woodpecker.svg",
  "./voice/manifest.json",
  "./manifest.json",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Voice clips are named after what they say, so a saved clip never changes. They live in their own
// cache that outlasts game updates: an update downloads only new clips.
const VOICE = "wildlife-voice";
const clipPaths = async cache => Object.values((await (await cache.match("./voice/manifest.json")).json()).clips)
  .map(file => `./voice/${file}`);

// The recorded voice clips are listed in voice/manifest.json, so they are cached from there, one by
// one: a clip that fails to download is spoken by the device's voice instead of stopping the update.
async function install() {
  const cache = await caches.open(CACHE);
  await cache.addAll(FILES.map(file => new Request(file, { cache: "reload" })));
  const voice = await caches.open(VOICE);
  await Promise.allSettled((await clipPaths(cache)).map(async path =>
    (await voice.match(path)) ?? voice.add(new Request(path, { cache: "reload" }))));
}

// Drops old game caches, and clips the new voice/manifest.json no longer lists.
async function activate() {
  await Promise.all((await caches.keys()).filter(key => key !== CACHE && key !== VOICE).map(key => caches.delete(key)));
  const wanted = new Set((await clipPaths(await caches.open(CACHE))).map(path => new URL(path, self.location.href).href));
  const voice = await caches.open(VOICE);
  await Promise.all((await voice.keys()).filter(request => !wanted.has(request.url)).map(request => voice.delete(request)));
  await self.clients.claim();
}

self.addEventListener("install", event => {
  event.waitUntil(install());
  self.skipWaiting();
});

self.addEventListener("activate", event => event.waitUntil(activate()));

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(respond(event.request));
});

async function respond(request) {
  const cached = await caches.match(request);
  if (!cached) return fetch(request);
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (!range) return cached;
  // Safari plays a saved voice clip only when asked-for bytes come back as a partial response.
  const body = await cached.arrayBuffer();
  const last = body.byteLength - 1;
  const from = range[1] ? Number(range[1]) : Math.max(0, last + 1 - Number(range[2]));
  const to = range[1] && range[2] ? Math.min(Number(range[2]), last) : last;
  if (!(range[1] || range[2]) || from > to) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${body.byteLength}` } });
  }
  return new Response(body.slice(from, to + 1), { status: 206, headers: {
    "Content-Type": cached.headers.get("Content-Type") ?? "audio/mpeg",
    "Content-Range": `bytes ${from}-${to}/${body.byteLength}`,
    "Content-Length": String(to - from + 1),
    "Accept-Ranges": "bytes"
  } });
}
