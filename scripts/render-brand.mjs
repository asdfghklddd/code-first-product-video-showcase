import {requireAssets} from './lib/runtime.mjs';
/**
 * 中文说明：生成 A 大字、B 横向旅程、C 环形科技感、D 圆角图形四种 20 秒品牌片头；前 15 秒品牌、后 5 秒产品。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {deliveryDir} from './lib/runtime.mjs';
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";

requireAssets(['local-assets/2026-09-30/real/iphone-home.png', 'local-assets/2026-09-30/real/mac-home.png', 'local-assets/2026-09-30/real/mac-workflow.mp4', 'local-assets/2026-09-30/real/page-header.png', 'local-assets/2026-09-30/real/card-0.png', 'local-assets/2026-09-30/real/card-1.png', 'local-assets/2026-09-30/real/card-2.png', 'local-assets/2026-09-30/real/card-3.png', 'local-assets/2026-09-30/real/decision-callout.png']);
const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = deliveryDir('BrandIntros-20261001');
const review = join(destination, "Review");
const shots = ['A','B','C','D'].map(variant => ({ id: `Anchor-Brand-20s-${variant}`, file: `Anchor-${variant}-20s`, poster: 810, frames: [60,270,510,690,810,899,900,930,1060,1180] }));
const option = process.argv.find(arg => arg.startsWith("--only="))?.slice(7);
const selected = option ? shots.filter(shot => shot.id.endsWith(option) || shot.file === option || shot.id === option) : shots;
if (!selected.length) throw new Error(`Unknown composition filter: ${option}`);
await mkdir(review, { recursive: true });
const compositor = join(project, "node_modules", `@remotion/compositor-${process.platform}-${process.arch}`);
const ffmpeg = join(compositor, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
const capture = join(project, "public/local-assets/2026-09-30/real");
for (const [name, seconds] of [["mac-first.png", 0], ["mac-closing.png", 8.466666]]) {
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-ss", String(seconds), "-i", join(capture, "mac-workflow.mp4"), "-frames:v", "1", "-y", join(capture, name)], { env: { ...process.env, DYLD_LIBRARY_PATH: compositor } });
}
const serveUrl = await bundle({ entryPoint: join(project, "src/index.ts"), outDir: join(project, "build-motion"), publicDir: join(project, "public") });
const browser = await openBrowser("chrome", { logLevel: "error" });
try {
  for (const shot of selected) {
    const composition = await selectComposition({ serveUrl, id: shot.id, puppeteerInstance: browser });
    if (!process.argv.includes("--video-only")) {
      for (const frame of shot.frames) {
        await renderStill({ serveUrl, composition, frame, puppeteerInstance: browser, imageFormat: "png", output: join(review, `${shot.file}-${frame}.png`), overwrite: true, logLevel: "error" });
      }
      await renderStill({ serveUrl, composition, frame: shot.poster, puppeteerInstance: browser, imageFormat: "png", output: join(destination, `${shot.file}-poster.png`), overwrite: true, logLevel: "error" });
      console.log(`${shot.id}: review frames ready`);
    }
    if (!process.argv.includes("--review-only")) {
      let last = -1;
      const outputLocation = join(destination, `${shot.file}-silent.mp4`);
      await renderMedia({ serveUrl, composition, puppeteerInstance: browser, outputLocation, codec: "h264", crf: 18, pixelFormat: "yuv420p", muted: true, concurrency: 4, overwrite: true, logLevel: "error", onProgress: ({ progress }) => {
        const step = Math.floor(progress * 10);
        if (step > last) { last = step; console.log(`${shot.id}: ${step * 10}%`); }
      } });
      console.log(`Exported ${outputLocation}`);
    }
  }
} finally { await browser.close({ silent: true }); }
