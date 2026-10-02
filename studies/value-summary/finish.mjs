/**
 * 中文说明：对平面成片完整解码、核对帧数/帧率/分辨率/音轨，再从实际 MP4 抽帧；与渲染共用 config.mjs，生成本地交付说明。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {valueTiming,names} from './config.mjs';
const {fps,frames,seconds}=valueTiming();
import {deliveryDir} from '../../scripts/lib/runtime.mjs';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const study=dirname(fileURLToPath(import.meta.url)),project=resolve(study,'../..');
const out=deliveryDir('ValueSummary-Flat-20261002');
const c=join(project,`node_modules/@remotion/compositor-${process.platform}-${process.arch}`),env={...process.env,DYLD_LIBRARY_PATH:c};

await mkdir(join(out,'Review'),{recursive:true});
const verification=[];
for(const [v,name]of Object.entries(names)){
 const input=join(out,`Anchor-Value-${v}-${name}-${fps}fps.mp4`);
 execFileSync(join(c,'ffmpeg'),['-hide_banner','-loglevel','error','-xerror','-i',input,'-c:v','rawvideo','-f','null','-'],{env,stdio:['ignore','ignore','pipe']});
 for(const t of [1.7,3.32,4.8,6.68,8.6,10.2,11.8,seconds-1/fps])execFileSync(join(c,'ffmpeg'),['-hide_banner','-loglevel','error','-ss',String(t),'-i',input,'-frames:v','1','-vf','scale=960:540','-y',join(out,`Review/encoded-${v}-${t}.png`)],{env});
 const report=JSON.parse(await readFile(join(out,`${v}-verification.json`),'utf8'));
 const s=report.streams[0];
 if(s.width!==1920||s.height!==1080||Number(s.nb_frames)!==frames||s.avg_frame_rate!==`${fps}/1`||report.streams.length!==1)throw new Error('Unexpected properties for '+v);
 verification.push({variant:v,...report,fullDecode:'passed'});
 console.log(`${v} full decode and ${frames}-frame verification passed`);
}
await writeFile(join(out,'manifest.json'),JSON.stringify({date:'2026-10-02',style:'Flat captured native interfaces, 2D masks, kinetic type, continuous scene motion. No 3D objects.',request:{timecodes:['00:01:37:20','00:01:51:13'],fpsConfirmed:false,assumedFps:fps,referenceFps:60,frames,seconds,endExclusive:true,oldScriptTimecode:'02:20–02:43: content reference only'},output:{width:1920,height:1080,fps,codec:'h264',audio:false,subtitles:false,text:'Key headings and stage labels only; native text in captures preserved'},variants:names,source:join(study,'FlatEntry.tsx'),motionSources:['src/PremiumMotion.tsx: Type and shared-carrier concept','src/BrandIntros.tsx: Journey and rounded shutters'],assets:['iphone-home.png','card-0.png','card-2.png','mac-home.png','mac-first.png','mac-workflow.mp4'].map(x=>join(project,'public/local-assets/2026-09-30/real',x)),verification},null,2));
await writeFile(join(out,'交付说明.txt'),`Anchor 价值总结 — 三版平面动画（2026-10-02）

本次正式交付全部使用本地真实页面截图、截图裁切或真实录屏。
没有三维模型、立体物体、透视旋转；浅色背景、青蓝色线条与大标题延续参考片。
不添加逐句字幕，不含音轨，方便接入原片旁白和配乐。

A / Flat-Journey：连续横移，串起移动端截图、判断页面录屏、工作区与结尾。
B / Shared-Frame：截图卡片扩展为桌面页面，配合圆角遮罩进行切换。
C / Slice-Flow：真实页面分条滑动切换，关键内容放大展示，最后收束成截图组合。

内容顺序：正在推进什么 → 哪里需要注意 → 回来从哪继续 → 主线不丢失，回来就能继续。

时长依据：聊天截图 00:01:37:20 至 00:01:51:13。
参考片为 60 fps；剪辑工程帧率尚未确认。本次按 ${fps} fps 计算，终点不含尾帧：${frames} 帧，即 ${seconds.toFixed(6)} 秒。
如果剪辑工程实际为 30 fps，该区间为 413 帧 / 13.766667 秒；25 fps 则为 343 帧 / 13.72 秒，需要按对应工程设置重新导出。
参数：1920×1080，${fps} fps，H.264 / yuv420p，无音轨。

可编辑源文件：${join(study,'FlatEntry.tsx')}
渲染脚本：${join(study,'render.mjs')}
在 code-first-product-video-showcase 目录运行：node studies/value-summary/render.mjs
按其他工程帧率重新导出：ANCHOR_EDIT_FPS=30 node studies/value-summary/render.mjs
既有工程与素材保留，本次交付以 ValueSummary-Flat-20261002 文件夹为准。
`);
console.log('Delivery manifest and notes written');
