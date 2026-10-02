import {requireAssets} from '../../scripts/lib/runtime.mjs';
/**
 * 中文说明：海洋组合的准备阶段：读取本地文案，生成中文排版贴图并复制截图；必须在 scene.py 或 render.mjs 之前运行。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {readIdentity, appIcon} from '../../scripts/lib/runtime.mjs';
import {deliveryDir} from '../../scripts/lib/runtime.mjs';
import {mkdir,readFile,copyFile,writeFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser,getCompositions,renderStill} from '@remotion/renderer';
requireAssets(['local-assets/2026-09-30/real/mac-home.png', 'local-assets/2026-09-30/real/iphone-home.png']);
const study=dirname(fileURLToPath(import.meta.url));
const project=resolve(study,'../..');
const delivery=deliveryDir('EndingOcean-20261001');
const textures=join(delivery,'Textures');
await mkdir(join(project,'public/local-assets/ending-ae-20261001'),{recursive:true});
await copyFile(appIcon(),join(project,'public/local-assets/ending-ae-20261001/app-icon.png'));
await mkdir(textures,{recursive:true});
const identity=readIdentity(deliveryDir('EndingAE-20261001/original-ending-info.json'));
await writeFile(join(delivery,'original-ending-info.json'),JSON.stringify(identity,null,2));
for(const f of ['mac-home.png','iphone-home.png'])
  await copyFile(join(project,'public/local-assets/2026-09-30/real',f),join(textures,f));
const serveUrl=await bundle({entryPoint:join(study,'Textures.tsx'),outDir:join(delivery,'TextureBuild'),publicDir:join(project,'public')});
const browser=await openBrowser('chrome',{logLevel:'error'});
try{
  const comps=await getCompositions(serveUrl,{puppeteerInstance:browser,inputProps:identity});
  for(const composition of comps){
    const inputProps={...composition.props,...identity};
    await renderStill({serveUrl,composition,puppeteerInstance:browser,inputProps,frame:0,imageFormat:'png',
      output:join(textures,composition.id+'.png'),logLevel:'error'});
    console.log('Texture',composition.id);
  }
}finally{await browser.close({silent:true});}
