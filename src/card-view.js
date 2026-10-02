// Fills the animal card: the real photo, its credit, the fact, and what it eats and what eats it.
import { ANIMALS } from "./animals.js";
import { PHOTOS } from "./photos.js";

const $ = id => document.getElementById(id);

export function fillCard(kind, isNew) {
  const animal = ANIMALS[kind];
  const photo = PHOTOS[kind];
  const image = $("card-image");
  const illustration = () => {
    image.onerror = null;
    image.src = photo.fallback ?? photo.file;
    image.alt = `An illustration of ${animal.name.toLowerCase()}`;
    $("card-credit").textContent = "Drawing: Wildlife Game, original illustration";
  };
  image.onerror = photo.fallback ? illustration : null;
  image.alt = `A photo of ${animal.name.toLowerCase()}`;
  $("card-credit").textContent = photo.credit;
  image.src = photo.file.endsWith(".svg") && navigator.onLine ? photo.remote : photo.file;
  if (image.src.endsWith(".svg")) illustration();
  $("card-photo-source").href = photo.source;
  $("card-photo-source").hidden = !navigator.onLine;
  $("card-kicker").textContent = isNew ? "You found a new animal!" : "Field Guide";
  $("card-name").textContent = animal.name;
  $("card-fact").textContent = animal.fact;
  $("card-say").textContent = animal.say;
  $("card-eats").textContent = animal.eats;
  $("card-eaten").textContent = animal.eatenBy;
}

let seenUrl = null;

// The player's own photo of the animal, a polaroid on the card with the day they saw it for real.
// No day hides it. The photo can follow a moment later, once it loads from the device.
export function fillSeen(at, photo = null) {
  $("card-seen").hidden = !at;
  if (seenUrl) URL.revokeObjectURL(seenUrl);
  seenUrl = photo && URL.createObjectURL(photo);
  $("card-seen-image").hidden = !seenUrl;
  if (seenUrl) $("card-seen-image").src = seenUrl;
  if (at) $("card-seen-date").textContent = `Seen for real! ${new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}
