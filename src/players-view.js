// The players screen: each player's name, how many animals they found, and what they found lately.
import { ANIMALS } from "./animals.js";
import { PLACES } from "./places.js";

const RECENT = 5;

export function fillPlayers(list, players, onPick) {
  list.replaceChildren(...Object.entries(players.list).map(([name, player]) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "player-row";
    row.classList.toggle("current", name === players.current);
    const title = document.createElement("strong");
    title.textContent = name === players.current ? `✓ ${name}` : name;
    const count = document.createElement("span");
    count.className = "player-count";
    count.textContent = `${player.found.length} of ${Object.keys(ANIMALS).length} animals`;
    row.append(title, count);
    const finds = player.log.slice(0, RECENT).map(({ kind, place, at }) => `${ANIMALS[kind].name} · ${PLACES[place].name} · ${when(at)}`);
    for (const text of finds.length ? finds : ["No animals found yet"]) {
      const find = document.createElement("span");
      find.className = "player-find";
      find.textContent = text;
      row.append(find);
    }
    row.addEventListener("click", () => onPick(name));
    return row;
  }));
}

// "today 2:14 PM" for a find today, otherwise the day: "Sep 29".
function when(at) {
  const date = new Date(at);
  return date.toDateString() === new Date().toDateString()
    ? `today ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}
