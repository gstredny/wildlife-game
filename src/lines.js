import { againLines, ANIMALS, cardSpeech } from "./animals.js";
import { PLACES } from "./places.js";

export const VOICE_ON = "Voice on!";
export const FIRST_TIP = "Look! An animal! Tap it to take its picture.";
export const WALK_CLOSER = "Walk closer to take its picture!";
// A new animal's card asks one of these first, so a child can shout out a guess.
export const GUESSES = ["What animal is this?", "What creature is this?", "Do you know this animal?"];

// Every line the game can say. tools/make-voice.py records each one (see README), and
// tests/voice-clips.test.js fails if one has no recording.
export function allLines() {
  const lines = [VOICE_ON, FIRST_TIP, WALK_CLOSER, ...GUESSES];
  for (const kind of Object.keys(ANIMALS)) lines.push(cardSpeech(kind), ...againLines(kind), ANIMALS[kind].hint);
  for (const place of Object.values(PLACES)) lines.push(place.welcome, place.end, place.ranger);
  return [...new Set(lines)];
}
