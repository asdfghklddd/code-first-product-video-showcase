/**
 * 中文说明：检查三维品牌成片的时长/帧率/音轨，并拼接四版对比片；适合交付前参数核验。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {deliveryDir} from './lib/runtime.mjs';
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const project=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const out=deliveryDir('HeroRebuild-20261001');
const compositor=join(project,"node_modules",`@remotion/compositor-${process.platform}-${process.arch}`);
const env={...process.env,DYLD_LIBRARY_PATH:compositor};
const variants=["A","B","C","D"];
const videos=variants.map(v=>`Anchor-${v}-20s-hero-silent.mp4`);
const details=[];
for (const file of videos) {
  const probe=JSON.parse(execFileSync(join(compositor,"ffprobe"),["-v","error","-show_streams","-show_format","-of","json",join(out,file)],{env,encoding:"utf8"}));
  const stream=probe.streams.find(s=>s.codec_type==="video");
  if (probe.streams.some(s=>s.codec_type==="audio")) throw new Error(`${file} has audio`);
  if (stream.width!==1920 || stream.height!==1080 || stream.nb_frames!=="1200" || stream.r_frame_rate!=="60/1" || Math.abs(Number(probe.format.duration)-20)>.001) throw new Error(`Invalid delivery ${file}`);
  details.push({file,duration:20,width:1920,height:1080,fps:60,frames:1200,audio:false});
}
const list=join(out,"concat-heroes.txt");
writeFileSync(list,videos.map(f=>`file '${f}'`).join("\n")+"\n");
execFileSync(join(compositor,"ffmpeg"),["-hide_banner","-loglevel","error","-f","concat","-safe","0","-i",list,"-c","copy","-an","-movflags","+faststart","-y",join(out,"Anchor-ABCD-80s-hero-comparison.mp4")],{env});
const comparison=JSON.parse(execFileSync(join(compositor,"ffprobe"),["-v","error","-show_streams","-show_format","-of","json",join(out,"Anchor-ABCD-80s-hero-comparison.mp4")],{env,encoding:"utf8"}));
if (Math.abs(Number(comparison.format.duration)-80)>.001) throw new Error("Comparison duration mismatch");
const ts=(seconds)=>{const ms=Math.round(seconds*1000);return `${String(Math.floor(ms/3600000)).padStart(2,"0")}:${String(Math.floor(ms/60000)%60).padStart(2,"0")}:${String(Math.floor(ms/1000)%60).padStart(2,"0")},${String(ms%1000).padStart(3,"0")}`;};
const captions={
  A:[[0,4.6,"Anchor 安可\n与 AI 从容共事"],[7.1,14.6,"与 AI 从容共事\n掌握全局 · 安排注意力 · 从容接续"],[15.5,20,"打通 Mac 与 iPhone\n汇集任务状态、关键变化与工作线索"]],
  B:[[0,2.3,"AI 不断向前。"],[2.3,5.6,"节奏，由你掌握。\nAnchor 安可 · 与 AI 从容共事"],[8.5,14.6,"掌握全局。从容接续。"],[15.5,20,"打通 Mac 与 iPhone\n与 AI 从容共事"]],
  C:[[.5,3.45,"Anchor 安可"],[3.6,14.6,"与 AI 从容共事\nAI 工作节奏管理应用"],[15.5,20,"Mac 与 iPhone · 从容接续"]],
  D:[[0,3.2,"遇见你的 AI 同伴\nAI 协作的新节奏"],[3.3,5.7,"与 AI 从容共事"],[6.9,8.7,"Anchor 安可\n与 AI 从容共事"],[9.3,14.6,"工作很快。你可以从容。\nAnchor 安可 · AI 工作节奏管理应用"],[15.5,20,"掌握全局，从容接续。"]],
};
for(const v of variants)writeFileSync(join(out,`Anchor-${v}-20s-hero.srt`),captions[v].map(([a,b,txt],i)=>`${i+1}\n${ts(a)} --> ${ts(b)}\n${txt}\n`).join("\n"));
const native={note:'User-supplied native captures; private local provenance is not copied into the public manifest.'};
const manifest={date:"2026-10-01",product:"Anchor 安可",slogan:"与 AI 从容共事",exports:details,comparison:"Anchor-ABCD-80s-hero-comparison.mp4",brandOnly:[0,15],nativeProductFootage:[15,20],graphics:{originalSource:"https://github.com/asdfghklddd/code-first-product-video-showcase",originalMotion:"PageCam keys and hero lift/reseat/press/edge-beam curves retimed from 30 to 60 fps",blenderVersion:"5.2.2 LTS",geometry:"Actual Anchor alpha silhouette extruded with original interior cutouts; rounded ceramic App icon shell",studios:[{variant:"A",frames:300,fps:30,duration:10},{variant:"B",frames:270,fps:30,duration:9},{variant:"C",frames:360,fps:24,duration:15}],referenceD:"Large thin and outline type, diagonal brand glyph convergence, baseline wordmark assembly, three-column hero layout; Anchor palette and assets only"},nativeCaptureProvenance:native};
writeFileSync(join(out,"delivery-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
console.log("Verified four silent 20s / 1080p / 60fps films and 80s comparison.");
