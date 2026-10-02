import {requireAssets} from '../../scripts/lib/runtime.mjs';
/**
 * 中文说明：默认导出三版平面价值总结；工程帧率由 ANCHOR_EDIT_FPS 决定，可先 --review-only 或 --variant=B 单独导出。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {valueTiming,names} from './config.mjs';
import {deliveryDir} from '../../scripts/lib/runtime.mjs';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia,renderStill} from '@remotion/renderer';
requireAssets(['local-assets/2026-09-30/real/iphone-home.png', 'local-assets/2026-09-30/real/mac-home.png', 'local-assets/2026-09-30/real/mac-first.png', 'local-assets/2026-09-30/real/mac-workflow.mp4', 'local-assets/2026-09-30/real/card-0.png', 'local-assets/2026-09-30/real/card-2.png']);
const study=dirname(fileURLToPath(import.meta.url)),project=resolve(study,'../..');
const out=deliveryDir('ValueSummary-Flat-20261002');
const {fps,frames}=valueTiming();
const selected=process.argv.find(x=>/^--variant=/.test(x))?.split('=')[1];
if(selected&&!Object.hasOwn(names,selected))throw new Error('Unknown variant; choose A, B or C');
const variants=selected?[selected]:['A','B','C'];
await mkdir(join(out,'Review'),{recursive:true});
const serveUrl=await bundle({entryPoint:join(study,'FlatEntry.tsx'),outDir:join(out,'Build'),publicDir:join(project,'public')});
const browser=await openBrowser('chrome',{logLevel:'error',chromiumOptions:{gl:'angle'}});

try{
 for(const variant of variants){
  const base=await selectComposition({serveUrl,id:`Anchor-Value-${variant}`,puppeteerInstance:browser});
  const composition={...base,fps,durationInFrames:frames};
  if(!process.argv.includes('--video-only'))for(const seconds of [0,1.7,4.8,6.2,8.6,11.8,frames/fps-1/fps]){
   const frame=Math.round(seconds*fps);
   await renderStill({serveUrl,composition,puppeteerInstance:browser,frame,output:join(out,`Review/${variant}-${frame}.png`),imageFormat:'png',logLevel:'error'});
   console.log(`${variant} review ${frame}`);
  }
  if(!process.argv.includes('--video-only'))await copyFile(join(out,`Review/${variant}-${Math.round(11.8*fps)}.png`),join(out,`Anchor-Value-${variant}-poster.png`));
  if(!process.argv.includes('--review-only')){
   let last=-1;const output=join(out,`Anchor-Value-${variant}-${names[variant]}-${fps}fps.mp4`);
   await renderMedia({serveUrl,composition,puppeteerInstance:browser,outputLocation:output,codec:'h264',crf:17,pixelFormat:'yuv420p',muted:true,concurrency:2,logLevel:'error',
    onProgress:({progress})=>{const step=Math.floor(progress*20);if(step>last){last=step;console.log(`${variant} render ${step*5}%`);}}});
   const c=join(project,`node_modules/@remotion/compositor-${process.platform}-${process.arch}`);
   const report=JSON.parse(execFileSync(join(c,'ffprobe'),['-v','error','-show_entries','format=duration,size:stream=codec_name,codec_type,width,height,avg_frame_rate,nb_frames','-of','json',output],{encoding:'utf8',env:{...process.env,DYLD_LIBRARY_PATH:c}}));
   await writeFile(join(out,`${variant}-verification.json`),JSON.stringify(report,null,2));
   console.log(`${variant} complete: ${output}`);
  }
 }
}finally{await browser.close({silent:true});}
