import {requireAssets} from '../../scripts/lib/runtime.mjs';
/**
 * 中文说明：导出 14 秒光影片尾；只有配置 sourceVideo 才另做 12 秒左右参考对比。没有私人信息配置时使用通用品牌文案。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {readIdentity, appIcon} from '../../scripts/lib/runtime.mjs';
import {deliveryDir} from '../../scripts/lib/runtime.mjs';
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill,renderMedia} from '@remotion/renderer';

requireAssets(['local-assets/2026-09-30/real/mac-home.png', 'local-assets/2026-09-30/real/iphone-home.png']);
const study=dirname(fileURLToPath(import.meta.url));
const project=resolve(study,'../..');
const delivery=deliveryDir('EndingAE-20261001');
const owner=readIdentity(join(delivery,'original-ending-info.json'));
const inputProps={title:owner.title,school:owner.school,group:owner.group,slogan:'与 AI 从容共事'};
const media=join(project,'public/local-assets/ending-ae-20261001');
await mkdir(media,{recursive:true});
await mkdir(join(delivery,'Review'),{recursive:true});
for(const name of ['mac-home.png','iphone-home.png'])
  await copyFile(join(project,'public/local-assets/2026-09-30/real',name),join(media,name));
await copyFile(appIcon(),join(media,'app-icon.png'));
const compositor=join(project,`node_modules/@remotion/compositor-${process.platform}-${process.arch}`);
const env={...process.env,DYLD_LIBRARY_PATH:compositor};
if(owner.sourceVideo) execFileSync(join(compositor,'ffmpeg'),['-hide_banner','-loglevel','error','-ss','146','-i',owner.sourceVideo,
  '-t','12','-an','-c:v','libx264','-crf','17','-pix_fmt','yuv420p','-r','30','-movflags','+faststart','-y',join(media,'reference-ending.mp4')],{env});
let serveUrl=await bundle({entryPoint:join(study,'Entry.tsx'),outDir:join(delivery,'Build'),publicDir:join(project,'public')});
const browser=await openBrowser('chrome',{logLevel:'error'});
try{
  const composition=await selectComposition({serveUrl,id:'Anchor-Ending-AE',puppeteerInstance:browser,inputProps});
  const frames=[60,180,240,300,390,408,420,432,444,462,480,520,570,630,750,830];
  for(const frame of frames){
    await renderStill({serveUrl,composition,frame,puppeteerInstance:browser,inputProps,
      imageFormat:'png',output:join(delivery,`Review/frame-${frame}.png`),logLevel:'error'});
    console.log(`Review ${frame}`);
  }
  await copyFile(join(delivery,'Review/frame-300.png'),join(delivery,'information-poster.png'));
  await copyFile(join(delivery,'Review/frame-750.png'),join(delivery,'final-poster.png'));
  if(process.argv.includes('--review-only'))process.exitCode=0;
  else{
    let step=-1;
    const output=join(delivery,'Anchor-ending-AE-light-14s-silent.mp4');
    await renderMedia({serveUrl,composition,puppeteerInstance:browser,inputProps,
      outputLocation:output,codec:'h264',crf:17,pixelFormat:'yuv420p',muted:true,concurrency:3,
      logLevel:'error',onProgress:({progress})=>{const next=Math.floor(progress*10);if(next>step){step=next;console.log(`Film ${next*10}%`);}}});
    await copyFile(output,join(media,'new-ending.mp4'));
    if(owner.sourceVideo){
    serveUrl=await bundle({entryPoint:join(study,'Entry.tsx'),outDir:join(delivery,'BuildComparison'),publicDir:join(project,'public')});
    const comparison=await selectComposition({serveUrl,id:'Anchor-Ending-AE-Comparison',puppeteerInstance:browser});
    step=-1;
    await renderMedia({serveUrl,composition:comparison,puppeteerInstance:browser,
      outputLocation:join(delivery,'Original-vs-new-ending-12s.mp4'),codec:'h264',crf:18,
      pixelFormat:'yuv420p',muted:true,concurrency:3,logLevel:'error',
      onProgress:({progress})=>{const next=Math.floor(progress*10);if(next>step){step=next;console.log(`Comparison ${next*10}%`);}}});
    }
    await writeFile(join(delivery,'manifest.json'),JSON.stringify({
      version:2,sourceReference:owner.sourceVideo,originalReferenceRange:[146,158],
      resolution:[1920,1080],fps:60,seconds:14,audio:false,
      identity:inputProps,style:'Layered motion graphics, original-inspired teal light field and focus transitions',
      sourceFolder:study,
      features:['Native UI panels with depth, tilt and parallax','Continuous diffuse teal light, vignette and fine curves',
        'Spring-driven work card with staggered rows and a highlight sweep','Fast card push-in with timed defocus and luminous dissolve',
        'Rounded icon extrusion, focus pull, soft floating reflection and material glint','Staggered slogan reveal and stable original information footer'],
      firstStudy:'Supersedes the previous geometric Blender portal study as the visual direction',
      boundaries:'Existing promo compositions and previous deliveries are preserved; identity is injected from local owner data.',
    },null,2));
  }
}finally{await browser.close({silent:true});}
