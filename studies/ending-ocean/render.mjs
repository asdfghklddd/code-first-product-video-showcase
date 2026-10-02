/**
 * 中文说明：先调用 Blender 渲染，再编码组合片并切出 6 秒投锚段；--encode-only 复用现有帧，BLENDER_BIN 可指定可执行文件。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {blenderExecutable} from '../../scripts/lib/runtime.mjs';
import {deliveryDir} from '../../scripts/lib/runtime.mjs';
import {spawn,execFileSync} from 'node:child_process';
import {mkdir,symlink,unlink,writeFile,readFile,stat,copyFile} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const study=dirname(fileURLToPath(import.meta.url));
const project=resolve(study,'../..');
const out=deliveryDir('EndingOcean-20261001');
const blender=blenderExecutable();
const samples=32;
if(!process.argv.includes('--encode-only')){
  const log=createWriteStream(join(out,'render.log'));
  await new Promise((resolveDone,reject)=>{
    const child=spawn(blender,['--background','--python',join(study,'scene.py'),'--','--animation','--samples',String(samples)],{cwd:project});
    let count=0,buffer='';
    child.stderr.on('data',chunk=>log.write(chunk));
    child.stdout.on('data',chunk=>{
      log.write(chunk);buffer+=String(chunk);
      const lines=buffer.split('\n');buffer=lines.pop();
      for(const line of lines){
        if(/Saved:.*(?:OceanFrames|EndingFrames)/.test(line)){
          count++;
          if(count%30===0)console.log(`Blender frames ${count}/600 (${Math.round(count/6)}%)`);
        }
        if(line.includes('BLEND_SAVED'))console.log('Packed Blender project saved; rendering animation.');
      }
    });
    child.on('error',reject);
    child.on('exit',code=>{log.end();code===0?resolveDone():reject(new Error(`Blender exited ${code}; see render.log`));});
  });
}
const filmFrames=join(out,'FilmFrames');await mkdir(filmFrames,{recursive:true});
let index=0;
for(const [folder,total] of [['OceanFrames',360],['EndingFrames',840]]){
  for(let frame=1;frame<=total;frame+=2){
    const name=`frame-${String(frame).padStart(4,'0')}.png`;
    const source=join(out,folder,name);
    if((await stat(source)).size<10000)throw new Error(`Invalid rendered frame ${source}`);
    const destination=join(filmFrames,`frame-${String(index).padStart(4,'0')}.png`);
    await unlink(destination).catch(e=>{if(e.code!=='ENOENT')throw e;});
    await symlink(join('..',folder,name),destination);index++;
  }
}
const compositor=join(project,`node_modules/@remotion/compositor-${process.platform}-${process.arch}`);
const env={...process.env,DYLD_LIBRARY_PATH:compositor};
const ffmpeg=join(compositor,'ffmpeg');
const output=join(out,'Anchor-ocean-and-3D-ending-20s-silent.mp4');
execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-framerate','30','-start_number','0','-i',join(filmFrames,'frame-%04d.png'),
  '-an','-c:v','libx264','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart','-y',output],{env});
execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-i',output,'-t','6','-an','-c:v','libx264','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart','-y',join(out,'Anchor-cast-into-ocean-6s-silent.mp4')],{env});
const report=JSON.parse(execFileSync(join(compositor,'ffprobe'),['-v','error','-show_entries',
  'format=duration:stream=codec_name,codec_type,width,height,avg_frame_rate,nb_frames','-of','json',output],{env,encoding:'utf8'}));
await writeFile(join(out,'verification.json'),JSON.stringify(report,null,2));
const identity=JSON.parse(await readFile(join(out,'original-ending-info.json'),'utf8'));
await writeFile(join(out,'manifest.json'),JSON.stringify({
  title:'Anchor — cast into the sea and 3D ending',seconds:20,resolution:[1920,1080],fps:30,audio:false,
  renderer:'Blender 5.2.2 / EEVEE',samples,bakedSceneFPS:60,renderedFrameStep:2,
  segments:[{seconds:[0,6],scene:'01 — Cast anchor / ocean'},
    {seconds:[6,20],scene:'02 — Approved ending / physical stage'}],
  editableProject:join(out,'Anchor-ocean-and-ending-20s.blend'),sourceFolder:study,
  identity:{title:identity.title,school:identity.school,group:identity.group,slogan:'与 AI 从容共事'},
  geometry:['Forged steel anchor with shackle, cross-stock, flukes and interlocking chain',
    'Animated ocean surface, curved splash sheet, ballistic spray and entrained bubbles',
    'Underwater scattering volume and spatial light shafts',
    'Physical rounded native UI panels, extruded work card and ceramic app icon',
    'Raised blue brand mark, camera push through paper card, physical focus and moving specular lights'],
  animation:'Object, camera, material and liquid-sheet keys are baked; private typography and native textures are packed.',
  waterMethod:'Procedural wave modifier and art-directed liquid/particle animation; not a fluid solver bake.',
  preserved:'Previous approved 14-second movie and existing promo sources are preserved.'
},null,2));
await copyFile(join(out,'EndingFrames','frame-0751.png'),join(out,'final-poster.png'));
await copyFile(join(out,'OceanFrames','frame-0107.png'),join(out,'ocean-poster.png'));
console.log('Film exported',output);
console.log(JSON.stringify(report));
