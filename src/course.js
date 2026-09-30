// The obstacle course along a trail, like a Super Mario level: logs to jump over, stars to catch, and
// the place's `hazard` coming at the explorer. Every other gap between two animals has a log with stars
// arcing over it; the other gaps have a hazard lane, with stars floating up high, caught with a jump.
// A lane runs past the bush on its left to the log behind it, so a child waiting at the bush has to
// jump too. Heights are measured up from the path.
export function layCourse(animals, hazard) {
  const logs = [];
  const stars = [];
  const lanes = [];
  animals.slice(1).forEach((animal, index) => {
    const x = (animals[index].x + animal.x) / 2;
    if (index % 2 === 0) {
      const log = { x, w: 90 + index % 4 * 15, h: 45 + index % 3 * 10 };
      logs.push(log);
      for (const dx of [-75, 0, 75]) stars.push({ x: x + dx, y: log.h + (dx ? 85 : 125) });
    } else {
      for (const dx of [-55, 0, 55]) stars.push({ x: x + dx, y: dx ? 135 : 165 });
      const behind = logs.at(-1);
      lanes.push({ from: animal.x - 120, to: behind.x + behind.w / 2 + 30, offset: index * 0.37, kind: hazard });
    }
  });
  return { logs, stars, lanes };
}
