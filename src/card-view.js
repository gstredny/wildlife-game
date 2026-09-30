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
  // A grown-up can look up more, with SafeSearch on, when the device is online.
  const more = $("card-more");
  more.href = animal.source;
  more.textContent = animal.source.includes("allaboutbirds.org") ? "Learn more with Cornell Birds" : "Learn more with Texas Parks & Wildlife";
  more.hidden = !navigator.onLine;
}
