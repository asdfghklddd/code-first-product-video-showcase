# Code-First Product Video Showcase

A Remotion 4 project that treats product film as software: typed scenes, deterministic animation, reusable camera primitives, and CI-verifiable output.

> Portfolio edition: the original production repository remains private. This repository has fresh history, synthetic UI copy, three reviewed product stills, and no raw recordings, voice-over, competition material, local paths, or third-party skill mirrors.

![Desktop workspace](docs/screenshots/mac-workspace.jpg)

## What it demonstrates

- a four-scene narrative: overload → context anchor → human decision → confident return
- 2.5D camera motion, device frames, kinetic typography, and reusable visual tokens
- parameterized Remotion compositions and a renderable poster still
- deterministic TypeScript source with lint, typecheck, tests, and bundle validation in CI

## Run

```powershell
npm ci
npm run dev
```

Render a still or the full composition:

```powershell
npm run render:poster
npm run render:video
```

## Structure

```text
src/scenes/       narrative beats
src/components/   camera, device, typography and UI primitives
src/config/       visual tokens
src/data/         typed storyboard and timing
docs/screenshots/ reviewed product-demo stills
```

## Public-media policy

Only the small logo and three reviewed stills required to explain the work are tracked. The project makes no network requests and ships no user data, accounts, raw screen recordings, audio, PDFs, or private production notes.
