// Every animal drawing in one lookup, so the trail and the zoo page can draw any animal by name.
// Each painter draws its animal facing right, standing on (0, 0): paint(context, size, time, state).
// `size` is the animal's height in pixels; `state` is { walking, alert }.
// BOXES[kind] is where the drawing reaches, in units of size: x from left to right, y from top to 0.
import { BIRD_BOXES, BIRD_PAINTERS } from "./paint-birds.js";
import { MAMMAL_BOXES, MAMMAL_PAINTERS } from "./paint-mammals.js";
import { ALLIGATOR_BOX, paintAlligator } from "./paint-alligator.js";
import { CICADA_BOX, paintCicada } from "./paint-cicada.js";

export const PAINTERS = { ...BIRD_PAINTERS, ...MAMMAL_PAINTERS, alligator: paintAlligator, cicada: paintCicada };
export const BOXES = { ...BIRD_BOXES, ...MAMMAL_BOXES, alligator: ALLIGATOR_BOX, cicada: CICADA_BOX };
