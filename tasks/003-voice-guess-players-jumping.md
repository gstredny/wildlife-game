# A better voice, guessing, players, jumping, and nine Katy animals

Date: 2026-09-30
Status: done and live (pushed to main; GitHub Pages https://gstredny.github.io/wildlife-game/)

## Intent contract (George's words)

"Can we try a different voice? It's still this male voice, sounds still robotic ... Is there any way we
can add more animals? There's 51. Can we get up to 60 with ones that are literally only here, only in
Katy?" "Just walking around clicking on pictures ... my kids gonna get bored ... it would be cooler if
you encountered the animals as you're trying to [play] Super Mario Land ... it'll be nice if you could
refresh the page where certain people could play or see their activity." "Pause before it started
talking and say, 'What animal is this?' ... to let them respond." "Have the user just sit with the
picture so they can think ... when they want, they click the button for it to be speaking and showing
them what the animal is." "The voice mispronounces crucial animal names like Roseate spoonbill."

Today: Ranger Mike is Kokoro `am_michael` (robotic); a card names and reads the animal at once; one
shared Field Guide per device; the trail is a flat walk; 51 animals.

After:
1. Ranger Mike is Qwen3-TTS speaker `ryan` (George picked it by ear from four samples), with hard
   names respelled for the voice only (George checked all 60 names by ear).
2. A new animal's card shows the photo and "What animal is this?" and waits until the child taps
   **Tell me!**, then shows the name and reads the card.
3. Players: each player has their own Field Guide; a players screen shows counts and latest finds.
   Saved on the device only (no accounts, no server).
4. Each trail is an obstacle course: logs to jump over or stand on, stars to catch, a jump button.
5. 60 animals: nine Katy specials, each with a photo, drawing, sourced facts, and voice.
   Nothing lives only in Katy; the nine are Texas-only, mostly-Texas, or animals Katy is known for.

## Done criteria

- [x] `npm test`: all pass, including the recording check for every line (43 passed, 0 failed, 0 skipped).
- [x] `node tools/browser-habitats.mjs desktop phone`: all six places, 12 runs, no page errors.
- [x] Zoo sheet of the nine new drawings inspected; photo sheet of the nine new photos inspected.
- [x] `git diff --check` clean. Pushed and live (George approved the push).

## Attempt log (append-only)

- Voice samples: Kokoro am_michael, am_puck, am_fenrir, af_heart, then Qwen3-TTS 1.7B CustomVoice
  (mlx-audio 0.5.7) ryan and aiden. The bf16 model download stalled over xet at 258 MB; the 8-bit model
  with `HF_HUB_DISABLE_XET=1` downloaded. George picked Ryan.
- Guess card: 8891f26 (with a 7 s auto-reveal), then de9d95b removed the timer at George's request.
  `node tools/browser-walk.mjs phone swamp`: PASS; the question card and answer card inspected.
- Players: 7c37d54. Browser walk (phone gulf) adds a player and checks the empty guide: PASS.
- Jumping: a468ac1. Browser walk holds jump + right (phone bayou, desktop woods): PASS; walking and
  mid-jump screenshots inspected.
- Checker: whisper-small-mlx has no tokenizer files in mlx-community's repos (every size), so
  mlx-audio cannot load it. Switched to parakeet-tdt_ctc-110m. Word-level checking flagged
  "spoon bill" for "spoonbill"; compare letters instead.
- Names: all 60 names recorded numbered with Ryan and played to George: "All sound right" (roseate
  already respelled "Rosie-it").
- Research reader swapped the Texas spiny lizard (few records near Katy) for the sandhill crane.
- Voice record, Ryan: generated 279, 13 took a retake, 6 flagged. Transcripts show 5 flags are the
  checker's spelling ("Sicada", "Thirteen" for 13, "Rosie it"); the laughing gull clip stays 11% off
  after 3 more tries (the checker writes "ha-ha-ha call" as "hall"). Committed 9f6893a.
- New animals' lines: generated 49, reused 275, pruned 4 (old welcome counts), 324 clips. The bat
  flags are "250,000" read as "two hundred fifty thousand" (correct). The caracara fact clip stays
  8% off after 3 tries ("A Corasteraw has"); George to listen, with the gull clip.
- Nine animals: 9762f18. Zoo sheet of the nine drawings inspected (caracara cap lowered after the
  first look); photo sheet of the nine photos inspected. `npm test`: 43 passed, 0 failed, 0 skipped.
  `node tools/browser-habitats.mjs desktop`: PASS, 6 of 6 places, all 60 animals found, no page errors.
- Cache renamed wildlife-habitats-v3 so phones update.
- Final tree (cache v3): `node tools/browser-habitats.mjs desktop phone`: "PASS: every requested habitat
  and device mode", 12 of 12 runs, no page errors. `npm test`: 43 passed, 0 failed, 0 skipped.
- Deployed (George approved): `git push origin main` e2def01..50ab791; GitHub Pages "built 50ab791".
  Live sw.js has CACHE "wildlife-habitats-v3"; voice manifest (ryan, 324 clips), crawfish photo,
  snow goose thumbnail, paint-bat.js, players.js and a new clip all return 200.
  `GAME=https://gstredny.github.io/wildlife-game/ node tools/browser-walk.mjs phone prairie`: exit 0,
  PASS, 15 animals, Junior Ranger, offline return, players step, no page errors.
- George listened to the two flagged clips (laughing gull, caracara fact) twice: "Both sound right".
