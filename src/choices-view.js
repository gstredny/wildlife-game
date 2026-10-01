// The name buttons on an animal's card. A wrong name wiggles and grays out; the right one calls
// `onRight` with whether it was the first name tapped.
import { ANIMALS } from "./animals.js";
import { pickChoices } from "./choices.js";

export function fillChoices(box, kind, onRight) {
  let missed = false;
  box.replaceChildren(...pickChoices(kind).map(choice => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = ANIMALS[choice].name;
    button.addEventListener("click", () => {
      if (choice === kind) return onRight(!missed);
      missed = true;
      button.disabled = true;
      button.classList.add("wrong");
    });
    return button;
  }));
}
