// The big name buttons on the trail map, one per player: one tap switches to that player.
export function fillNames(box, players, onPick) {
  box.replaceChildren(...Object.keys(players.list).map(name => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "name-button";
    button.classList.toggle("current", name === players.current);
    button.setAttribute("aria-pressed", String(name === players.current));
    button.textContent = name;
    button.addEventListener("click", () => onPick(name));
    return button;
  }));
}
