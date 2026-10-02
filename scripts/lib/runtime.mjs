// 中文说明：生产脚本的本地配置入口；默认沿用旧交付目录，可用环境变量迁移。
import {existsSync,readFileSync} from 'node:fs';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
export const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
export const deliveryDir=(name='')=>resolve(process.env.ANCHOR_DELIVERABLES_ROOT||join(projectRoot,'../Deliverables'),name);
export const blenderExecutable=()=>process.env.BLENDER_BIN||(process.platform==='darwin'?'/Applications/Blender.app/Contents/MacOS/Blender':'blender');
// 学校、组别与参考片属于用户自备配置；缺省采用通用文案，不读其他项目。
export function readIdentity(fallback){
 const file=process.env.ANCHOR_IDENTITY_FILE||fallback;
 if(process.env.ANCHOR_IDENTITY_FILE&&!existsSync(file))throw new Error('ANCHOR_IDENTITY_FILE does not exist');
 const data=file&&existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{};
 return {title:'Anchor 安可',school:'',group:'',slogan:'与 AI 从容共事',...data};
}
export function appIcon(){
 const file=process.env.ANCHOR_APP_ICON||join(projectRoot,'public/local-assets/2026-09-30/app-icon.png');
 return existsSync(file)?file:join(projectRoot,'public/brand/anchor-project-logo.png');
}
export function requireAssets(names){
 const missing=names.filter(name=>!existsSync(join(projectRoot,'public',name)));
 if(missing.length)throw new Error(`缺少本地素材：\n${missing.join('\n')}\n请参考 docs/素材与运行.md；公开基础示例可直接运行 npm run render:video。`);
}
