/**
 * 中文说明：价值总结最终平面方案：A 连续横移，B 截图区域扩展，C 分条遮罩。只使用真实界面与录屏，标题表达进展/注意/接续，不放逐句字幕。
 * 完整命令与适用场景：docs/动画目录.md
 */
import React, {CSSProperties} from 'react';
import {AbsoluteFill,Composition,Easing,Img,OffthreadVideo,Sequence,interpolate,registerRoot,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {Type} from '../../src/PremiumMotion';

// Flat native captures only. Timing and masking follow the existing
// PremiumMotion shared-carrier transition and BrandIntros Journey/shutters.
type Variant='A'|'B'|'C';
const media='local-assets/2026-09-30/real/';
const bg='#F1F6F6',ink='#102C3D',cyan='#29BDD8';
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const ease=Easing.bezier(.22,1,.36,1),travel=Easing.bezier(.65,0,.35,1);
const p=(t:number,a:number,b:number,e= ease)=>interpolate(t,[a,b],[0,1],{...clamp,easing:e});
const track=(t:number,times:number[],values:number[])=>interpolate(t,times,values,{...clamp,easing:travel});
const asset=(s:string)=>staticFile(media+s);
const titles=['正在推进什么？','哪里需要注意？','回来，从哪继续？'];
const short=['看清进展','聚焦关键','从容接续'];
const start=[0,3.25,6.65,10.1];
const stageOf=(t:number)=>t<3.25?0:t<6.65?1:t<10.1?2:3;

const Capture:React.FC<{name:string;style?:CSSProperties}>=({name,style})=><Img src={asset(name)} style={{display:'block',width:'100%',height:'auto',...style}}/>;
const Window:React.FC<{name?:string;width:number;style?:CSSProperties;children?:React.ReactNode}>=({name,width,style,children})=><div style={{position:'absolute',width,borderRadius:21,overflow:'hidden',background:'#EAF5FB',border:'1px solid #CCDFE5',boxShadow:'0 12px 36px #19475A13',...style}}>{name?<Capture name={name}/>:children}</div>;
const NativeVideo:React.FC<{from:number;width:number;style?:CSSProperties}>=({from,width,style})=>{
 const {fps}=useVideoConfig();
 return <Window width={width} style={{height:width*918/1440,...style}}><Sequence from={Math.round(from*fps)} layout="none"><OffthreadVideo src={asset('mac-workflow.mp4')} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/></Sequence></Window>;
};
const Base:React.FC<{t:number}>=({t})=><>
 <AbsoluteFill style={{background:bg}}/>
 <AbsoluteFill style={{background:'radial-gradient(ellipse at 65% 58%, #DFF3F7 0%, transparent 70%)'}}/>
 <svg width="1920" height="1080" style={{position:'absolute',opacity:.35}}><path d={`M-150 850 C350 820 390 110 900 390 S1350 1130 2100 ${520+Math.sin(t*.25)*40}`} stroke="#82C8E0" strokeWidth="1.4" fill="none"/></svg>
 <div style={{position:'absolute',left:115,top:65,display:'flex',gap:13,alignItems:'center',zIndex:30}}><Img src={staticFile('brand/anchor-project-logo.png')} style={{width:35,height:35,objectFit:'contain'}}/><span style={{fontWeight:700,fontSize:26,letterSpacing:-1}}>Anchor</span></div>
</>;
const Heading:React.FC<{t:number;at:number;index:number;style?:CSSProperties;size?:number}>=({t,at,index,style,size=87})=><div style={{position:'absolute',...style}}>
 <div style={{fontSize:16,color:'#71909F',letterSpacing:4,marginBottom:30,opacity:p(t,at+.1,at+.7)}}>0{index+1} / {short[index]}</div>
 <Type text={["正在推进\n什么？","哪里真正\n需要注意？","回来，\n从哪继续？"][index]} t={t} start={at+.18} size={size} color={ink}/>
 <div style={{height:4,background:cyan,width:100*p(t,at+.45,at+1.3),marginTop:36,borderRadius:4}}/>
</div>;
const Summary:React.FC<{t:number;style?:CSSProperties}>=({t,style})=><div style={{position:'absolute',...style}}>
 <Type text="主线不丢失。" t={t} start={10.25} size={94} color={ink}/>
 <Type text="回来就能继续。" t={t} start={10.48} size={94} color={ink}/>
</div>;
const Footer:React.FC<{t:number}>=({t})=>{const current=stageOf(t);return <div style={{position:'absolute',left:119,right:119,bottom:54,display:'flex',alignItems:'center',gap:24,zIndex:15,opacity:p(t,0,.65)}}>
 {short.map((s,i)=><React.Fragment key={s}>{i>0&&<div style={{height:1,width:64,background:'#CCDFE5'}}/>}<div style={{fontSize:18,color:current===i||current===3?ink:'#89A2AE',display:'flex',gap:10,alignItems:'center'}}><span style={{width:6,height:6,borderRadius:10,background:current>=i?cyan:'#C9DDE4'}}/>{s}</div></React.Fragment>)}
 <div style={{marginLeft:'auto',fontSize:13,letterSpacing:2.5,color:'#8BA2AC'}}>ANCHOR / KEEP YOUR CONTEXT</div>
 </div>;};
const Highlight:React.FC<{t:number;at:number;style:CSSProperties}>=({t,at,style})=><div style={{position:'absolute',border:'2px solid #2BBBD7',borderRadius:17,pointerEvents:'none',boxShadow:'0 0 0 7px #2BBBD70C',opacity:p(t,at,at+.65),clipPath:`inset(0 ${100*(1-p(t,at,at+.8))}% 0 0)`,...style}}/>;

// A: One continuous horizontal stage, with native UI driving each matching move.
// A：四个平面场景按 1920px 间距排开，用同一 cx 连续移动。
const Journey:React.FC<{t:number}>=({t})=>{
 const cx=track(t,[0,2.78,3.68,6.14,7.08,9.72,10.75,14],[0,0,1920,1920,3840,3840,5760,5760]);
 const velocity=Math.max(0,1-Math.abs(t-3.23)/.5,1-Math.abs(t-6.6)/.5,1-Math.abs(t-10.24)/.5);
 return <AbsoluteFill>
  <div style={{position:'absolute',inset:0,transform:`translateX(${-cx}px)`,filter:`blur(${velocity*1.8}px)`}}>
   <div style={{position:'absolute',left:0,top:0,width:1920,height:1080}}>
    <Heading t={t} at={0} index={0} style={{left:120,top:330}}/>
    <Window name="iphone-home.png" width={342} style={{left:1148,top:145,transform:`translateY(${(1-p(t,0,1))*170}px)`}}/>
    <Window name="card-0.png" width={445} style={{left:817,top:390,transform:`translateX(${(1-p(t,.55,1.4))*210}px)`,opacity:p(t,.5,1.1)}}/>
    <Window name="card-2.png" width={318} style={{left:1470,top:589,transform:`translateY(${(1-p(t,.8,1.7))*140}px)`,opacity:p(t,.8,1.4)}}/>
   </div>
   <div style={{position:'absolute',left:1920,top:0,width:1920,height:1080}}>
    <Heading t={t} at={3.15} index={1} style={{left:121,top:324}} size={78}/>
    <Window name="mac-first.png" width={1150} style={{left:667,top:208}}/>
    <NativeVideo from={3.30} width={1150} style={{left:667,top:208,opacity:p(t,3.3,3.65)}}/>
    <Highlight t={t} at={4.0} style={{left:755,top:568,width:940,height:304}}/>
   </div>
   <div style={{position:'absolute',left:3840,top:0,width:1920,height:1080}}>
    <Heading t={t} at={6.55} index={2} style={{left:122,top:323}} size={80}/>
    <Window name="mac-home.png" width={1120} style={{left:681,top:228}}/>
    <Highlight t={t} at={7.5} style={{left:772,top:544,width:995,height:188}}/>
   </div>
   <div style={{position:'absolute',left:5760,top:0,width:1920,height:1080}}>
    <Summary t={t} style={{left:121,top:342}}/>
    <Window name="mac-home.png" width={836} style={{left:996,top:261}}/>
    <Window name="iphone-home.png" width={232} style={{left:861,top:480,opacity:p(t,10.6,11.3),transform:`translateY(${(1-p(t,10.5,11.5))*120}px)`}}/>
   </div>
  </div>
 </AbsoluteFill>;
};

// B: A captured card expands into the real desktop; a rounded full-frame
// shutter carries the return, using the existing BrandIntros mask language.
// B：只改变截图区域的位置/尺寸/圆角，随后用圆角遮罩覆盖画面切换。
const SharedCarrier:React.FC<{t:number}>=({t})=>{
 const {fps}=useVideoConfig();
 const morph=p(t,2.68,3.75,travel),ret=p(t,6.25,7.15,travel),end=p(t,9.75,10.75,travel);
 const w=470+morph*665-end*215,h=289+morph*435-end*137;
 const x=990-morph*322+end*180,y=421-morph*205+end*135;
 const phase=stageOf(t);
 const carrier=<>
  <Capture name="card-0.png" style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',opacity:1-p(morph,.1,.8)}}/>
  <Capture name="mac-first.png" style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',opacity:p(morph,.2,.85)}}/>
  <div style={{position:'absolute',inset:0,opacity:p(t,3.5,3.9)*(1-ret)}}><Sequence from={Math.round(3.5*fps)} layout="none"><OffthreadVideo src={asset('mac-workflow.mp4')} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/></Sequence></div>
  <Capture name="mac-home.png" style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',opacity:ret}}/>
 </>;
 return <AbsoluteFill>
  <div style={{position:'absolute',inset:0,opacity:1-morph,transform:`translateX(${-morph*280}px)`}}>
   <Window name="iphone-home.png" width={365} style={{left:1360,top:128,transform:`translateY(${(1-p(t,0,1.05))*155}px)`}}/>
   <Window name="card-2.png" width={333} style={{left:823,top:684,opacity:p(t,.65,1.2),transform:`translateY(${(1-p(t,.65,1.5))*75}px)`}}/>
  </div>
  <Window width={w} style={{left:x,top:y,height:h,transform:`translateY(${(1-p(t,.3,1.2))*80}px)`,opacity:p(t,.1,.8)}}>{carrier}</Window>
  {[0,1,2].map(i=><div key={i} style={{opacity:p(t,start[i],start[i]+.3)*(1-p(t,start[i+1]-.35,start[i+1]+.05)),transform:`translateY(${-p(t,start[i+1]-.35,start[i+1]+.08)*48}px)`}}><Heading t={t} at={start[i]} index={i} style={{left:120,top:328}} size={i===1?78:82}/></div>)}
  {phase<3&&<Highlight t={t} at={phase===1?4.1:7.45} style={{left:phase===1?761:759,top:phase===1?574:535,width:phase===1?920:1010,height:phase===1?290:192,opacity:phase===0?0:undefined}}/>}
  <div style={{opacity:p(t,10.0,10.65)}}><Summary t={t} style={{left:120,top:332}}/></div>
  <Window name="iphone-home.png" width={219} style={{left:1642,top:148,opacity:p(t,10.45,11.25),transform:`translateY(${(1-p(t,10.45,11.3))*100}px)`}}/>
  {[6.65,10.1].map(s=>{const active=t>s-.37&&t<s+.47;const off=track(t,[s-.37,s,s+.47],[-2100,0,2100]);return active?<div key={s} style={{position:'absolute',inset:0,transform:`translateX(${off}px)`,background:bg,borderRadius:'0 110px 110px 0',borderRight:'35px solid #BFEAF2'}}/>:null;})}
 </AbsoluteFill>;
};

// 把真实截图分成五条，交错方向、错峰进入；稳定后重新组成完整截图。
const Sliced:React.FC<{t:number;at:number;name:string;previous:string;width:number;height:number;style?:CSSProperties}>=({t,at,name,previous,width,height,style})=><div style={{position:'absolute',width,height,borderRadius:22,overflow:'hidden',border:'1px solid #CBDFE7',boxShadow:'0 12px 38px #25445C12',...style}}>
 <Capture name={previous} style={{position:'absolute',width,height,objectFit:'cover',objectPosition:previous==='mac-first.png'?'bottom':'top'}}/>
 {[0,1,2,3,4].map(i=>{const q=p(t,at+i*.047,at+.65+i*.047,travel);return <div key={i} style={{position:'absolute',left:0,top:i*height/5,width,height:height/5+1,overflow:'hidden',transform:`translateX(${(1-q)*(i%2===0?1:-1)*width}px)`}}><Capture name={name} style={{position:'absolute',width,height,top:-i*height/5,objectFit:'cover',objectPosition:name==='mac-first.png'?'bottom':'top'}}/></div>;})}
</div>;

// C: Flat editorial framing, alternate-direction native screenshot strips,
// and a screenshot mosaic that resolves under the final heading.
// C：上方大标题，下方原生截图分条转场，最后收束为多屏组合。
const StripEdit:React.FC<{t:number}>=({t})=>{
 const phase=stageOf(t),end=p(t,9.8,10.85,travel);
 const w=1370-end*420,x=275-end*155,y=294+end*154;
 return <AbsoluteFill>
  {[0,1,2].map(i=><div key={i} style={{position:'absolute',left:0,top:153,width:1920,textAlign:'center',opacity:p(t,start[i],start[i]+.3)*(1-p(t,start[i+1]-.28,start[i+1]+.02)),transform:`translateY(${-p(t,start[i+1]-.28,start[i+1]+.02)*35}px)`}}>
   <Type text={titles[i]} t={t} start={start[i]+.12} size={74} color={ink} style={{textAlign:'center'}}/>
  </div>)}
  <div style={{position:'absolute',inset:0,transform:`translateY(${(1-p(t,0,.95))*115}px)`,opacity:p(t,0,.6)}}>
   <Window name="mac-home.png" width={w} style={{left:x,top:y,height:624-end*118,overflow:'hidden'}}><></></Window>
   {t>=2.94&&t<6.40&&<Sliced t={t} at={2.95} previous="mac-home.png" name="mac-first.png" width={w} height={624} style={{left:x,top:y}}/>}
   {t>=6.4&&<Sliced t={t} at={6.42} previous="mac-first.png" name="mac-home.png" width={w} height={624-end*118} style={{left:x,top:y}}/>}
   {phase===0&&<Highlight t={t} at={.85} style={{left:386,top:681,width:1215,height:228}}/>}
   {phase===1&&<Highlight t={t} at={4.02} style={{left:386,top:477,width:1115,height:361}}/>}
   {phase===2&&<Highlight t={t} at={7.6} style={{left:386,top:681,width:1215,height:228}}/>}
  </div>
  <div style={{position:'absolute',left:120,top:166,opacity:p(t,10.05,10.65)}}><Type text="主线不丢失，回来就能继续。" t={t} start={10.15} size={79} color={ink}/></div>
  <Window name="card-0.png" width={411} style={{left:1132,top:475,opacity:p(t,10.55,11.2),transform:`translateX(${(1-p(t,10.55,11.4))*140}px)`}}/>
  <Window name="iphone-home.png" width={241} style={{left:1568,top:401,opacity:p(t,10.8,11.4),transform:`translateY(${(1-p(t,10.8,11.5))*150}px)`}}/>
 </AbsoluteFill>;
};

const FlatFilm:React.FC<{variant:Variant}>=({variant})=>{
 const t=useCurrentFrame()/useVideoConfig().fps;
 return <AbsoluteFill style={{fontFamily:'Arial,"PingFang SC","Hiragino Sans GB",sans-serif',color:ink,overflow:'hidden'}}>
  <Base t={t}/>{variant==='A'?<Journey t={t}/>:variant==='B'?<SharedCarrier t={t}/>:<StripEdit t={t}/>}<Footer t={t}/>
 </AbsoluteFill>;
};
registerRoot(()=> <>{(['A','B','C'] as Variant[]).map(variant=><Composition key={variant} id={`Anchor-Value-${variant}`} component={FlatFilm} defaultProps={{variant}} durationInFrames={833} fps={60} width={1920} height={1080}/>)}</>);
