// The players screen: each player's name, to switch to them, and a Remove button that asks to be
// tapped twice.
export function fillPlayers(list, players, onPick, onRemove) {
  let armed = null; // the player whose Remove was tapped once
  const render = () => list.replaceChildren(...Object.keys(players.list).map(row));

  function row(name) {
    const row = document.createElement("div");
    row.className = "player-row";
    row.classList.toggle("current", name === players.current);
    const pick = document.createElement("button");
    pick.type = "button";
    pick.className = "player-pick";
    pick.textContent = name === players.current ? `✓ ${name}` : name;
    pick.addEventListener("click", () => onPick(name));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "player-remove";
    remove.classList.toggle("armed", armed === name);
    remove.textContent = armed === name ? "Tap again to remove" : "Remove";
    remove.setAttribute("aria-label", `Remove ${name}`);
    remove.hidden = Object.keys(players.list).length < 2; // the last player stays
    remove.addEventListener("click", () => {
      if (armed === name) return onRemove(name);
      armed = name;
      render();
    });
    row.append(pick, remove);
    return row;
  }

  render();
}
