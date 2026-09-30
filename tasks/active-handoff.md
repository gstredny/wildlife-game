# Active handoff — Wildlife Game

2026-09-30. Current branch main; changes remain uncommitted and unpushed. No deployment.

Active task: [002-texas-habitats.md](002-texas-habitats.md).

Implemented: 6 habitat choices, 51 species (65 habitat encounters), distinct scenery, per-habitat
progress and Junior Ranger cheers, global/habitat Field Guide, both facts visible, TPWD/Cornell source
links, 276 recorded Ranger Mike clips, 43 original SVG fallbacks, verified Commons photo metadata,
photo download tooling, offline asset list, automated browser traversal for desktop and phone.

Verified: `npm test` → 31 passed, 0 failed, 0 skipped; `git diff --check` → clean; browser scripts
parse successfully. Actual main.js screen flow is exercised through a simulated DOM, not a browser.

Open: real browser visual QA and screenshots. Browser runtime reports no available connections;
Chrome DevTools reports a profile already running; standalone Chrome aborts with SIGABRT. Local
server binding is denied by the sandbox. Do not claim screenshots were inspected.

Open: download/inspect 43 new photographs. Public-host DNS/network access is disabled here.
`python3 tools/fetch-habitat-photos.py` downloads them, promotes the catalog to local WebPs, and
refreshes the cache list when executed in a network-enabled authorized session. Current game tries
verified remote photos online and explicitly labels local illustrations on offline/failure fallback.
Original eight local photographs remain intact.
