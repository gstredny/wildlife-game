// The names a child picks from on an animal's card: the right one and two other animals, picked fresh
// and mixed up every time, so the answer can't be learned by where it sits.
import { ANIMALS } from "./animals.js";

export const CHOICES = 3;

export function pickChoices(kind, random = Math.random) {
  const others = Object.keys(ANIMALS).filter(other => other !== kind);
  const choices = [kind];
  while (choices.length < CHOICES) choices.push(others.splice(Math.floor(random() * others.length), 1)[0]);
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}
