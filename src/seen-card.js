// Saves a Field Guide sighting only once its photo is kept, with a retry message on failure.
import { fillSeen } from "./card-view.js";
import { recordSighting, savePlayers } from "./players.js";
import { shrinkPhoto } from "./real-photos.js";

const $ = id => document.getElementById(id);

export function createSeenCard(players, photos, onSaved) {
  let current = null;
  let saving = null;
  const showing = request => current?.owner === request.owner && current?.kind === request.kind;
  const status = message => { $("card-seen-status").textContent = message; };

  function show(kind) {
    const owner = players.list[players.current];
    const request = kind ? { kind, owner, name: players.current } : null;
    current = request;
    const at = kind && owner.seen?.[kind];
    fillSeen(at);
    status(saving && showing(saving) ? "Saving your photo…" : "");
    if (!at) return;
    photos.load(request.name, kind).then(photo => {
      if (current === request && photo) fillSeen(at, photo);
    }).catch(() => {
      if (current === request) status("This photo could not be opened. Please choose it again.");
    });
  }

  async function keep() {
    const [photo] = $("seen-camera").files ?? [];
    $("seen-camera").value = ""; // the same photo can be picked again
    if (!photo || !current || saving) return;
    const request = { ...current };
    current = request; // a load started before this selection must not repaint it
    saving = request;
    $("card-seen-button").disabled = true;
    status("Saving your photo…");
    try {
      const small = await shrinkPhoto(photo);
      if (players.list[request.name] !== request.owner) return;
      await photos.save(request.name, request.kind, small);
      if (players.list[request.name] !== request.owner) return;
      const at = Date.now();
      recordSighting({ list: players.list, current: request.name }, request.kind, at);
      if (!savePlayers(players)) {
        if (showing(request)) status("Your photo was saved, but the sticker could not be kept. Please try again.");
        return;
      }
      if (showing(request)) {
        current = { ...current }; // also discard loads started while the photo was saving
        fillSeen(at, small);
        status("");
        onSaved();
      }
    } catch {
      if (showing(request)) {
        show(request.kind);
        status("That photo could not be saved. Please choose another or free up space and try again.");
      }
    } finally {
      saving = null;
      $("card-seen-button").disabled = false;
    }
  }

  return { show, keep };
}
