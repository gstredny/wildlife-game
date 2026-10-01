import { againLines, ANIMALS, cardSpeech } from "./animals.js";
import { PLACES } from "./places.js";

export const VOICE_ON = "Voice on!";
export const WALK_CLOSER = "Walk closer to take its picture!";
export const GAME_OVER = "Oh no! You're out of hearts. Let's try again!";
export const FINALE = "You explored every trail around Katy! You're a Master Ranger!";
// A new animal's card asks one of these first, so a child can shout out a guess.
export const GUESSES = ["What animal is this?", "What creature is this?", "Do you know this animal?"];

// Every line the game can say. tools/make-voice.py records each one (see README), and
// tests/voice-clips.test.js fails if one has no recording.
export function allLines() {
  const lines = [VOICE_ON, WALK_CLOSER, GAME_OVER, FINALE, ...GUESSES];
  for (const kind of Object.keys(ANIMALS)) lines.push(cardSpeech(kind), ...againLines(kind), ANIMALS[kind].hint);
  for (const place of Object.values(PLACES)) lines.push(place.welcome, place.ranger);
  return [...new Set(lines)];
}
