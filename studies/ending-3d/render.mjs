/**
 * 中文说明：编码 Blender 帧序列并叠加片尾文案，输出 12 秒 720p30；先执行 scene.py --animation。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {readIdentity} from '../../scripts/lib/runtime.mjs';
import {deliveryDir} from '../../scripts/lib/runtime.mjs';
import {mkdir, copyFile, writeFile, readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderMedia, renderStill} from '@remotion/renderer';

const study = dirname(fileURLToPath(import.meta.url));
const project = resolve(study, '../..');
const delivery = deliveryDir('Ending3D-20261001');
// Owner information remains in the local delivery folder, outside public source.
const identity = readIdentity(join(delivery,'original-ending-info.json'));
const inputProps = {title:identity.title, school:identity.school, group:identity.group, slogan:'与 AI 从容共事'};
const assets = join(project, 'public/local-assets/ending-3d-20261001');
const compositor = join(project, `node_modules/@remotion/compositor-${process.platform}-${process.arch}`);
await mkdir(assets, {recursive:true});
const camera = join(assets, 'camera.mp4');
const last = join(assets, 'last-frame.png');
const posterOnly = process.argv.includes('--poster-only');
if (posterOnly) {
  await copyFile(join(delivery,'Review/3d-0180.png'),last);
} else if (!process.argv.includes('--review-only')) {
  execFileSync(join(compositor, 'ffmpeg'), ['-hide_banner', '-loglevel', 'error',
    '-framerate','30', '-start_number','1','-i',join(delivery, 'Frames/frame-%04d.png'),
    '-frames:v','180','-an','-c:v','libx264','-crf','17','-pix_fmt','yuv420p',
    '-movflags','+faststart','-y',camera], {env:{...process.env, DYLD_LIBRARY_PATH:compositor}});
  await copyFile(join(delivery,'Frames/frame-0180.png'),last);
}
const serveUrl = await bundle({entryPoint:join(study,'Entry.tsx'),
  outDir:join(delivery,'Build'), publicDir:join(project,'public')});
const browser = await openBrowser('chrome', {logLevel:'error'});
try {
  const composition = await selectComposition({serveUrl,id:'Anchor-Ending-3D-Study',puppeteerInstance:browser,inputProps});
  for (const frame of posterOnly ? [180,330] : [0,40,80,112,152,179,180,218,245,275,330,359]) {
    await renderStill({serveUrl,composition,frame,puppeteerInstance:browser,inputProps,
      output:join(delivery,`Review/ending-${frame}.png`),imageFormat:'png',logLevel:'error'});
    console.log(`Review frame ${frame}`);
  }
  await copyFile(join(delivery,'Review/ending-330.png'),join(delivery,'Anchor-ending-3D-study-poster.png'));
  if (!posterOnly && !process.argv.includes('--review-only')) {
    let lastStep = -1;
    await renderMedia({serveUrl,composition,puppeteerInstance:browser,inputProps,
      outputLocation:join(delivery,'Anchor-ending-3D-study-12s-silent.mp4'),
      codec:'h264',crf:18,pixelFormat:'yuv420p',muted:true,concurrency:3,logLevel:'error',
      onProgress:({progress}) => {const step=Math.floor(progress*10);
        if(step>lastStep){lastStep=step;console.log(`Ending render ${step*10}%`);}}});
  }
  await writeFile(join(delivery,'manifest.json'),JSON.stringify({
    status:'Camera, work-information and brand study; original fields extracted from user-provided semifinal film',
    resolution:[1280,720],fps:30,seconds:12,audio:false,
    brand:'Anchor 安可',slogan:'与 AI 从容共事',
    identity:{title:identity.title,school:identity.school,group:identity.group,
      fullName:'Not shown in original ending',contact:'Not shown in original ending'},
    nativeCaptures:'2026-09-30 real local assets',
    scene:'Anchor-ending-3D-study.blend',
    timeline:{'0–2.6s':'Native Mac pullback and physical device orbit',
      '2.6–6s':'Devices move aside; camera travels through a physical ring to current app icon',
      '4–8.2s':'Original title, school and group appear on a work-information card',
      '8–12s':'Current brand and slogan settle, with original work-information footer'},
  },null,2));
} finally {await browser.close({silent:true});}
