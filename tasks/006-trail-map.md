# One trail at a time, like Donkey Kong Country

Date: 2026-10-01
Status: in progress

## Intent contract (George's words)

"Can you make it kinda like Donkey Kong Country Super Nintendo where you don't see the next level;
there's just—you start a new game, and you only have that level until you get to the end. Where you
walk through the end or whatever, that means you beat the level, and it cheers, and then you move on
to the next one. And then each player...you can add up to three players. And their levels are saved,
so like George, he made it to level 3, the Bayou Trail, and it's saved there until he beats it, and
then Dora only makes it to level 1, then her level 1 is saved where she was. Can you add that feature?
And be creative and brave and ambitious."

Today: the home screen shows all six places; anyone can play any of them in any order. Players are
unlimited. Reaching the goal flag shows the Junior Ranger cheer with "Keep exploring" and "Home".

After:
1. The six places are levels 1 to 6, in a fixed order: Backyard Safari, Woodland Walk, Bayou Trail,
   Swamp Boardwalk, Katy Prairie, Gulf Shore. (Bayou Trail is level 3, as George said.)
2. The home screen is a trail map: the level you are on is the big card; beaten levels are gold
   badges you can play again; the levels ahead are misty "?" stops with no name.
3. Reaching the goal flag beats the level: the cheer, confetti, and "A new trail opened: X!" with a
   "Next trail" button that starts it. Beating level 6 makes you a Master Ranger (new recorded line).
4. Each player's level is saved on the device. Switching players switches the map.
5. Up to three players. With three, the add form goes away; a player can be removed (tap twice).
6. A player saved before the trail map starts at the first level whose animals they haven't all
   found, so nobody's finds are wasted.

Assumptions (George vetoes in one line): the level number is saved, not the spot inside the level
(as in Donkey Kong Country); beaten levels can be replayed; one new Ranger Mike line (the finale).

## Done criteria

- [ ] `npm test`: all pass, including the level order, beating a level opens the next, a locked
  level can't be started, the three-player cap and removal, the migration of old finds, and the
  screen flow playing all six levels in order to the Master Ranger panel.
- [ ] The finale line recorded (make-voice.py).
- [ ] `node tools/browser-habitats.mjs desktop phone`: all six levels, no page errors (12 of 12).
- [ ] Screenshots looked at: the trail map (level 1, a beaten badge, misty stops), the cheer with
  the next trail named, the players screen with levels, the phone layout.
- [ ] Pushed and live; a live browser walk passes.

## Attempt log (append-only)
