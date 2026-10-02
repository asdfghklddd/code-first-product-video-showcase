# Code-First Product Video Showcase

## 中文使用入口

这里同时保存公开基础示例，以及片头、中段、片尾的制作脚本。生产研究需要自备本地素材，根目录 `npm ci` 会安装全部 TypeScript 研究所需依赖。

- [动画目录：代码对应什么效果、适用场景、生成命令](docs/动画目录.md)
- [素材与运行：输入清单、环境变量、片尾配置和验证](docs/素材与运行.md)
- [制作经验：平面转场、真实界面、时间码和参考来源](docs/制作经验.md)
- [二次收录审计：34 个成片索引、版本关系、录屏处理与抽帧工具](docs/二次收录审计.md)

优先运行 `npm ci && npm test && npm run lint && npm run build` 检查环境；`npm run render:video` 是不依赖私人素材的公开基础整片。生产用录屏、作品信息、视频成品及帧缓存不提交。

A Remotion 4 project that treats product film as software: typed scenes, deterministic animation, reusable camera primitives, and CI-verifiable output.

> Public showcase plus optional production studies: the base example uses synthetic UI copy and three reviewed product stills. Additional scripts accept local captures and configuration that are not distributed. Raw recordings, voice-over, competition material, generated bundles and third-party skill mirrors remain outside the public repository.

![Desktop workspace](docs/screenshots/mac-workspace.jpg)

## What it demonstrates

- a four-scene narrative: overload → context anchor → human decision → confident return
- 2.5D camera motion, device frames, kinetic typography, and reusable visual tokens
- parameterized Remotion compositions and a renderable poster still
- deterministic TypeScript source with lint, typecheck, tests, and bundle validation in CI

## Run

### Brand-first introductions — 2026-10-01

Four new `Anchor-Brand-20s-A/B/C/D` compositions each run for 20 seconds.
The first 15 seconds contain brand typography and abstract motion only; the
last 5 seconds use the existing native iPhone screenshot and Mac interaction
recording. All four use the name **Anchor 安可** and slogan **与 AI 从容共事**.
A uses kinetic typography, B a continuous horizontal camera, C orbiting brand
geometry, and D rounded shape wipes inspired by the owner's supplied reference.
D uses Anchor's own palette from `anchorTheme`, not the reference palette or assets.

```sh
npm run render:brand:delivery
```

Outputs, posters and review frames are saved to the sibling
`Deliverables/BrandIntros-20261001` directory. Earlier exports remain available.


### Motion options and revised film — 2026-09-30

The local `Anchor-Motion-Options` folder contains three new opening directions:
`Anchor-Opening-A` (6 seconds, kinetic type and color shutter),
`Anchor-Opening-B` (8 seconds, one camera from UI detail to the device overview),
and `Anchor-Opening-C` (10 seconds, low-angle device orbit and a brand reveal).
`Anchor-Premium-Promo` uses the B opening in a revised 26-second film, with a
shared card-to-window transition into the native Mac recording and a closing
shot that continues from the recording's final frame. All are 1080p at 60 fps,
with Chinese on-screen copy and no audio. The source Mac recording stays at its
original 30 fps; the camera and graphic layer are rendered at 60 fps.

```sh
npm run render:motion:delivery
```

This exports the three separate openings, a labeled comparison reel, the full
film, posters, and review frames to `Deliverables/MotionOptions`. The renderer
derives the transition's first and last stills directly from the captured Mac
clip. Product UI uses the existing local native captures, never reconstructed
UI. Public case breakdowns informed the motion direction:
[Opus 5.5 video prompt collection](https://github.com/Li-Evan/awesome-opus-5.5-video-prompts).

### Current Anchor film — 2026-09-30

The local `AnchorPromo-OriginalMotion-20260930` composition uses the original
four scenes, camera keyframes, card lift and edge-light animation, transition
timings, and return-scene device and ring animations. Product UI comes from
fresh screenshots of the local iPhone simulator and frame recordings of the
native Mac app, loaded with the owner's existing prefilled demo tasks.
Opening cards and the decision callout use crops of those actual screenshots.
The film follows the original 20-second
timeline at 1920 × 1080 and 30 fps, with Chinese on-screen copy and no audio.

```sh
npm run dev
npm run render:current:delivery
```

The delivery command exports the video, poster, and review frames to the sibling
`Deliverables` folder as `Anchor-promo-20260930-real-capture-silent.mp4`.
`npm run render:current` exports only the MP4 to `out`.
The current composition appears when its capture assets are present under
`public/local-assets/2026-09-30/real/`; this local media folder is ignored by Git.
Capture frames, timing logs, and source provenance are preserved in
`Deliverables/RealCapture/2026-09-30/`. A subtitle sidecar is also available in
`Deliverables`, alongside the on-screen Chinese copy in the silent film.

The first 30-second draft remains under `AnchorPromo-20260930` for reference.
Use `node scripts/render-current.mjs --first-draft` to export that draft.

### Public showcase composition

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
