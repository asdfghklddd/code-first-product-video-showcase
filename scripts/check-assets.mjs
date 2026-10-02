// 中文说明：只检查素材，不渲染、不下载；用于在正式渲染前发现缺失输入。
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {projectRoot} from './lib/runtime.mjs';
const real='local-assets/2026-09-30/real/';
const profiles={
 base:['brand/anchor-project-logo.png'],
 native:['iphone-home.png','mac-home.png','mac-first.png','mac-closing.png','mac-workflow.mp4','page-header.png','card-0.png','card-1.png','card-2.png','card-3.png','decision-callout.png'].map(x=>real+x),
 value:['iphone-home.png','mac-home.png','mac-first.png','mac-workflow.mp4','card-0.png','card-2.png'].map(x=>real+x),
 hero:['hero-A.mp4','hero-B.mp4','hero-C.mp4','hero-A-final.png'].map(x=>'local-assets/2026-10-01/hero/'+x),
};
const profile=process.argv[2]||'base';
if(!profiles[profile])throw new Error('Profile: base | native | value | hero');
const missing=profiles[profile].filter(f=>!existsSync(join(projectRoot,'public',f)));
if(missing.length){console.error(`缺少 ${profile} 素材：\n${missing.join('\n')}\n配置说明：docs/素材与运行.md`);process.exitCode=1;}
else console.log(`${profile}: ${profiles[profile].length} 个输入文件均存在。`);
