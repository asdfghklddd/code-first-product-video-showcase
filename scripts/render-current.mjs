/**
 * 中文说明：生成原动效真实素材整片（20 秒），或 --first-draft 早期草稿（30 秒）；用于整体产品介绍。先提供本地截图/录屏，再导出海报、检查帧与视频。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {deliveryDir} from './lib/runtime.mjs';
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const deliverables = deliveryDir();
const review = join(deliverables, "VideoReview");
const originalMotion = !process.argv.includes("--first-draft");
const compositionId = originalMotion ? "AnchorPromo-OriginalMotion-20260930" : "AnchorPromo-20260930";
const fileStem = originalMotion ? "Anchor-promo-20260930-real-capture" : "Anchor-promo-20260930";
const prefix = originalMotion ? "real-capture" : "current";
const reviewFrames = originalMotion ? [40, 75, 100, 210, 375, 560] : [80, 220, 470, 690, 850];
await mkdir(review, { recursive: true });
const serveUrl = await bundle({
  entryPoint: join(project, "src/index.ts"),
  outDir: join(project, "build-current"),
  publicDir: join(project, "public"),
});
const browser = await openBrowser("chrome", { logLevel: "error" });
try {
  const composition = await selectComposition({ serveUrl, id: compositionId, puppeteerInstance: browser });
  if (composition.durationInFrames !== (originalMotion ? 600 : 900)) throw new Error("Film timeline duration changed unexpectedly.");
  if (!process.argv.includes("--video-only")) {
    for (const frame of reviewFrames) {
      await renderStill({
        serveUrl, composition, frame, puppeteerInstance: browser, imageFormat: "png",
        output: join(review, `${prefix}-frame-${frame}.png`), overwrite: true, logLevel: "error",
      });
      console.log(`Reviewed frame ready: ${frame}`);
    }
    await renderStill({
      serveUrl, composition, frame: originalMotion ? 75 : 220, puppeteerInstance: browser, imageFormat: "png",
      output: join(deliverables, `${fileStem}-poster.png`), overwrite: true, logLevel: "error",
    });
  }
  if (!process.argv.includes("--review-only")) {
    let last = -1;
    const outputLocation = join(deliverables, `${fileStem}-silent.mp4`);
    await renderMedia({
      serveUrl, composition, puppeteerInstance: browser, outputLocation,
      codec: "h264", crf: 18, pixelFormat: "yuv420p", muted: true,
      concurrency: 4, overwrite: true, logLevel: "error",
      onProgress: ({ progress }) => {
        const step = Math.floor(progress * 10);
        if (step > last) { last = step; console.log(`Video render: ${step * 10}%`); }
      },
    });
    console.log(`Exported ${outputLocation}`);
  }
} finally {
  await browser.close({ silent: true });
}
