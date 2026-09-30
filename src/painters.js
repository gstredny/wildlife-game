// Every animal drawing in one lookup, so the trail and the zoo page can draw any animal by name.
// Each painter draws its animal facing right, standing on (0, 0): paint(context, size, time, state).
// `size` is the animal's height in pixels; `state` is { walking, alert }.
// BOXES[kind] is where the drawing reaches, in units of size: x from left to right, y from top to 0.
import { BIRD_BOXES, BIRD_PAINTERS } from "./paint-birds.js";
import { MAMMAL_BOXES, MAMMAL_PAINTERS } from "./paint-mammals.js";
import { ALLIGATOR_BOX, paintAlligator } from "./paint-alligator.js";
import { CICADA_BOX, paintCicada } from "./paint-cicada.js";
import { SONGBIRD_BOXES, SONGBIRD_PAINTERS } from "./paint-songbirds.js";
import { WATERBIRD_BOXES, WATERBIRD_PAINTERS } from "./paint-waterbirds.js";
import { RAPTOR_BOXES, RAPTOR_PAINTERS } from "./paint-raptors.js";
import { WOODLAND_BOXES, WOODLAND_PAINTERS } from "./paint-woodland-mammals.js";
import { FROG_BOXES, FROG_PAINTERS } from "./paint-frogs.js";
import { TURTLE_BOXES, TURTLE_PAINTERS } from "./paint-turtles.js";
import { SCALED_BOXES, SCALED_PAINTERS } from "./paint-scaled-reptiles.js";
import { ARTHROPOD_BOXES, ARTHROPOD_PAINTERS } from "./paint-arthropods.js";

export const PAINTERS = { ...BIRD_PAINTERS, ...MAMMAL_PAINTERS, alligator: paintAlligator, cicada: paintCicada,
  ...SONGBIRD_PAINTERS, ...WATERBIRD_PAINTERS, ...RAPTOR_PAINTERS, ...WOODLAND_PAINTERS,
  ...FROG_PAINTERS, ...TURTLE_PAINTERS, ...SCALED_PAINTERS, ...ARTHROPOD_PAINTERS };
export const BOXES = { ...BIRD_BOXES, ...MAMMAL_BOXES, alligator: ALLIGATOR_BOX, cicada: CICADA_BOX,
  ...SONGBIRD_BOXES, ...WATERBIRD_BOXES, ...RAPTOR_BOXES, ...WOODLAND_BOXES,
  ...FROG_BOXES, ...TURTLE_BOXES, ...SCALED_BOXES, ...ARTHROPOD_BOXES };
