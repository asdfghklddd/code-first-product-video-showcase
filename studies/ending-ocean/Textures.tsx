/**
 * 中文说明：把背景、中文作品信息、标语与截图渲染成透明贴图，供 Blender 使用，避免三维环境中文字体布局不一致。
 * 完整命令与适用场景：docs/动画目录.md
 */
import React from 'react';
import {AbsoluteFill,Composition,Img,registerRoot,staticFile} from 'remotion';

type Identity={title:string;school:string;group:string;slogan:string};
const font='Arial, "PingFang SC", sans-serif';
const defaults:Identity={title:'Anchor 安可',school:'',group:'',slogan:'与 AI 从容共事'};

const Card:React.FC<Identity&{part:string}>=({title,school,group,part})=><AbsoluteFill style={{fontFamily:font}}>
  <div style={{position:'absolute',left:62,right:62,top:54,color:'#082C3A'}}>
    <div style={{opacity:part==='header'?1:0}}>
      <div style={{fontSize:21,letterSpacing:4,fontWeight:700,color:'#147BB4'}}>WORK ID / 作品信息</div>
      <div style={{fontSize:31,fontWeight:600,marginTop:17,letterSpacing:-.7}}>每一条任务主线，都有清晰归属。</div>
      <div style={{position:'absolute',right:0,top:0,padding:'12px 26px',borderRadius:99,
        background:'linear-gradient(100deg, #F5CA56, #F6D777)',fontSize:19,letterSpacing:1.4,fontWeight:600}}>ANCHOR · 2026</div>
    </div>
    <div style={{marginTop:38}}>
      {[['作品名 / TITLE',title],['学校 / SCHOOL',school],['组别 / GROUP',group]].map(([label,value],i)=><div key={label}
        style={{position:'relative',display:'flex',alignItems:'center',height:83,opacity:part===`row${i}`?1:0}}>
        <div style={{width:204,fontSize:19,color:'#667580',letterSpacing:1.3}}>{label}</div>
        <div style={{fontSize:40,fontWeight:650,letterSpacing:-.9}}>{value}</div>
        {i<2&&<div style={{position:'absolute',bottom:0,left:0,width:'100%',height:1,background:'#173F4C17'}}/>}
      </div>)}
    </div>
  </div>
</AbsoluteFill>;

const Background:React.FC=()=> <AbsoluteFill style={{overflow:'hidden',background:'#052332'}}>
  <AbsoluteFill style={{background:'linear-gradient(135deg, #143F4C 0%, #082B3C 48%, #04151F 100%)'}}/>
  <div style={{position:'absolute',left:-680,top:-940,width:1580,height:1580,borderRadius:'50%',background:'#629F9712'}}/>
  <div style={{position:'absolute',left:-520,top:300,width:1640,height:1060,
    background:'radial-gradient(ellipse, #6AC2AF33 0%, #438F8620 30%, transparent 66%)',opacity:.76,filter:'blur(36px)',mixBlendMode:'screen'}}/>
  <div style={{position:'absolute',left:750,top:-400,width:1550,height:1500,
    background:'radial-gradient(ellipse, #2288A320 0%, transparent 65%)',filter:'blur(65px)'}}/>
  <div style={{position:'absolute',left:180,top:520,width:1030,height:570,
    background:'radial-gradient(ellipse, #85DBC826, transparent 67%)',filter:'blur(45px)',opacity:.65,mixBlendMode:'screen'}}/>
  <div style={{position:'absolute',left:-520,top:-160,width:980,height:1700,transform:'rotate(-32deg)',
    background:'linear-gradient(90deg, transparent, #C1F6E507 45%, #B8F4DF0D 54%, transparent)',filter:'blur(60px)',mixBlendMode:'screen'}}/>
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',opacity:.23}}>
    <g fill="none" stroke="#9DC6BD" strokeWidth="1.15">
      <path d="M-160 750 C380 548 840 426 1430 581 S2030 622 2210 410"/>
      <path d="M-250 998 C100 516 795 730 1030 780 S1720 924 2060 669" opacity=".55"/>
      <ellipse cx="1490" cy="185" rx="706" ry="530" transform="rotate(14 1490 185)"/>
      <ellipse cx="1600" cy="158" rx="850" ry="630" transform="rotate(-12 1600 158)" opacity=".30"/>
      <circle cx="-75" cy="925" r="460" opacity=".63"/>
    </g>
  </svg>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 44% 47%, transparent 25%, #03121D38 67%, #010C155F 100%)'}}/>
</AbsoluteFill>;

const Logo:React.FC=()=><AbsoluteFill style={{overflow:'hidden',borderRadius:81}}>
  <Img src={staticFile('local-assets/ending-ae-20261001/app-icon.png')} style={{position:'absolute',width:398,height:398,left:-33,top:-33}}/>
</AbsoluteFill>;

const Slogan:React.FC<{line:number}>=({line})=><AbsoluteFill style={{fontFamily:font}}><div
  style={{fontSize:line===1?104:112,fontWeight:650,letterSpacing:-(line===1?104:112)*.034,
    lineHeight:1.18,color:line===1?'#F5F6EE':'#A0E0C9'}}>{line===1?'与 AI':'从容共事'}</div></AbsoluteFill>;

const Name:React.FC<Identity>=({title})=><AbsoluteFill style={{fontFamily:font,color:'#BFE6D7',fontSize:30,letterSpacing:3,fontWeight:600}}>{title}</AbsoluteFill>;
const Footer:React.FC<Identity>=({title,school,group})=><AbsoluteFill style={{fontFamily:font,
  color:'#D4E9DF',fontSize:22,letterSpacing:.5,justifyContent:'center',textAlign:'center'}}>{[title,school,group].filter(Boolean).join('  ·  ')}</AbsoluteFill>;
const Top:React.FC=()=><AbsoluteFill style={{fontFamily:font,fontSize:17,letterSpacing:3,color:'#D8F5E3A6',flexDirection:'row',alignItems:'center',gap:13}}>
  <span style={{width:6,height:6,borderRadius:'50%',background:'#A0E0C9',boxShadow:'0 0 15px #9AF3D5A6'}}/>ANCHOR / 与 AI 从容共事
</AbsoluteFill>;
const Shadow:React.FC=()=><AbsoluteFill style={{background:'radial-gradient(ellipse, #CAE7DC7A, #9ED8CB24 35%, transparent 71%)'}}/>;
const MacScreen:React.FC=()=><AbsoluteFill style={{overflow:'hidden',borderRadius:24}}><Img src={staticFile('local-assets/2026-09-30/real/mac-home.png')} style={{width:'100%',height:'100%'}}/></AbsoluteFill>;
const PhoneScreen:React.FC=()=><AbsoluteFill style={{overflow:'hidden',borderRadius:146}}><Img src={staticFile('local-assets/2026-09-30/real/iphone-home.png')} style={{width:'100%',height:'100%'}}/></AbsoluteFill>;

const Root:React.FC=()=> <>
  <Composition id="background" component={Background} width={1920} height={1080} fps={60} durationInFrames={1}/>
  {['header','row0','row1','row2'].map(part=><Composition key={part} id={`card-${part}`} component={Card}
    defaultProps={{...defaults,part}} width={1010} height={522} fps={60} durationInFrames={1}/>)}
  <Composition id="logo-face" component={Logo} width={332} height={332} fps={60} durationInFrames={1}/>
  <Composition id="slogan-1" component={Slogan} defaultProps={{line:1}} width={900} height={145} fps={60} durationInFrames={1}/>
  <Composition id="slogan-2" component={Slogan} defaultProps={{line:2}} width={1000} height={160} fps={60} durationInFrames={1}/>
  <Composition id="name" component={Name} defaultProps={defaults} width={800} height={70} fps={60} durationInFrames={1}/>
  <Composition id="footer" component={Footer} defaultProps={defaults} width={1920} height={70} fps={60} durationInFrames={1}/>
  <Composition id="top-label" component={Top} width={600} height={50} fps={60} durationInFrames={1}/>
  <Composition id="soft-reflection" component={Shadow} width={800} height={160} fps={60} durationInFrames={1}/>
  <Composition id="mac-screen" component={MacScreen} width={1440} height={918} fps={60} durationInFrames={1}/>
  <Composition id="phone-screen" component={PhoneScreen} width={1206} height={2622} fps={60} durationInFrames={1}/>
</>;
registerRoot(Root);
