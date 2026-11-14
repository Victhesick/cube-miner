# Cave Miner

An acubemy smart-cube cave puzzle built on the official `acubemy/plugin-template` structure.

## Game
Guide a miner across all six cube faces, collect every gold coin and gem, and reach the exit before the move limit runs out. Rock tiles block routes. Each physical turn rotates its matching face, moving corridors and treasure. There are six difficulty levels.

## Controls
- `U`, `R`, `D`, `L`: move across the cube surface in that local direction and twist the matching face.
- `F`, `B`: shift to the front/back face and twist it.
- Prime turns such as `R'` reverse the movement/twist.
- `U2` is treated as two quarter-turn actions.
- Undo button or Backspace rewinds the last move.

The plugin listens to the template SDK events `acubemy.onMove(({ move }) => ...)` and `acubemy.onDeviceChange(...)`.

## Preview
Use the acubemy SDK keyboard simulation (U R F D L B; Shift for prime turns), or the on-screen test buttons.

## Install
Upload the contents of this folder to a public GitHub repository. Keep `acubemy-plugin.json` and `index.html` at the repository root, then add the repository URL in acubemy → Games & Plugins.

## Local test
Run `npx serve --cors .` from this folder. The sandbox requires CORS headers.
