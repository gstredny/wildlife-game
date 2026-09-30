# Texas habitats and a bigger Field Guide

Date: 2026-09-30
Status: implemented locally; browser QA and photograph downloads blocked

## Intent contract

Today: one Bayou Trail has eight animals. The home screen and Field Guide assume one place.

After: children can choose six distinct local or nearby Texas habitats, discover about 50 animals,
and learn from real photos, identification facts, recorded Ranger Mike narration, and TPWD sources.
Swamp Boardwalk includes bullfrogs, night herons, wood ducks, and alligators. Bayou Trail includes
coyotes, white-tailed deer, and more birds. Discoveries persist across habitats and work offline.
The scope is a broad local field guide, not a claim to contain every species in Texas.

## Slice order and verification

1. Connect habitat selection through walking, progress, cards, and the guide; verify the first two
   habitats in Chrome before expanding the catalog.
2. Add the six habitat rosters, species-specific drawings, sourced facts, licensed photos, and voices.
3. Verify every habitat, saved/shared progress, all cards, portrait and landscape layouts, and offline.

## Done criteria

- [x] `npm test`: rules, all roster/card/photo/painter links, recorded lines, and offline assets pass.
- [ ] `node tools/browser-habitats.mjs`: all six areas exercised, all species discovered, guide replay,
      saved progress, and offline return work; desktop and phone screenshots inspected.
- [ ] `node tools/shot.mjs`: animal drawings inspected on the zoo sheet.
- [x] `git diff --check`: no whitespace errors.

## Attempt log (append-only)

- Initial inspection: working tree clean, no Git lock files, no other agent assigned mutation here.
  System process listing is unavailable in this sandbox. The prior task is complete locally.
  Fish-game is read-only reference; its habitat selection and global collection inform this slice.
- Read TPWD Wildlife Fact Sheets and requested a bounded read-only source briefing.
- In-app browser runtime has no connected browsers. Use this project's existing headless Chrome
  verification scripts for real rendering and interaction checks.
- Slice 1: two habitat buttons now connect to walking and habitat progress; Field Guide has all-species
  and habitat filters. `node --test tests/trail.test.js tests/field-guide.test.js`: 10 passed, 0 failed,
  0 skipped. Runtime validation is blocked: local server bind is denied; both Chrome launch paths
  fail; Browser has no connected instances, and Chrome DevTools reports a profile already running.
- Photo retrieval: both shell and Node fetch cannot resolve/reach public image hosts. Continue with
  verified Commons metadata and local species drawings as explicit offline fallbacks; downloading
  the real photos remains a verification criterion. Cached Ranger Mike voice model loads offline.
- Expanded content: 51 species, 6 habitats, 65 habitat encounters. Source reader checked all 43 new
  species plus author/license metadata for all 43 Commons photos. Seasonal and rare visitors are
  described in the facts. All 43 have original local SVG illustrations for offline or failed photos.
- Voice pass 1: generated 218, reused 46, 264 total clips. Voice pass 2 after final place rosters:
  generated 18, reused 258, pruned 6, total 276 clips (12,709,440 bytes), same Ranger Mike voice.
- First full `npm test`: 17 passed, 1 failed, 0 skipped. Failure was the original test requiring
  exactly eight bayou species; update it to preserve those eight while verifying added wildlife.
- Expanded integration run: 29 passed, 1 failed, 0 skipped. The test DOM parser omitted numeric
  heading tags (`h2`), so card-name was absent from the fixture. Fix the fixture and rerun.
- Screen integration fixture corrected: `npm test` 30 passed, 0 failed, 0 skipped. This drives actual
  main.js through every habitat, collects all 51 animals, switches guide filters, replays a card, and
  confirms a queued card cannot interrupt a newly chosen place. Canvas calls are checked for finite
  numeric inputs; this is not a substitute for visual browser QA.
- Real photo download attempt: `python3 tools/fetch-habitat-photos.py bullfrog` failed with a DNS
  error. No photographic downloads were made. Existing eight local WebPs remain intact.
- Chrome version command works, but a direct screenshot launch and a debugging-pipe launch both
  abort (SIGABRT). The browser test runner records this as blocked without running the game.
- Final `npm test`: 31 passed, 0 failed, 0 skipped. `node --check tools/browser-walk.mjs` and
  `node --check tools/browser-habitats.mjs` both exit 0. `git diff --check` exits 0.
- `node tools/browser-habitats.mjs desktop`: exit 1, output: "Browser verification blocked: Chrome
  could not start." No browser traversal or screenshots ran. Browser and photograph criteria remain
  open; implementation is local, uncommitted, unpushed, and undeployed.
- Review session (Claude Code, network and Chrome available): `npm test` 31 passed, 0 failed, 0 skipped.
  `node tools/browser-habitats.mjs desktop phone` (game served on 127.0.0.1:8790): exit 0, "PASS: every
  requested habitat and device mode", 12 runs, no page errors, 290 screenshots in a scratch folder. Sample
  inspected (start screens, swamp/gulf walks, bullfrog card): renders correctly. Not every screenshot was
  inspected, so the box stays open. Findings: 1) all 43 remote photos load (HTTP 200) but the online "All
  animals" guide pulls 43 requests / 7,291 KB of 960x720 images shown at 195x146; 2) pelican, kestrel,
  bullfrog, and leopard frog photos show the animal too small or hidden to see; 3) any CACHE rename makes
  every device re-download all 13 MB of voice clips; 4) the six-habitat start screen needs scrolling at
  1280x800 and 844x390; 5) the browser walk blocks Wikimedia, so the online photo path has no browser test.
