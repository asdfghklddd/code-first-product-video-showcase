/**
 * 中文说明：历史三维价值总结实验入口；已被 FlatEntry 平面方案替换。保留用于研究，不是此次交付的默认风格。
 * 完整命令与适用场景：docs/动画目录.md
 */
import React from 'react';
import {AbsoluteFill,Composition,Img,registerRoot,staticFile,useCurrentFrame,useVideoConfig,Easing,interpolate} from 'remotion';
import {Scene,ramp,Variant} from './Scene';

const paper='#F1F7F8',ink='#102C3D',cyan='#22BCD8';
const out=Easing.bezier(.16,1,.3,1);
const rise=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:out});
const labels=['当前进展','关键事项','接续起点'];
const copies:Record<Variant,string[][]>={
 A:[['推进，','有迹可循。'],['关键，','一眼聚焦。'],['回来，','从容接续。'],['主线不丢失。','回来就能继续。']],
 B:[['每项推进，','都有方向。'],['让关键，','走到眼前。'],['从上次，','继续向前。'],['主线不丢失。','回来就能继续。']],
 C:[['正在做什么，','清晰在眼前。'],['需要你时，','重点会浮现。'],['离开再回来，','仍在这一页。'],['主线不丢失。','回来就能继续。']],
};
const starts=[0,3.2,6.65,10.1];
const Transition:React.FC<{variant:Variant;t:number}>=({variant,t})=>{
 const event=starts.slice(1).find(s=>t>s-.20&&t<s+.48);
 if(event===undefined)return null;
 const p=(t-event+.20)/.68,fade=Math.sin(p*Math.PI),x=-650+p*3250;
 if(variant==='B')return <div style={{position:'absolute',left:1295,top:520,width:100,height:100,border:'2px solid #60D1E5',borderRadius:'50%',transform:`translate(-50%,-50%) scale(${1+p*34})`,opacity:fade*.45,boxShadow:'0 0 8px #B0F3FF'}}/>;
 return <div style={{position:'absolute',left:x,top:-350,width:variant==='A'?130:260,height:1800,transform:`rotate(${variant==='A'?25:-18}deg)`,background:'linear-gradient(90deg, transparent, #FFFFFFCC 42%, #D8F3F8CC 72%, transparent)',opacity:fade*.65,filter:'blur(9px)'}}/>;
};
const Caption:React.FC<{lines:string[];t:number;start:number;end:number;last:boolean}>=({lines,t,start,end,last})=>{
 const enter=rise(t,start+.12,start+.83),leave=last?0:ramp(t,end-.38,end+.12);
 return <div style={{position:'absolute',left:0,top:0,opacity:enter*(1-leave),transform:`translateY(${(1-enter)*48-leave*34}px)`,filter:`blur(${(1-enter)*6+leave*5}px)`}}>
  <div style={{fontSize:last?73:86,fontWeight:650,letterSpacing:-4,lineHeight:1.25,whiteSpace:'nowrap'}}>
   {lines.map((line,i)=><div key={line} style={{transform:`translateY(${(1-rise(t,start+.18+i*.09,start+.85+i*.09))*30}px)`}}>{line}</div>)}
  </div>
  <div style={{marginTop:38,height:5,width:72+enter*44,background:cyan,borderRadius:4,transformOrigin:'left',transform:`scaleX(${enter})`}}/>
 </div>;
};

export const Film:React.FC<{variant:Variant}>=({variant})=>{
 const f=useCurrentFrame(),{fps,durationInFrames}=useVideoConfig(),t=f/fps,duration=durationInFrames/fps;
 const stage=t<3.2?0:t<6.65?1:t<10.1?2:3;
 const reveal=rise(t,0,.65),end=ramp(t,10.1,11.2);
 return <AbsoluteFill style={{background:paper,color:ink,fontFamily:'Arial,"PingFang SC","Hiragino Sans GB",sans-serif',overflow:'hidden'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 74% 45%, #E0F5F800, #ECF5F800 25%, #F1F7F8 76%),radial-gradient(ellipse at 74% 62%, #D9F1F6 0%, #F1F7F8 64%)'}}/>
  <svg width="1920" height="1080" style={{position:'absolute',opacity:.40}}><path d={`M-100 ${850+Math.sin(t*.3)*30} C420 710 450 1010 950 825 S1450 250 2020 390`} fill="none" stroke="#89CFDF" strokeWidth="1.25"/><path d="M1090 -180 C760 100 1030 360 1680 115 S1880 490 2110 490" fill="none" stroke="#B9E0E7" strokeWidth="1"/></svg>
  <div style={{position:'absolute',left:112,top:66,display:'flex',gap:14,alignItems:'center',opacity:reveal}}>
   <Img src={staticFile('brand/anchor-project-logo.png')} style={{width:37,height:37,objectFit:'contain'}}/>
   <span style={{fontSize:25,fontWeight:700,letterSpacing:-1}}>Anchor</span>
  </div>
  <div style={{position:'absolute',right:114,top:78,fontSize:13,letterSpacing:3.3,color:'#78929F',opacity:reveal}}>KEEP YOUR CONTEXT</div>
  <div style={{position:'absolute',left:625+(variant==='B'?30:0),top:variant==='C'?30:15,opacity:reveal,transform:`translateX(${(1-reveal)*75}px) scale(${1-end*.035})`,transformOrigin:'56% 58%'}}><Scene variant={variant} t={t}/></div>
  <Transition variant={variant} t={t}/>
  <div style={{position:'absolute',left:118,top:315,width:780}}>
   <div style={{position:'absolute',top:-72,fontSize:15,fontWeight:600,letterSpacing:4,color:'#5B8799',opacity:reveal}}>{stage===3?'ANCHOR / 工作的连续性':`0${stage+1} / ${labels[stage]}`}</div>
   {copies[variant].map((lines,i)=><Caption key={i} lines={lines} t={t} start={starts[i]} end={i===3?duration:starts[i+1]} last={i===3}/>)}
  </div>
  <div style={{position:'absolute',left:121,top:704,display:'flex',gap:18,opacity:rise(t,10.55,11.3),transform:`translateY(${(1-rise(t,10.55,11.3))*18}px)`}}>
   {['看清进展','聚焦关键','随时接续'].map((x,i)=><div key={x} style={{fontSize:21,color:'#527787',display:'flex',gap:10,alignItems:'center'}}><span style={{width:7,height:7,borderRadius:'50%',background:i===1?'#E5BE59':cyan}}/>{x}</div>)}
  </div>
  <div style={{position:'absolute',bottom:77,left:120,right:120,display:'flex',alignItems:'center',gap:30,opacity:reveal*(1-end*.3)}}>
   {labels.map((label,i)=>{const active=stage===i||stage===3;return <React.Fragment key={label}>
    {i>0?<div style={{height:1,background:'#CBDDE2',width:85}}/>:null}
    <div style={{display:'flex',alignItems:'center',gap:13,color:active?ink:'#90A6AF',fontSize:20}}><div style={{width:29,height:29,borderRadius:50,background:active?cyan:'#E2ECEF',color:active?'white':'#8FA6B0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700}}>{stage>i?'✓':`0${i+1}`}</div>{label}</div>
   </React.Fragment>;})}
   <div style={{marginLeft:'auto',height:2,width:174,background:'#DCE9ED'}}><div style={{width:`${Math.min(100,f/(durationInFrames-1)*100)}%`,height:'100%',background:cyan}}/></div>
  </div>
 </AbsoluteFill>;
};
const Root=()=> <>{(['A','B','C'] as Variant[]).map(variant=><Composition key={variant} id={`Anchor-Value-${variant}`} component={Film} defaultProps={{variant}} durationInFrames={833} fps={60} width={1920} height={1080}/>)}</>;
registerRoot(Root);
