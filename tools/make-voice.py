# Records every line the game can say as a natural-sounding voice clip, using the open-weight Qwen3-TTS
# speech model (Apache-2.0) on the Mac's GPU through mlx-audio, so the game can play real audio instead of
# the device's robotic voice. Qwen3-TTS speaks each line fresh and now and then slurs or skips a word, so
# every clip is written back down by a small speech-to-text model (Parakeet) and recorded again, up to three
# tries, when the words don't match; the closest try is kept and any line still off is listed at the end,
# to listen to by ear.
# Words the voice gets wrong are respelled the way they sound, in tools/say-like.json ("roseate": "Rosie-it"),
# for the voice only; the screen and manifest.json keep the real spelling.
# A clip's name is a hash of its spoken text, voice and speed, so a rerun only records lines that are new or changed;
# delete a clip to record it again. The browser looks each line up by its exact text in manifest.json.
#
# Setup, once, on an Apple-silicon Mac (Python 3.10 to 3.12; the first run downloads about 3 GB of models):
#   python3.12 -m venv .venv && .venv/bin/pip install -r tools/voice-requirements.txt
#
# Usage:
#   node tools/voice-lines.mjs > lines.json
#   .venv/bin/python tools/make-voice.py lines.json voice [--voice ryan] [--speed 1.0] [--prune]
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import warnings
from pathlib import Path

ENGINE = "Qwen3-TTS-12Hz-1.7B-CustomVoice"
MODEL = "mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit"
CHECKER = "mlx-community/parakeet-tdt_ctc-110m"
STYLE = "A warm, friendly park ranger talking to young children, calm and cheerful"
TRIES = 3
CLOSE_ENOUGH = 0.08  # share of letters the checker may hear differently (it mishears some animal names)
RATE = 24000
MS = RATE // 1000  # samples per millisecond
BITRATE = "48k"
LOUDNESS_DB = -20  # speech level of every clip
PEAK_DB = -1  # no sample goes louder than this
SETUP = "pip install -r tools/voice-requirements.txt"
SAY_LIKE = json.loads(Path(__file__).with_name("say-like.json").read_text(encoding="utf-8"))


def clip_id(text, voice, speed):
    return hashlib.sha1(f"{text}\n{voice}\n{speed}\n{STYLE}".encode("utf-8")).hexdigest()[:12]


def spoken(text):
    """The line as the voice should read it, with hard words respelled the way they sound."""
    for word, sound in SAY_LIKE.items():
        text = re.sub(rf"\b{re.escape(word)}\b", sound, text, flags=re.IGNORECASE)
    return text


def letters(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def mismatch(said, heard):
    """The share of the line's letters the checker heard wrong, missed, or added. Letters, not words, so
    "spoon bill" for "spoonbill" still counts as a match."""
    said, heard = letters(said), letters(heard)
    row = list(range(len(heard) + 1))
    for i, letter in enumerate(said, 1):
        previous, row[0] = row[0], i
        for j, other in enumerate(heard, 1):
            previous, row[j] = row[j], min(row[j] + 1, row[j - 1] + 1, previous + (letter != other))
    return row[-1] / max(len(said), 1)


def voice_maker(voice, speed):
    """Loads the voice and the checker once and returns a function that records one line to an MP3 file."""
    warnings.filterwarnings("ignore")
    os.environ.setdefault("HF_HUB_VERBOSITY", "error")
    try:
        import imageio_ffmpeg
        import numpy as np
        from mlx_audio.stt.utils import load as load_checker
        from mlx_audio.tts.utils import load_model
    except ImportError as error:
        sys.exit(f"make-voice: {error.name} is not installed. Set up the voice engine first:\n  {SETUP}")
    model = load_model(MODEL)
    checker = load_checker(CHECKER)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    def record(text, path):
        parts = [np.array(result.audio) for result in model.generate(text=spoken(text), voice=voice, instruct=STYLE,
                                                                       speed=speed, lang_code="en")]
        if not parts:
            sys.exit(f"make-voice: Qwen3-TTS made no sound for {text!r}")
        audio = np.concatenate(parts)
        # Cut the model's long silent edges to 20 ms, then pad to 60 ms of quiet before and 130 ms after.
        loud = np.flatnonzero(np.abs(audio) > np.abs(audio).max() * 10 ** (-50 / 20))
        audio = audio[max(loud[0] - 20 * MS, 0):loud[-1] + 20 * MS]
        # Every clip is matched on the level of its speech (20 ms frames within 30 dB of the loudest), and
        # the odd peak that would pass PEAK_DB is turned down on its own for a few milliseconds instead of
        # turning the whole clip down.
        frame = 20 * MS
        frames = np.sqrt((audio[:len(audio) // frame * frame].reshape(-1, frame) ** 2).mean(axis=1))
        speech = frames[frames > frames.max() * 10 ** (-30 / 20)]
        audio = audio * 10 ** (LOUDNESS_DB / 20) / np.sqrt((speech ** 2).mean())
        room = np.minimum(1, 10 ** (PEAK_DB / 20) / np.maximum(np.abs(audio), 1e-9))
        room = np.lib.stride_tricks.sliding_window_view(np.pad(room, frame // 2, mode="edge"), frame + 1).min(axis=1)
        audio *= np.convolve(room, np.hanning(frame + 1) / np.hanning(frame + 1).sum(), mode="same")
        audio = np.concatenate([np.zeros(60 * MS), audio, np.zeros(130 * MS)])
        subprocess.run([ffmpeg, "-v", "error", "-y", "-f", "f32le", "-ar", str(RATE), "-ac", "1", "-i", "-",
                        "-c:a", "libmp3lame", "-b:a", BITRATE, "-id3v2_version", "0", "-f", "mp3", str(path)],
                       input=audio.astype("<f4").tobytes(), check=True)
        return len(audio) / RATE

    def make(text, path):
        """Records up to TRIES times and keeps the try the checker hears closest to the text."""
        tries = []
        for attempt in range(TRIES):
            partial = path.with_suffix(f".try{attempt}.mp3")
            seconds = record(text, partial)
            tries.append((mismatch(text, checker.generate(str(partial)).text), seconds, partial))
            if tries[-1][0] <= CLOSE_ENOUGH:
                break
        off, seconds, best = min(tries, key=lambda each: each[0])
        best.replace(path)
        for _, _, other in tries:
            other.unlink(missing_ok=True)
        return seconds, off, len(tries)

    return make


def main():
    parser = argparse.ArgumentParser(description="Record the game's spoken lines as MP3 clips with Qwen3-TTS.")
    parser.add_argument("lines", help="JSON array of every line the game can say")
    parser.add_argument("out_dir", help="folder for the clips and manifest.json")
    parser.add_argument("--voice", default="ryan", help="Qwen3-TTS speaker (default ryan, a warm male voice)")
    parser.add_argument("--speed", type=float, default=1.0, help="speaking speed (default 1.0)")
    parser.add_argument("--prune", action="store_true", help="delete clips the new manifest no longer uses")
    args = parser.parse_args()

    lines = json.loads(Path(args.lines).read_text(encoding="utf-8"))
    if not isinstance(lines, list) or not all(isinstance(line, str) for line in lines):
        sys.exit(f"make-voice: {args.lines} must be a JSON array of strings")
    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    clips = {text: clip_id(spoken(text), args.voice, args.speed) + ".mp3" for text in sorted(set(lines)) if text.strip()}

    make = None
    generated = reused = pruned = 0
    doubtful = []
    for text, name in clips.items():
        if (out / name).exists():
            reused += 1
            continue
        make = make or voice_maker(args.voice, args.speed)
        started = time.time()
        seconds, off, tries = make(text, out / name)
        generated += 1
        if off > CLOSE_ENOUGH:
            doubtful.append((off, name, text))
        print(f"{name}  {seconds:4.1f}s audio in {time.time() - started:4.1f}s, {tries} tr{'y' if tries == 1 else 'ies'}, "
              f"{off:4.0%} off  {text}", flush=True)

    manifest = {"voice": args.voice, "speed": args.speed, "engine": ENGINE, "style": STYLE, "clips": clips}
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.prune:
        used = set(clips.values())
        for path in out.glob("*.mp3"):
            if path.name not in used:
                path.unlink()
                pruned += 1
    total = sum((out / name).stat().st_size for name in clips.values())
    print(f"generated {generated}, reused {reused}, pruned {pruned}, total {total} bytes in {len(clips)} clips")
    for off, name, text in sorted(doubtful, reverse=True):
        print(f"listen to {name} ({off:.0%} off): {text}")


if __name__ == "__main__":
    main()
