// The obstacle course along a trail, like a Super Mario level: logs to jump over and stars to catch.
// Every other gap between two animals has a log with stars arcing over it; the other gaps have stars
// floating up high, caught with a jump. Heights are measured up from the path.
export function layCourse(animals) {
  const logs = [];
  const stars = [];
  animals.slice(1).forEach((animal, index) => {
    const x = (animals[index].x + animal.x) / 2;
    if (index % 2 === 0) {
      const log = { x, w: 90 + index % 4 * 15, h: 45 + index % 3 * 10 };
      logs.push(log);
      for (const dx of [-75, 0, 75]) stars.push({ x: x + dx, y: log.h + (dx ? 85 : 125) });
    } else {
      for (const dx of [-55, 0, 55]) stars.push({ x: x + dx, y: dx ? 135 : 165 });
    }
  });
  return { logs, stars };
}
