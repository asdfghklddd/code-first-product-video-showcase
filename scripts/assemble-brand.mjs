/**
 * 中文说明：将四种品牌片头顺序拼接为 80 秒选择用对比片；不生成新动画。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {deliveryDir} from './lib/runtime.mjs';
import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const root=deliveryDir('BrandIntros-20261001');
const compositor=join(project,'node_modules',`@remotion/compositor-${process.platform}-${process.arch}`);
const files=['A','B','C','D'].map(letter=>join(root,`Anchor-${letter}-20s-silent.mp4`));
const list=join(root,'Review','comparison.ffconcat');
await writeFile(list,'ffconcat version 1.0\n'+files.map(file=>`file '${file.replace(/'/g,"'\\''")}'\n`).join(''));
execFileSync(join(compositor,'ffmpeg'),['-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart','-y',join(root,'Anchor-ABCD-80s-comparison.mp4')],{env:{...process.env,DYLD_LIBRARY_PATH:compositor}});
console.log('Four-option comparison exported.');
