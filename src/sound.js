// Little sound effects, made on the fly with the Web Audio API: no sound files, works offline.
// Phones only allow sound after a tap, so unlock() runs on the first touch, click or key.
const NOTES = { G4: 392, C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5 };

export function createSound(AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext) {
  let context = null;
  let volume = null;
  let muted = false;

  function tone({ from, to = from, start = 0, length = 0.12, type = "sine", gain = 0.5 }) {
    const at = context.currentTime + start;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, at);
    if (to !== from) oscillator.frequency.exponentialRampToValueAtTime(to, at + length);
    envelope.gain.setValueAtTime(0.0001, at);
    envelope.gain.exponentialRampToValueAtTime(gain, at + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + length);
    envelope.connect(volume);
    oscillator.connect(envelope);
    oscillator.start(at);
    oscillator.stop(at + length + 0.02);
  }

  // A short burst of noise, for the camera's click.
  function click(start, length, gain) {
    const at = context.currentTime + start;
    const samples = Math.floor(context.sampleRate * length);
    const buffer = context.createBuffer(1, samples, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < samples; index++) data[index] = (Math.random() * 2 - 1) * (1 - index / samples) ** 3;
    const source = context.createBufferSource();
    const envelope = context.createGain();
    source.buffer = buffer;
    envelope.gain.value = gain;
    source.connect(envelope);
    envelope.connect(volume);
    source.start(at);
  }

  const CUES = {
    // Click-clack: a camera shutter.
    shutter() {
      click(0, 0.03, 0.9);
      click(0.07, 0.04, 0.6);
    },
    // A sparkly chime: a new animal for the Field Guide.
    found() {
      [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6].forEach((note, index) =>
        tone({ from: note, start: 0.12 + index * 0.08, length: 0.26, type: "triangle", gain: 0.35 }));
    },
    // A little fanfare: every animal on the trail is found.
    ranger() {
      [[NOTES.G4, 0], [NOTES.C5, 0.14], [NOTES.E5, 0.28], [NOTES.G5, 0.42], [NOTES.E5, 0.62], [NOTES.G5, 0.76]]
        .forEach(([note, start]) => tone({ from: note, start, length: start > 0.6 ? 0.5 : 0.18, type: "square", gain: 0.16 }));
    }
  };

  return {
    get muted() { return muted; },
    setMuted(value) { muted = value; },
    unlock() {
      if (context || !AudioContextClass) return;
      context = new AudioContextClass();
      volume = context.createGain();
      volume.gain.value = 0.5;
      volume.connect(context.destination);
    },
    play(cue) {
      if (muted || !context) return;
      if (context.state === "suspended") context.resume();
      CUES[cue]();
    }
  };
}
