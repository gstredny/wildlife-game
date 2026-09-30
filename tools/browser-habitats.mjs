// Run the real-input Chrome walk for every habitat on desktop and phone.
// Requires the game served at GAME (default http://127.0.0.1:8790).
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PLACES } from '../src/places.js';
const modes = process.argv.slice(2);
for (const mode of modes.length ? modes : ['desktop', 'phone']) {
  for (const habitat of Object.keys(PLACES)) {
    const code = await new Promise(resolve => {
      const child = spawn(process.execPath, [fileURLToPath(new URL('browser-walk.mjs', import.meta.url)), mode, habitat], { stdio: 'inherit' });
      child.on('exit', resolve);
    });
    if (code !== 0) process.exit(code ?? 1);
  }
}
console.log('PASS: every requested habitat and device mode');
