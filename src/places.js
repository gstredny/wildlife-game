// The trails a child can walk. Distances are in world units: the screen is 600 units tall, and the
// explorer walks about 260 units a second. Each animal lives near `x` and wanders `roam` units either
// way (`period` seconds there and back). `lane` says where it lives: "back" is the grass and shallow
// water behind the path, "tree" is on a tree trunk. `size` is its height (see src/painters.js).
export const PLACES = {
  bayou: {
    name: "Bayou Trail",
    blurb: "Herons, gators and deer, like George Bush Park",
    welcome: "Welcome to the Bayou Trail! I'm Ranger Mike. Eight animals live along this trail. Walk along, and tap an animal to take its picture!",
    end: "That's the end of the Bayou Trail! Walk back to find the animals you missed.",
    ranger: "You found all eight animals on the Bayou Trail! You're a Junior Ranger!",
    length: 5600,
    // The bayou runs behind the path here, and the path becomes a boardwalk. The alligator basks on
    // the mud bar.
    water: { from: 1150, to: 3350, bar: 3120 },
    // Big trees behind the path. The cicada sings on the first one.
    trees: [320, 760, 3700, 4200, 4750, 5150],
    animals: [
      { kind: "cicada", x: 760, lane: "tree", size: 46 },
      { kind: "heron", x: 1520, lane: "back", size: 132, roam: 30, period: 30 },
      { kind: "ibis", x: 1960, lane: "back", size: 72, roam: 90, period: 14 },
      { kind: "ibis", x: 2080, lane: "back", size: 68, roam: 70, period: 17 },
      { kind: "ibis", x: 2170, lane: "back", size: 72, roam: 80, period: 12 },
      { kind: "spoonbill", x: 2600, lane: "back", size: 92, roam: 70, period: 20 },
      { kind: "alligator", x: 3120, lane: "back", size: 30, roam: 20, period: 40 },
      { kind: "coyote", x: 3950, lane: "back", size: 82, roam: 160, period: 16 },
      { kind: "hog", x: 4480, lane: "back", size: 70, roam: 60, period: 22 },
      { kind: "deer", x: 5000, lane: "back", size: 150, roam: 40, period: 26 }
    ]
  }
};

export function placeKinds(place) {
  return [...new Set(place.animals.map(animal => animal.kind))];
}
