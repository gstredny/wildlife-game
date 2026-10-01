// The players screen: each player's name, the level they are on, how many animals they found, what
// they found lately, and a Remove button that asks to be tapped twice.
import { ANIMALS } from "./animals.js";
import { allBeaten, currentLevel, levelNumber } from "./levels.js";
import { PLACES } from "./places.js";

const RECENT = 5;

export function fillPlayers(list, players, onPick, onRemove) {
  let armed = null; // the player whose Remove was tapped once
  const render = () => list.replaceChildren(...Object.entries(players.list).map(([name, player]) => row(name, player)));

  function row(name, player) {
    const row = document.createElement("div");
    row.className = "player-row";
    row.classList.toggle("current", name === players.current);
    const pick = document.createElement("button");
    pick.type = "button";
    pick.className = "player-pick";
    const title = document.createElement("strong");
    title.textContent = name === players.current ? `✓ ${name}` : name;
    const level = document.createElement("span");
    level.className = "player-level";
    level.textContent = levelLabel(player);
    const count = document.createElement("span");
    count.className = "player-count";
    count.textContent = `${player.found.length} of ${Object.keys(ANIMALS).length} animals`;
    pick.append(title, level, count);
    const finds = player.log.slice(0, RECENT).map(({ kind, place, at }) => `${ANIMALS[kind].name} · ${PLACES[place].name} · ${when(at)}`);
    for (const text of finds.length ? finds : ["No animals found yet"]) {
      const find = document.createElement("span");
      find.className = "player-find";
      find.textContent = text;
      pick.append(find);
    }
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

// "Level 3 · Bayou Trail", or the title once every level is beaten.
export function levelLabel(player) {
  if (allBeaten(player)) return "Master Ranger · every trail explored";
  const key = currentLevel(player);
  return `Level ${levelNumber(key)} · ${PLACES[key].name}`;
}

// "today 2:14 PM" for a find today, otherwise the day: "Sep 29".
function when(at) {
  const date = new Date(at);
  return date.toDateString() === new Date().toDateString()
    ? `today ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}
