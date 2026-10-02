import test from "node:test";
import assert from "node:assert/strict";
import { createSeenCard } from "../src/seen-card.js";
import { PLAYERS_KEY } from "../src/players.js";

const turn = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

function setup(t, seen = {}) {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { hidden: false, textContent: "", files: [], value: "" });
    return elements.get(id);
  };
  let decode = () => Promise.resolve();
  const storage = new Map();
  const globals = {
    document: {
      getElementById: element,
      createElement: () => ({ getContext: () => ({ drawImage() {} }),
        toBlob: callback => callback(new Blob(["small photo"], { type: "image/jpeg" })) })
    },
    Image: class {
      naturalWidth = 960;
      naturalHeight = 1120;
      decode() { return decode(); }
    },
    localStorage: { setItem: (key, value) => storage.set(key, value) }
  };
  const originals = Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  t.after(() => {
    card.show(null);
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  const players = { current: "Explorer", list: {
    Explorer: { found: ["cardinal"], log: [], level: 1, seen },
    Dora: { found: ["heron"], log: [], level: 1 }
  } };
  const stored = new Map();
  const photos = {
    load: async (name, kind) => stored.get(`${name}:${kind}`),
    save: async (name, kind, photo) => stored.set(`${name}:${kind}`, photo)
  };
  let cheers = 0;
  const card = createSeenCard(players, photos, () => cheers++);
  const pick = () => {
    element("seen-camera").files = [new Blob(["phone photo"], { type: "image/jpeg" })];
    return card.keep();
  };
  return { card, players, photos, stored, storage, element, pick,
    decode: callback => { decode = callback; }, cheers: () => cheers };
}

test("a sighting is marked only after its photo transaction finishes; repeated picks wait", async t => {
  const f = setup(t);
  const write = deferred();
  f.photos.save = async (name, kind, photo) => {
    await write.promise;
    f.stored.set(`${name}:${kind}`, photo);
  };
  f.card.show("cardinal");
  const pending = f.pick();
  await turn();
  await f.pick();
  assert.deepEqual(f.players.list.Explorer.seen, {});
  assert.equal(f.storage.has(PLAYERS_KEY), false);
  assert.equal(f.element("card-seen-button").disabled, true);
  assert.match(f.element("card-seen-status").textContent, /Saving/);
  assert.equal(f.cheers(), 0);
  write.resolve();
  await pending;
  assert.equal(f.stored.get("Explorer:cardinal").type, "image/jpeg");
  assert.equal(typeof JSON.parse(f.storage.get(PLAYERS_KEY)).list.Explorer.seen.cardinal, "number");
  assert.equal(f.element("card-seen").hidden, false);
  assert.match(f.element("card-seen-image").src, /^blob:/);
  assert.equal(f.element("card-seen-button").disabled, false);
  assert.equal(f.cheers(), 1);
});

test("an undecodable image creates no sighting and lets the child try another photo", async t => {
  const f = setup(t);
  f.decode(async () => { throw new Error("unsupported image"); });
  f.card.show("cardinal");
  await f.pick();
  assert.deepEqual(f.players.list.Explorer.seen, {});
  assert.equal(f.stored.size, 0);
  assert.equal(f.element("card-seen").hidden, true);
  assert.match(f.element("card-seen-status").textContent, /could not be saved/);
  assert.equal(f.element("card-seen-button").disabled, false);
  f.decode(() => Promise.resolve());
  await f.pick();
  assert.equal(f.stored.size, 1);
  assert.equal(f.element("card-seen-status").textContent, "");
});

test("running out of photo storage keeps the previous photo and day", async t => {
  const f = setup(t, { cardinal: 1000 });
  const old = new Blob(["old photo"], { type: "image/jpeg" });
  f.stored.set("Explorer:cardinal", old);
  f.card.show("cardinal");
  await turn();
  f.photos.save = async () => { throw new DOMException("full", "QuotaExceededError"); };
  await f.pick();
  assert.equal(f.players.list.Explorer.seen.cardinal, 1000);
  assert.equal(f.stored.get("Explorer:cardinal"), old);
  await turn();
  assert.equal(await fetch(f.element("card-seen-image").src).then(response => response.text()), "old photo");
  assert.match(f.element("card-seen-status").textContent, /free up space/);
  assert.equal(f.cheers(), 0);
});

test("a load started before a replacement cannot paint over the new photo", async t => {
  const f = setup(t, { cardinal: 1000 });
  const load = deferred();
  f.photos.load = () => load.promise;
  f.card.show("cardinal");
  await f.pick();
  const src = f.element("card-seen-image").src;
  const day = f.element("card-seen-date").textContent;
  load.resolve(new Blob(["old photo"]));
  await turn();
  assert.equal(f.element("card-seen-image").src, src);
  assert.equal(f.element("card-seen-date").textContent, day);
});

test("a failed replacement restores the previous photo even if its first load was still pending", async t => {
  const f = setup(t, { cardinal: 1000 });
  const load = deferred();
  f.photos.load = () => load.promise;
  f.decode(async () => { throw new Error("unsupported image"); });
  f.card.show("cardinal");
  await f.pick();
  load.resolve(new Blob(["old photo"]));
  await turn();
  assert.equal(await fetch(f.element("card-seen-image").src).then(response => response.text()), "old photo");
  assert.equal(f.players.list.Explorer.seen.cardinal, 1000);
  assert.match(f.element("card-seen-status").textContent, /could not be saved/);
});

test("closing and reopening during a save still shows the replacement, ignoring an older load", async t => {
  const f = setup(t, { cardinal: 1000 });
  const decode = deferred();
  const load = deferred();
  f.decode(() => decode.promise);
  f.photos.load = () => load.promise;
  f.card.show("cardinal");
  const pending = f.pick();
  f.card.show(null);
  f.card.show("cardinal");
  decode.resolve();
  await pending;
  const src = f.element("card-seen-image").src;
  assert.match(src, /^blob:/);
  load.resolve(new Blob(["old photo"]));
  await turn();
  assert.equal(f.element("card-seen-image").src, src);
});

test("navigating to another player's animal during a save keeps the original owner and animal", async t => {
  const f = setup(t);
  const decode = deferred();
  f.decode(() => decode.promise);
  f.card.show("cardinal");
  const pending = f.pick();
  f.card.show(null);
  f.players.current = "Dora";
  f.card.show("heron");
  decode.resolve();
  await pending;
  assert.deepEqual([...f.stored.keys()], ["Explorer:cardinal"]);
  assert.equal(typeof f.players.list.Explorer.seen.cardinal, "number");
  assert.equal(f.players.list.Dora.seen, undefined);
  assert.equal(f.element("card-seen").hidden, true);
  assert.equal(f.element("card-seen-status").textContent, "");
});

test("removing a player while their photo shrinks cannot resurrect their photo or give it to a new namesake", async t => {
  const f = setup(t);
  const decode = deferred();
  f.decode(() => decode.promise);
  f.card.show("cardinal");
  const pending = f.pick();
  f.card.show(null);
  f.players.list.Explorer = { found: [], log: [], level: 1 };
  decode.resolve();
  await pending;
  assert.equal(f.stored.size, 0);
  assert.equal(f.players.list.Explorer.seen, undefined);
});

test("leaving a Field Guide card prevents its delayed photo from appearing on a quiz card", async t => {
  const f = setup(t, { cardinal: 1000 });
  const load = deferred();
  f.photos.load = () => load.promise;
  f.card.show("cardinal");
  f.card.show(null);
  load.resolve(new Blob(["old photo"]));
  await turn();
  assert.equal(f.element("card-seen").hidden, true);
  assert.equal(f.element("card-seen-image").hidden, true);
});
