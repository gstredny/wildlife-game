// Habitat colors plus scenery that makes each outing a different place.
import { GROUND, hash, paintOak } from './scenery.js';
export const THEMES = {
  bayou: { sky: '#6fb7e8', low: '#d9f0f7', far: '#8fb58f', near: '#6c9a6a', grass: '#9cc46e', front: '#6f9f45' },
  swamp: { sky: '#91b5bd', low: '#d3e5d9', far: '#789d8a', near: '#4f7e70', grass: '#81a984', front: '#537b61' },
  woods: { sky: '#a2c7bb', low: '#e4edd5', far: '#638f67', near: '#44734c', grass: '#84a463', front: '#547b41' },
  backyard: { sky: '#90cce9', low: '#ebf5d6', far: '#9fbd82', near: '#729458', grass: '#a1c774', front: '#73a34e' },
  prairie: { sky: '#93cde7', low: '#f6edc8', far: '#b8bf88', near: '#a1b477', grass: '#c8c184', front: '#b7ab63' },
  gulf: { sky: '#74bfdd', low: '#e3f5f6', far: '#80bdc5', near: '#60a7b4', grass: '#eddab1', front: '#e1cca0', beach: true }
};

export function paintHabitatTree(c, x, place) {
  if (place.theme !== 'swamp') return paintOak(c, x, x);
  c.fillStyle = '#756d56';
  c.beginPath();
  c.moveTo(x - 38, GROUND.back); c.lineTo(x - 12, 220);
  c.lineTo(x + 12, 220); c.lineTo(x + 38, GROUND.back); c.fill();
  for (let n = 0; n < 6; n++) {
    c.fillStyle = n % 2 ? '#547f67' : '#668b71';
    c.beginPath(); c.ellipse(x + Math.sin(n * 2) * 80, 220 - n * 22, 90 - n * 7, 30, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#a7b6a3'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x + Math.sin(n * 2) * 95, 235 - n * 22);
    c.quadraticCurveTo(x + 10, 290 - n * 20, x + 30, 272 - n * 20); c.stroke();
  }
}

export function paintHabitatDetails(c, view, place, time) {
  if (place.theme === 'gulf') {
    c.fillStyle = '#69b8c2'; c.fillRect(view.left, 330, view.width, 100);
    c.strokeStyle = '#e3f5ee'; c.lineWidth = 4;
    for (let n = 0; n < 5; n++) {
      const y = 349 + n * 16;
      c.beginPath(); c.moveTo(view.left, y);
      for (let x = view.left; x <= view.left + view.width + 40; x += 40) c.lineTo(x, y + Math.sin(x * 0.025 + time * 1.2 + n) * 3);
      c.stroke();
    }
    return;
  }
  if (place.theme === 'backyard') {
    c.fillStyle = '#ebd6aa'; c.fillRect(view.left, 373, view.width, 6); c.fillRect(view.left, 398, view.width, 6);
    for (let x = Math.floor(view.left / 35) * 35; x < view.left + view.width; x += 35) {
      c.beginPath(); c.moveTo(x, 414); c.lineTo(x, 363); c.lineTo(x + 9, 350);
      c.lineTo(x + 18, 363); c.lineTo(x + 18, 414); c.fill();
    }
  }
  if (place.theme === 'prairie') {
    for (let x = Math.floor(view.left / 35) * 35; x < view.left + view.width; x += 35) {
      c.strokeStyle = hash(x) > 0.5 ? '#a29955' : '#8c9654'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(x, 445);
      c.quadraticCurveTo(x - 5, 400, x + Math.sin(time + x) * 5, 380 - hash(x + 2) * 35); c.stroke();
    }
  }
  for (const animal of place.animals.filter(each => each.lane === 'perch')) {
    if (animal.x < view.left - 20 || animal.x > view.left + view.width + 20) continue;
    c.fillStyle = '#95794d'; c.fillRect(animal.x - 9, 365, 18, 100);
  }
}
