import { SWAMP_ANIMALS } from "./animals-swamp.js";
import { BAYOU_ANIMALS } from "./animals-bayou.js";
import { WOODS_ANIMALS } from "./animals-woods.js";
import { BACKYARD_ANIMALS } from "./animals-backyard.js";
import { PRAIRIE_ANIMALS } from "./animals-prairie.js";
import { GULF_ANIMALS } from "./animals-gulf.js";
// The real animals of the trails around Katy, Texas: what the card shows and what the ranger says.
// `hello` + `fact` + `say` is read aloud on the card. `lines` are short lines for meeting the animal
// again. `hint` is the ranger's clue for an animal not found yet.
const ORIGINAL_ANIMALS = {
  cicada: {
    name: "Cicada", hello: "This is a cicada!",
    fact: "Cicadas are the bugs that buzz so loud on hot Texas summer days. Only the boy cicadas sing. They click little drums on their sides to make the buzz!",
    say: "Baby cicadas live underground for a few years, sipping juice from tree roots. Then they climb up a tree, split open their old skin, and come out with wings.",
    eats: "Juice from trees, sipped through a mouth like a straw",
    eatenBy: "Birds, squirrels, and big wasps called cicada killers",
    lines: ["Cicadas buzz in the summer!", "Only boy cicadas sing.", "Baby cicadas grow up underground."],
    hint: "Listen for buzzing up in the trees."
  },
  spoonbill: {
    name: "Roseate spoonbill", hello: "This is a roseate spoonbill!",
    fact: "A roseate spoonbill is a pink bird with a bill shaped like a big, flat spoon. It swishes its spoon side to side in the water to feel for food.",
    say: "Spoonbills get their pink color from the tiny shrimp and crabs they eat. Roseate means rosy pink!",
    eats: "Tiny shrimp, crabs, bugs, and little fish",
    eatenBy: "Alligators. Raccoons steal their eggs",
    lines: ["Spoonbills are pink!", "Spoonbills swish their spoons in the water.", "Spoonbills eat tiny shrimp."],
    hint: "Look for something pink in the water."
  },
  ibis: {
    name: "White ibis", hello: "This is a white ibis!",
    fact: "A white ibis has a long, curved orange bill. It pokes its bill into the mud to feel for crawfish.",
    say: "White ibises walk around in big, busy groups. Look for them in ponds, ditches, and even front yards after it rains!",
    eats: "Crawfish, crabs, bugs, and worms",
    eatenBy: "Alligators and hawks. Raccoons steal their eggs",
    lines: ["Ibises poke the mud for crawfish.", "Ibises have curved bills.", "Ibises like to stay in groups."],
    hint: "Look for white birds poking the mud."
  },
  heron: {
    name: "Great blue heron", hello: "This is a great blue heron!",
    fact: "The great blue heron is the biggest heron in North America. Standing up tall, it can be as tall as a kid!",
    say: "A heron stands very, very still in the water. When a fish swims by, zap! Its long neck shoots out and grabs it. When it flies, it folds its neck into an S shape.",
    eats: "Fish, frogs, crawfish, snakes, and even mice",
    eatenBy: "Almost nothing when it's grown. Raccoons and crows steal eggs",
    lines: ["Herons stand very still.", "Zap! Herons catch fish fast.", "Herons fly with their necks folded."],
    hint: "Look for a tall bird standing still in the water."
  },
  alligator: {
    name: "American alligator", hello: "This is an American alligator!",
    fact: "Alligators live in bayous, ponds, and lakes all around Katy. An alligator can hide in the water with just its eyes and nose poking out.",
    say: "Baby alligators chirp to call their mom, and she helps them get to the water. Alligators are wild, so always stay far away, and never, ever feed one!",
    eats: "Fish, turtles, snakes, birds, and anything that gets too close",
    eatenBy: "Nothing hunts a grown alligator. Herons and raccoons eat baby gators",
    lines: ["Alligators hide with just their eyes showing.", "Baby alligators chirp!", "Stay far away from alligators!"],
    hint: "Look on the muddy bank. Don't get too close!"
  },
  coyote: {
    name: "Coyote", hello: "This is a coyote!",
    fact: "Coyotes are wild cousins of dogs. They live all around Houston, even close to neighborhoods!",
    say: "At night, coyote families howl and yip to talk to each other. Coyotes are shy. If you see one, give it lots of space.",
    eats: "Mice, rabbits, bugs, fruit... almost anything!",
    eatenBy: "Almost nothing here when it's grown. A big alligator can catch one",
    lines: ["Coyotes are wild cousins of dogs.", "Coyotes howl and yip at night.", "Coyotes eat almost anything."],
    hint: "Look for a wild dog near the path."
  },
  hog: {
    name: "Wild hog", hello: "This is a wild hog!",
    fact: "Wild hogs are pigs that went wild. They dig up the ground with their strong snouts, looking for roots, bugs, and worms.",
    say: "Pigs came to Texas from far away, long ago. Now millions of wild hogs live here, and their digging makes big messes. Wild hogs can be grumpy, so always watch them from far away.",
    eats: "Roots, acorns, bugs, worms, frogs, and eggs",
    eatenBy: "Alligators and coyotes. Bobcats catch the piglets",
    lines: ["Wild hogs dig with their snouts.", "Millions of wild hogs live in Texas!", "Baby wild hogs are called piglets."],
    hint: "Look for digging by the path."
  },
  deer: {
    name: "White-tailed deer", hello: "This is a white-tailed deer!",
    fact: "White-tailed deer are the most common deer in Texas. When a deer is scared, it lifts its tail like a white flag to warn the others.",
    say: "Only boy deer, called bucks, grow antlers. Their antlers fall off every winter, and new ones grow in the spring! Baby deer, called fawns, have white spots to help them hide.",
    eats: "Leaves, acorns, grass, and flowers",
    eatenBy: "Coyotes and bobcats can catch fawns",
    lines: ["Deer lift their white tails to warn others!", "Only boy deer grow antlers.", "Baby deer have white spots."],
    hint: "Look at the edge of the woods."
  }
};

// All habitats share this species catalog, so the same animal is collected only once.
export const ANIMALS = { ...ORIGINAL_ANIMALS, ...SWAMP_ANIMALS, ...BAYOU_ANIMALS, ...WOODS_ANIMALS,
  ...BACKYARD_ANIMALS, ...PRAIRIE_ANIMALS, ...GULF_ANIMALS };
for (const animal of Object.values(ANIMALS)) {
  animal.hello ??= `This is ${/^[aeiou]/i.test(animal.name) ? "an" : "a"} ${animal.name.toLowerCase()}!`;
  animal.lines ??= [animal.fact, animal.say, `It eats ${animal.eats.toLowerCase()}.`];
  animal.source ??= "https://tpwd.texas.gov/huntwild/wild/species/";
}

export function cardSpeech(kind) {
  const animal = ANIMALS[kind];
  return `${animal.hello} ${animal.fact} ${animal.say}`;
}

export function againLines(kind) {
  const animal = ANIMALS[kind];
  return animal.lines.map(line => `${animal.name}! ${line}`);
}
