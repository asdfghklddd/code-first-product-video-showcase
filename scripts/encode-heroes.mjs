/**
 * 中文说明：把 Blender A/B/C 帧序列按 30/30/24 fps 编为源视频，同时复制末帧，用于 Remotion 60 fps 合成。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {deliveryDir} from './lib/runtime.mjs';
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = deliveryDir('HeroRebuild-20261001/Blender');
const target = join(project, "public/local-assets/2026-10-01/hero");
const compositor = join(project, "node_modules", `@remotion/compositor-${process.platform}-${process.arch}`);
mkdirSync(target, {recursive: true});
const only = process.argv.find(arg => arg.startsWith("--only="))?.slice(7);
for (const [variant, count, fps] of [["A",300,30],["B",270,30],["C",360,24]]) {
  if (only && only !== variant) continue;
  for (let f = 1; f <= count; f++) {
    if (!existsSync(join(source, `${variant}-frames`, `hero-${String(f).padStart(4,"0")}.png`))) throw new Error(`Missing ${variant} frame ${f}`);
  }
  execFileSync(join(compositor,"ffmpeg"), ["-hide_banner","-loglevel","error","-framerate",String(fps),"-start_number","1","-i",join(source,`${variant}-frames/hero-%04d.png`),"-frames:v",String(count),"-c:v","libx264","-preset","fast","-crf","16","-pix_fmt","yuv420p","-video_track_timescale","90000","-an","-y",join(target,`hero-${variant}.mp4`)], {env:{...process.env,DYLD_LIBRARY_PATH:compositor}});
  copyFileSync(join(source,`${variant}-frames`,`hero-${String(count).padStart(4,"0")}.png`),join(target,`hero-${variant}-final.png`));
  console.log(`Encoded real Blender studio ${variant}: ${count/fps}s`);
}
