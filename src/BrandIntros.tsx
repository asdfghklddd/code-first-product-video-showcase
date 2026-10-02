/**
 * 中文说明：四种 20 秒品牌片头：Kinetic 大字、Journey 横移、Orbital 透视环形、ReferenceStyle 圆角遮罩。产品截图/录屏只在最后 5 秒出现。
 * 完整命令与适用场景：docs/动画目录.md
 */
import {AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Type, Phone, Mac} from './PremiumMotion';
import {anchorTheme} from './config/anchorTheme';

const {ink, paper, cobalt:blue, night:dark}=anchorTheme.colors;
const font='Arial, "PingFang SC", sans-serif';
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const smooth=Easing.bezier(.65,0,.35,1), out=Easing.bezier(.22,1,.36,1);
const p=(t:number,a:number,b:number,e=out)=>interpolate(t,[a,b],[0,1],{...clamp,easing:e});
const v=(t:number,times:number[],values:number[])=>interpolate(t,times,values,{...clamp,easing:smooth});
const useTime=()=>useCurrentFrame()/useVideoConfig().fps;
const Logo:React.FC<{size?:number;light?:boolean}>=({size=100,light})=><Img src={staticFile('brand/anchor-project-logo.png')} style={{width:size,height:size,objectFit:'contain',filter:light?'brightness(0) invert(1)':undefined}}/>;
const Mark:React.FC<{light?:boolean}>=({light})=><div style={{position:'absolute',left:106,top:64,zIndex:10,display:'flex',alignItems:'center',gap:14,color:light?paper:ink,fontSize:29,fontWeight:600}}><Logo size={40} light={light}/><span>Anchor 安可</span></div>;
const Small:React.FC<{text:string;t:number;start:number;light?:boolean}>=({text,t,start,light})=><div style={{fontSize:30,lineHeight:1.65,letterSpacing:2,color:light?'#B8D1E5':'#637B8C',opacity:p(t,start,start+.7),transform:`translateY(${(1-p(t,start,start+.7))*24}px)`}}>{text}</div>;
const Lockup:React.FC<{t:number;start:number;light?:boolean;size?:number}>=({t,start,light,size=137})=><div style={{position:'absolute',inset:0,textAlign:'center'}}>
 <div style={{position:'absolute',top:238,left:0,width:'100%',opacity:p(t,start,start+.9),transform:`translateY(${(1-p(t,start,start+1))*50}px)`}}><Logo size={152} light={light}/></div>
 <Type text="Anchor 安可" t={t} start={start+.25} size={size} color={light?paper:ink} style={{position:'absolute',left:0,top:431,width:'100%',textAlign:'center'}}/>
 <div style={{position:'absolute',left:0,top:644,width:'100%'}}><Type text="与 AI 从容共事" t={t} start={start+.65} size={53} color={light?'#C9E2F1':'#42728F'} style={{textAlign:'center',letterSpacing:4}}/></div>
 <div style={{position:'absolute',left:0,top:801,width:'100%'}}><Small text="AI 工作节奏管理应用" t={t} start={start+1.2} light={light}/></div>
 </div>;

// Only this final five-second sequence contains product screenshots or recordings.
const ProductFinale:React.FC<{variant:string}>=({variant})=>{
 const t=useTime(), isDark=variant==='C', isReference=variant==='D';
 const enter=p(t,0,.85), bg=isDark?dark:paper;
 return <AbsoluteFill style={{background:bg,color:isDark?paper:ink,fontFamily:font,overflow:'hidden'}}>
  <AbsoluteFill style={{background:isDark?'radial-gradient(ellipse at 55% 70%, #174767, transparent 68%)':'radial-gradient(ellipse at 50% 70%, #D8EDF6, transparent 68%)'}}/>
  <div style={{position:'absolute',left:116,top:82,display:'flex',alignItems:'center',gap:24}}><Logo size={85}/><Type text="Anchor 安可" t={10} start={0} size={76} color={isDark?paper:ink}/></div>
  <div style={{position:'absolute',right:118,top:99,fontSize:49,letterSpacing:2,color:isDark?'#BADCEE':isReference?blue:'#397C9F'}}>与 AI 从容共事</div>
  <div style={{position:'absolute',inset:0,perspective:2000,transform:`translateY(${(1-enter)*180}px) scale(${1.055-enter*.055})`,opacity:enter}}>
   <Mac width={1080} video style={{left:213,top:285,transform:`rotateY(${(1-enter)*-12}deg) rotate(-1deg)`}}/>
   <Phone width={284} style={{left:1383,top:300,transform:`translateX(${(1-enter)*190}px) rotate(3deg)`}}/>
  </div>
  <div style={{position:'absolute',left:220,top:223,fontSize:25,color:isDark?'#9ABCCE':'#698497',opacity:enter}}>掌握全局，安排注意力。从专注，到从容接续。</div>
 </AbsoluteFill>;
};

// A：同一基线上的文字节奏，用色块遮罩接到品牌落版。
const Kinetic:React.FC=()=>{
 const t=useTime(), phase=t<3.6?0:t<7.1?1:2;
 const starts=[0,3.6,7.1]; const lines=['AI 在推进。','注意力，\n由你安排。','掌握全局。\n从容接续。'];
 const wipe=p(t,10.15,11.05,smooth);
 return <AbsoluteFill style={{background:paper,color:ink,fontFamily:font,overflow:'hidden'}}>
  <Mark/>
  <div style={{position:'absolute',right:114,top:77,fontSize:19,letterSpacing:5,color:'#7C919E'}}>WORK AT YOUR PACE</div>
  {t<11.1&&<div style={{position:'absolute',left:133,top:phase===0?359:264,transform:`translateY(${-80*p(t,starts[phase]+2.95,starts[phase]+3.5,smooth)}px)`,opacity:1-p(t,starts[phase]+3.05,starts[phase]+3.5)}}>
   <Type text={lines[phase]} t={t} start={starts[phase]} size={phase===0?184:138}/>
   <div style={{marginTop:39,height:7,width:750*p(t,starts[phase]+.2,starts[phase]+1.7),background:phase===1?'#E5B337':blue}}/>
   <div style={{marginTop:38}}><Small text={['工作不断向前。','把精力，留给值得关注的事。','离开与回来，都能接着向前。'][phase]} t={t} start={starts[phase]+.9}/></div>
  </div>}
  {[0,1,2].map(i=><div key={i} style={{position:'absolute',left:1410+i*80,top:200+i*145,width:230,height:230,borderRadius:50,background:['#CFE6F9','#4C9BFA','#164D91'][i],transform:`rotate(${25+t*5+i*10}deg) translateY(${Math.sin(t*.8+i)*45}px)`,opacity:1-wipe}}/>)}
  <div style={{position:'absolute',inset:0,background:blue,clipPath:`inset(${100*(1-wipe)}% 0 0 0)`}}/>
  {t>10.15&&<div style={{position:'absolute',inset:0,opacity:p(t,10.6,11.3)}}><Lockup t={t} start={10.55} light/><div style={{position:'absolute',width:1100,height:1100,border:'1px solid #FFFFFF25',borderRadius:'50%',left:410,top:-10,transform:`scale(${1+(t-11)*.02})`}}/></div>}
 </AbsoluteFill>;
};

// B：长画布连续横移；cx 控制场景位置，z 控制整体比例。
const Journey:React.FC=()=>{
 const t=useTime(); const cx=v(t,[0,2.7,3.8,6.8,8,10.7,12.1,15],[0,0,1900,1900,3800,3800,5700,5700]);
 const z=v(t,[0,2.5,3.8,6.7,8,10.7,12.2,15],[1.08,1,1,1,1,1,.94,1]);
 return <AbsoluteFill style={{background:paper,fontFamily:font,overflow:'hidden'}}>
  <Mark/>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 70%, #DEEFF6, transparent 68%)'}}/>
  <div style={{position:'absolute',transformOrigin:'0 0',transform:`translate(960px,540px) scale(${z}) translate(${-cx}px,-540px)`}}>
   <svg width="7800" height="1080" style={{position:'absolute',left:-960,top:0}}><path d="M0 780 C650 780 1000 930 1500 680 S2400 230 3150 640 S4400 880 5000 530 S6400 790 7800 650" fill="none" stroke="#75B8E8" opacity="0.38" strokeWidth="5" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p(t,0,13,smooth)}/></svg>
   {[['工作，有许多方向。','任务状态 · 关键变化 · 工作线索'],['让注意力，有方向。','在 AI 协作中，掌握全局'],['投入，也能从容离开。','回来时，让工作自然接续']].map(([title,sub],i)=><div key={title} style={{position:'absolute',left:i*1900-790,top:290,width:1580,textAlign:'center'}}>
    <div style={{fontSize:20,color:'#5486A7',letterSpacing:7,marginBottom:38}}>0{i+1} / YOUR WORK, YOUR PACE</div>
    <Type text={title} t={t} start={[0,3.6,7.7][i]} size={97} style={{textAlign:'center'}}/>
    <div style={{marginTop:42}}><Small text={sub} t={t} start={[.65,4.25,8.35][i]}/></div>
    <div style={{display:'flex',justifyContent:'center',gap:86,marginTop:110}}>{['#EDCA51','#53BFE2','#C58ACB'].map((c,j)=><div key={c} style={{width:86,height:86,borderRadius:'50%',border:`2px solid ${c}`,background:`${c}20`,transform:`translateY(${Math.sin(t+j)*17}px)`,boxShadow:`0 0 0 ${12+p(t,i*3.5,i*3.5+2)*15}px ${c}08`}}/>)}</div>
   </div>)}
   <div style={{position:'absolute',left:5700-960,top:0,width:1920,height:1080}}><Lockup t={t} start={11.1}/></div>
  </div>
 </AbsoluteFill>;
};

// C：透视环形与深色光场，适合科技感而非严格平面需求。
const Orbital:React.FC=()=>{
 const t=useTime(); const close=1-p(t,10.1,11.3); const turn=t*13;
 return <AbsoluteFill style={{background:dark,fontFamily:font,overflow:'hidden'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 60% 60%, #153F5D, transparent 64%)'}}/><Mark light/>
  <div style={{position:'absolute',left:1120,top:532,perspective:1500,opacity:close,transform:`translateX(${v(t,[0,3.5,7.5,10.5],[160,0,-70,0])}px) scale(${v(t,[0,3.5,7.5,10.5],[.6,1,1.13,.72])})`}}>
   {[0,1,2,3].map(i=><div key={i} style={{position:'absolute',width:530+i*45,height:530+i*45,left:-265-i*22.5,top:-265-i*22.5,borderRadius:'50%',border:`${i===0?16:3}px solid ${['#79C7F0','#3E8FC4','#C6EFFF','#2578B3'][i]}`,boxShadow:'0 0 24px #2988C426,inset 0 0 24px #2988C41A',transform:`rotateX(${50+i*19}deg) rotateY(${turn+i*39}deg) rotateZ(${turn*.65}deg)`}}/>)}
   <div style={{position:'absolute',left:-90,top:-90,transform:`rotateY(${Math.sin(t*.4)*16}deg)`}}><Logo size={180}/></div>
  </div>
  {[[0,3.55,'AI 不断向前。','你的节奏，也值得被照顾。'],[3.55,7.15,'掌握全局，\n安排注意力。','让变化有迹可循。'],[7.15,10.65,'专注投入。\n从容接续。','让多任务的节奏，由你掌握。']].map(([a,b,title,sub])=>{const start=Number(a),end=Number(b);return <div key={start} style={{position:'absolute',left:134,top:315,width:920,opacity:p(t,start,start+.45)*(1-p(t,end-.5,end))}}><Type text={String(title)} t={t} start={start} size={88} color={paper}/><div style={{marginTop:43}}><Small text={String(sub)} t={t} start={start+.6} light/></div></div>})}
  <div style={{position:'absolute',inset:0,opacity:p(t,10.3,11.5)}}><Lockup t={t} start={10.35} light/></div>
  <div style={{position:'absolute',width:1450,height:240,border:'1px solid #5BB9ED35',borderRadius:'50%',left:235,top:824,transform:`scale(${.8+p(t,0,14)*.3})`}}/>
 </AbsoluteFill>;
};

const Tile:React.FC<{x:number;y:number;t:number;i:number;color:string}>=({x,y,t,i,color})=><div style={{position:'absolute',left:x,top:y,width:230,height:230,borderRadius:'32% 32% 32% 7%',background:color,transform:`rotate(${v(t,[0,3,6,9,12,15],[0,90,180,270,360,450])+i*90}deg) scale(${.7+p(t,i*.1,1.4)*.3})`}}/>;
// D：旋转圆角色块与整屏遮罩，保留本产品的颜色和品牌素材。
const ReferenceStyle:React.FC=()=>{
 const t=useTime(); const phase=t<3.7?0:t<7.3?1:t<10.9?2:3;
 const cobalt=blue,cyan=anchorTheme.colors.sky;const bg=[cobalt,cyan,cobalt,paper][phase];
 return <AbsoluteFill style={{background:bg,fontFamily:font,overflow:'hidden'}}>
  <Mark light={phase<3&&phase!==1}/>
  {phase<3&&<>
   <Tile x={-65} y={151} t={t} i={0} color={phase===1?anchorTheme.colors.seafoam:cyan}/><Tile x={1480} y={674} t={t} i={1} color={phase===1?cobalt:cyan}/>
   <Tile x={1770} y={388} t={t} i={2} color={phase===1?anchorTheme.colors.seafoam:anchorTheme.colors.sky}/>
   <div style={{position:'absolute',left:0,top:365,width:'100%',textAlign:'center',transform:`translateX(${(1-p(t,[0,3.7,7.3][phase],[.85,4.55,8.15][phase]))*600}px)`}}>
    <Type text={['你好，AI 时代。','找回你的工作节奏。','与 AI 从容共事。'][phase]} t={t} start={[0,3.7,7.3][phase]} size={phase===1?122:134} color={phase===1?ink:"white"} style={{textAlign:'center'}}/>
    <div style={{marginTop:45,fontSize:30,letterSpacing:4,color:phase===1?anchorTheme.colors.ocean:'#FFFFFFCE',opacity:p(t,[.7,4.4,8][phase],[1.5,5.2,8.8][phase])}}>{['每个变化，都有线索。','掌握全局 · 安排注意力','专注投入 · 从容接续'][phase]}</div>
   </div>
  </>}
  {phase===3&&<><Tile x={-70} y={672} t={t} i={0} color={cyan}/><Tile x={1690} y={185} t={t} i={1} color={cobalt}/><Lockup t={t} start={10.9}/></>}
  {[3.7,7.3,10.9].map(s=><div key={s} style={{position:'absolute',inset:0,background:paper,transform:`translateX(${v(t,[s-.28,s,s+.32],[-100,0,100])}%)`,display:t>s-.28&&t<s+.32?'block':'none',borderRadius:'0 100px 100px 0'}}/>)}
 </AbsoluteFill>;
};

const BrandWipe:React.FC<{variant:string}>=({variant})=>{const t=useTime();return <AbsoluteFill style={{background:variant==='C'?dark:paper,clipPath:`circle(${p(t,14.5,15,smooth)*125}% at 50% 32%)`,pointerEvents:'none'}}/>;};

export const BrandIntro:React.FC<{variant:string}>=({variant})=><AbsoluteFill>
 <Sequence durationInFrames={900}>{variant==='A'?<Kinetic/>:variant==='B'?<Journey/>:variant==='C'?<Orbital/>:<ReferenceStyle/>}<BrandWipe variant={variant}/></Sequence>
 <Sequence from={900} durationInFrames={300}><ProductFinale variant={variant}/></Sequence>
</AbsoluteFill>;
