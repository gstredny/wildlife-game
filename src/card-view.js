// Fills the animal card: the real photo, its credit, the fact, and what it eats and what eats it.
import { ANIMALS } from "./animals.js";
import { PHOTOS } from "./photos.js";

const $ = id => document.getElementById(id);

export function fillCard(kind, isNew) {
  const animal = ANIMALS[kind];
  $("card-image").src = PHOTOS[kind].file;
  $("card-image").alt = `A photo of a ${animal.name.toLowerCase()}`;
  $("card-credit").textContent = PHOTOS[kind].credit;
  $("card-kicker").textContent = isNew ? "You found a new animal!" : "Field Guide";
  $("card-name").textContent = animal.name;
  $("card-fact").textContent = animal.fact;
  $("card-eats").textContent = animal.eats;
  $("card-eaten").textContent = animal.eatenBy;
  // A grown-up can look up more, with SafeSearch on, when the device is online.
  const more = $("card-more");
  more.href = `https://www.google.com/search?safe=active&q=${encodeURIComponent(`${animal.name} facts for kids`)}`;
  more.hidden = !navigator.onLine;
}
