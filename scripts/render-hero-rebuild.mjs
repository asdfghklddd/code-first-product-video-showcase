/**
 * 中文说明：生成四种 20 秒三维品牌片头的最终排版；先用 Blender 渲染并编码，D 复用 A 的三维素材。支持单版 --only 和检查帧。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {deliveryDir} from './lib/runtime.mjs';
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const customOut = process.argv.find(arg => arg.startsWith("--out="))?.slice(6);
const customFilename = process.argv.find(arg => arg.startsWith("--filename="))?.slice(11);
const destination = customOut ? resolve(project, customOut) : deliveryDir("HeroRebuild-20261001");
const review = join(destination,"Review");
const shots = ["A","B","C","D"].map(variant=>({id:`Anchor-Hero-20s-${variant}`,file:`Anchor-${variant}-20s-hero`,poster:variant === "C" ? 660 : 750,frames: [0,60,150,215,270,360,440,540,660,795,860,899,900,935,1015,1080,1170]}));
const only = process.argv.find(arg=>arg.startsWith("--only="))?.slice(7);
const drafts = process.argv.includes("--review-drafts");
if (drafts && !process.argv.includes("--review-only")) throw new Error("Draft lighting stills are for composition review only; video exports require finished animations.");
const selected = only ? shots.filter(shot=>shot.id.endsWith(only)) : shots;
if (!selected.length) throw new Error(`Unknown variant ${only}`);
if (customFilename && selected.length !== 1) throw new Error("A custom filename requires a single selected variant.");
if (!drafts) for (const variant of new Set(selected.map(shot => shot.id.slice(-1) === "D" ? "A" : shot.id.slice(-1)))) if (!existsSync(join(project, `public/local-assets/2026-10-01/hero/hero-${variant}.mp4`))) throw new Error(`Missing rendered Blender animation ${variant}`);
await mkdir(review,{recursive:true});
const serveUrl=await bundle({entryPoint:join(project,"src/index.ts"),outDir:join(project,"build-hero",only || "all"),publicDir:join(project,"public")});
const browser=await openBrowser("chrome",{logLevel:"error"});
try {
  for (const shot of selected) {
    const inputProps = {variant:shot.id.slice(-1),preview:drafts};
    const composition=await selectComposition({serveUrl,id:shot.id,puppeteerInstance:browser,inputProps});
    if (!process.argv.includes("--video-only")) {
      for (const frame of shot.frames) await renderStill({serveUrl,composition,inputProps,frame,puppeteerInstance:browser,imageFormat:"png",output:join(review,`${shot.file}-${frame}.png`),overwrite:true,logLevel:"error"});
      await renderStill({serveUrl,composition,inputProps,frame:shot.poster,puppeteerInstance:browser,imageFormat:"png",output:join(destination,`${shot.file}-poster.png`),overwrite:true,logLevel:"error"});
      console.log(`${shot.id}: review frames ready`);
    }
    if (!process.argv.includes("--review-only")) {
      let last=-1;
      await renderMedia({serveUrl,composition,inputProps,puppeteerInstance:browser,outputLocation:join(destination,customFilename || `${shot.file}-silent.mp4`),codec:"h264",crf:17,pixelFormat:"yuv420p",muted:true,concurrency:4,overwrite:true,logLevel:"error",onProgress:({progress})=>{const step=Math.floor(progress*10);if(step>last){last=step;console.log(`${shot.id}: ${step*10}%`);}}});
      console.log(`${shot.id}: export finished`);
    }
  }
} finally {await browser.close({silent:true});}
