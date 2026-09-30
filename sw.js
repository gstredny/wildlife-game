const CACHE = "wildlife-v1";
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./src/animals.js",
  "./src/card-view.js",
  "./src/field-guide.js",
  "./src/guide-view.js",
  "./src/layout.js",
  "./src/lines.js",
  "./src/main.js",
  "./src/paint-alligator.js",
  "./src/paint-birds.js",
  "./src/paint-cicada.js",
  "./src/paint-explorer.js",
  "./src/paint-mammals.js",
  "./src/painters.js",
  "./src/photos.js",
  "./src/places.js",
  "./src/render.js",
  "./src/scenery.js",
  "./src/sound.js",
  "./src/trail.js",
  "./src/voice.js",
  "./art/animals/alligator.webp",
  "./art/animals/cicada.webp",
  "./art/animals/coyote.webp",
  "./art/animals/deer.webp",
  "./art/animals/heron.webp",
  "./art/animals/hog.webp",
  "./art/animals/ibis.webp",
  "./art/animals/spoonbill.webp",
  "./voice/manifest.json",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

// The recorded voice clips are listed in voice/manifest.json, so they are cached from there, one by
// one: a clip that fails to download is spoken by the device's voice instead of stopping the update.
async function install() {
  const cache = await caches.open(CACHE);
  await cache.addAll(FILES.map(file => new Request(file, { cache: "reload" })));
  const manifest = await (await cache.match("./voice/manifest.json")).json();
  await Promise.allSettled(Object.values(manifest.clips).map(file => cache.add(new Request(`./voice/${file}`, { cache: "reload" }))));
}

self.addEventListener("install", event => {
  event.waitUntil(install());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

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
