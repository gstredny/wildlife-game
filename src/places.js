import { layCourse } from './course.js';
// Six places to explore around Katy and on a trip to the Texas coast.
// Entries are [species, drawing size, lane]. A shared species counts once in the Field Guide.
const HABITATS = {
  swamp: {
    name: 'Swamp Boardwalk', theme: 'swamp',
    blurb: 'Bullfrogs, wood ducks, and night herons among the cypress trees',
    roster: [
      ['bullfrog', 74], ['nightHeron', 100], ['woodDuck', 83], ['leopardFrog', 63],
      ['slider', 70], ['dragonfly', 62, 'air'], ['heron', 132], ['ibis', 72],
      ['spoonbill', 92], ['watersnake', 78], ['cottonmouth', 84], ['alligator', 30]
    ]
  },
  bayou: {
    name: 'Bayou Trail', theme: 'bayou',
    blurb: 'Water birds, playful otters, coyotes, and white-tailed deer',
    roster: [
      ['cicada', 46, 'tree'], ['heron', 132], ['ibis', 72], ['spoonbill', 92],
      ['alligator', 30], ['egret', 125], ['kingfisher', 75, 'air'], ['redwing', 70],
      ['nutria', 80], ['riverOtter', 80], ['coyote', 82], ['hog', 70], ['deer', 150]
    ]
  },
  woods: {
    name: 'Woodland Walk', theme: 'woods',
    blurb: 'Shady oaks, woodpeckers, armadillos, and a watchful owl',
    roster: [
      ['squirrel', 82, 'tree'], ['woodpecker', 78, 'tree'], ['boxTurtle', 68],
      ['armadillo', 90], ['raccoon', 95], ['opossum', 90], ['barredOwl', 110, 'tree'],
      ['bobcat', 95], ['coyote', 82], ['deer', 150]
    ]
  },
  backyard: {
    name: 'Backyard Safari', theme: 'backyard',
    blurb: 'Meet the birds, butterflies, and little creatures next door',
    roster: [
      ['cardinal', 75, 'tree'], ['blueJay', 78, 'tree'], ['mockingbird', 76],
      ['dove', 78], ['grackle', 80], ['hummingbird', 48, 'air'], ['anole', 60, 'tree'],
      ['monarch', 56, 'air'], ['toad', 61], ['squirrel', 82], ['cicada', 46, 'tree']
    ]
  },
  prairie: {
    name: 'Katy Prairie', theme: 'prairie',
    blurb: 'Tall grasses, meadowlarks, rabbits, and soaring hawks',
    roster: [
      ['rabbit', 83], ['meadowlark', 78], ['killdeer', 70], ['kestrel', 78, 'perch'],
      ['scissortail', 70, 'perch'], ['hawk', 115, 'perch'], ['monarch', 56, 'air'],
      ['armadillo', 90], ['coyote', 82], ['deer', 150]
    ]
  },
  gulf: {
    name: 'Gulf Shore', theme: 'gulf',
    blurb: 'A Galveston day trip: pelicans, sandpipers, crabs, and sea turtles',
    roster: [
      ['pelican', 118], ['gull', 77], ['tern', 67], ['avocet', 106],
      ['plover', 61], ['crab', 58], ['seaTurtle', 120], ['egret', 125], ['spoonbill', 92]
    ]
  }
};

// These stay put instead of wandering along the trail.
const STILL = new Set(['alligator', 'cottonmouth', 'watersnake', 'boxTurtle', 'slider', 'seaTurtle']);

function makePlace(key, habitat) {
  const animals = habitat.roster.map(([kind, size, lane = 'back'], index) => ({
    kind, size, lane, x: 650 + index * 520,
    ...(lane === 'back' && !STILL.has(kind)
      ? { roam: 35, period: 17 + index % 5 * 3 } : {})
  }));
  const length = animals.at(-1).x + 650;
  const trees = [...new Set([
    ...(key === 'gulf' || key === 'prairie' ? [] : [280, length - 300]),
    ...animals.filter(animal => animal.lane === 'tree').map(animal => animal.x),
    ...(key === 'woods' ? animals.map(animal => animal.x - 140) : [])
  ])].sort((a, b) => a - b);
  // The alligator basks on a mud bar; places without water have `water: null`.
  const bar = animals.find(animal => animal.kind === 'alligator')?.x;
  const water = key === 'swamp' || key === 'gulf' ? { from: 150, to: length - 150, bar }
    : key === 'bayou' ? { from: 950, to: 5530, bar } : null;
  return {
    name: habitat.name, theme: habitat.theme, blurb: habitat.blurb,
    welcome: `Welcome to ${habitat.name}! I'm Ranger Mike. ${animals.length} animals live here. Walk along and tap an animal to take its picture!`,
    end: `That's the end of ${habitat.name}! Walk back to look for the animals you missed.`,
    ranger: `You found every animal in ${habitat.name}! You're a Junior Ranger!`,
    length, trees, water, animals, ...layCourse(animals)
  };
}
export const PLACES = Object.fromEntries(Object.entries(HABITATS).map(([key, habitat]) => [key, makePlace(key, habitat)]));
export function placeKinds(place) {
  return [...new Set(place.animals.map(animal => animal.kind))];
}
