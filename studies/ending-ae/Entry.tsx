/**
 * 中文说明：14 秒光影片尾：青绿光场、页面分层、弹性信息卡、扫光、失焦推进与标语收束。为 Remotion 实现，包含透视与立体图标视觉。
 * 完整命令与适用场景：docs/动画目录.md
 */
import React from 'react';
import {
  AbsoluteFill, Composition, Easing, Img, OffthreadVideo,
  interpolate, registerRoot, spring, staticFile, useCurrentFrame,
} from 'remotion';

// Owner information is supplied at render time, outside the public sources.
type Props = {title: string; school: string; group: string; slogan: string};
const FPS = 60;
const assets = 'local-assets/ending-ae-20261001/';
const paper = '#F5F6EE';
const mint = '#A0E0C9';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const easeOut = Easing.bezier(.16, 1, .3, 1);
const easeInOut = Easing.bezier(.65, 0, .35, 1);
const easeIn = Easing.bezier(.65, 0, 1, .45);
const ramp = (t: number, a: number, b: number, easing = easeOut) =>
  interpolate(t, [a,b], [0,1], {...clamp, easing});

// 背景层：缓慢漂移的径向光与细线，不遮挡主要信息。
const LightField: React.FC<{t: number}> = ({t}) => {
  const transition = ramp(t, 6.8, 7.45, easeInOut) * (1-ramp(t, 7.45, 8.1));
  const logo = ramp(t, 7.5, 9.4);
  return <AbsoluteFill style={{overflow:'hidden', background:'#052332'}}>
    <AbsoluteFill style={{background:'linear-gradient(135deg, #143F4C 0%, #082B3C 48%, #04151F 100%)'}} />
    <div style={{position:'absolute',left:-680+t*14,top:-940,width:1580,height:1580,
      borderRadius:'50%',background:'#629F9712',transform:`rotate(${t*.8}deg)`}} />
    <div style={{position:'absolute',left:-520+Math.sin(t*.23)*150,top:300-t*11,width:1640,height:1060,
      background:'radial-gradient(ellipse, #6AC2AF33 0%, #438F8620 30%, transparent 66%)',
      opacity:.76+Math.sin(t*.7)*.13,filter:'blur(36px)',mixBlendMode:'screen'}} />
    <div style={{position:'absolute',left:750+t*7,top:-400,width:1550,height:1500,
      background:'radial-gradient(ellipse, #2288A320 0%, transparent 65%)',filter:'blur(65px)'}} />
    <div style={{position:'absolute',left:180+Math.sin(t*.18)*80,top:520,width:1030,height:570,
      background:'radial-gradient(ellipse, #85DBC826, transparent 67%)',
      filter:'blur(45px)',opacity:.48+logo*.25,mixBlendMode:'screen'}} />
    <div style={{position:'absolute',left:-520+t*27,top:-160,width:980,height:1700,
      transform:'rotate(-32deg)',background:'linear-gradient(90deg, transparent, #C1F6E507 45%, #B8F4DF0D 54%, transparent)',
      filter:'blur(60px)',mixBlendMode:'screen'}} />
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',
      transform:`translate(${Math.sin(t*.22)*30}px,${-t*1.3}px) rotate(${Math.sin(t*.12)*.6}deg)`,opacity:.23}}>
      <g fill="none" stroke="#9DC6BD" strokeWidth="1.15">
        <path d="M-160 750 C380 548 840 426 1430 581 S2030 622 2210 410" />
        <path d="M-250 998 C100 516 795 730 1030 780 S1720 924 2060 669" opacity=".55" />
        <ellipse cx="1490" cy="185" rx="706" ry="530" transform="rotate(14 1490 185)" />
        <ellipse cx="1600" cy="158" rx="850" ry="630" transform="rotate(-12 1600 158)" opacity=".30" />
        <circle cx="-75" cy="925" r="460" opacity=".63" />
      </g>
    </svg>
    <AbsoluteFill style={{background:'radial-gradient(ellipse at 44% 47%, transparent 25%, #03121D38 67%, #010C155F 100%)'}} />
    <AbsoluteFill style={{background:'radial-gradient(ellipse at 56% 40%, #D4F8E791, transparent 72%)',
      opacity:transition*.10, mixBlendMode:'screen'}} />
  </AbsoluteFill>;
};

const NativePages: React.FC<{t: number}> = ({t}) => {
  const spread = ramp(t, .35, 2.8, easeInOut);
  const focus = ramp(t, 2.45, 3.55, easeInOut);
  const fade = 1-ramp(t, 6.40, 7.16, easeInOut);
  const opacity = (1-focus*.76)*fade;
  const blur = focus*1.1+ramp(t, 6.2, 7.15)*7;
  const drift = Math.sin(t*.45)*22;
  return <AbsoluteFill style={{perspective:2100, perspectiveOrigin:'50% 45%',
    transformStyle:'preserve-3d',pointerEvents:'none'}}>
    <div style={{position:'absolute',left:280-spread*470+drift,top:255-spread*39-t*4,
      width:1080,height:1080*918/1440,padding:6,borderRadius:24,
      background:'linear-gradient(140deg, #D9EEE9, #253D47 44%, #B2CCCA)',
      boxShadow:'0 45px 95px #000C, 0 0 0 1px #C6E9DD4A',opacity,
      filter:`blur(${blur}px)`,transform:`translateZ(${-spread*210}px) rotateY(${spread*15}deg) rotateZ(${-spread*8}deg) rotateX(3deg)`}}>
      <div style={{width:'100%',height:'100%',overflow:'hidden',borderRadius:18}}>
        <Img src={staticFile(assets+'mac-home.png')} style={{width:'100%',height:'100%',display:'block'}} />
      </div>
      <div style={{position:'absolute',inset:0,borderRadius:24,
        background:'linear-gradient(115deg, #BAF9E71A, transparent 40%, #052E4721)'}} />
    </div>
    <div style={{position:'absolute',left:1370+spread*138-drift*.4,top:125+spread*25-t*9,
      width:346+spread*78,height:(346+spread*78)*2622/1206,padding:7,borderRadius:49,
      background:'linear-gradient(130deg, #B8D1CC, #19323D 47%, #49606B)',
      boxShadow:'0 48px 100px #000C, 0 0 0 1px #CAEDE43B',opacity:opacity*.98,
      filter:`blur(${blur+.25}px)`,transform:`translateZ(${-spread*60}px) rotateY(${-spread*12}deg) rotateZ(${spread*7}deg) rotateX(-2deg)`}}>
      <div style={{width:'100%',height:'100%',overflow:'hidden',borderRadius:42}}>
        <Img src={staticFile(assets+'iphone-home.png')} style={{width:'100%',height:'100%',display:'block'}} />
      </div>
    </div>
  </AbsoluteFill>;
};

// 信息卡：弹性入场、行级错峰、扫光，然后快速推近和失焦转场。
const WorkCard: React.FC<Props & {t:number}> = ({t,title,school,group}) => {
  if(t<2.4 || t>7.78) return null;
  const entering = spring({fps:FPS,frame:Math.max(0,(t-2.55)*FPS),config:{damping:19,stiffness:100,mass:.9}});
  const reveal = ramp(t,2.55,3.5);
  const push = ramp(t,6.64,7.37,easeIn);
  const out = ramp(t,7.30,7.72,easeInOut);
  const focusBlur = (1-reveal)*5 + ramp(t,7.02,7.35,easeInOut)*12;
  const scale = (.63+entering*.37)*(1+push*4.9);
  const x = 960+Math.sin(t*.9)*16-push*92;
  const y = 529-Math.sin(t*.7)*10-push*15;
  const sweep = ramp(t,3.75,5.05,easeInOut);
  return <AbsoluteFill style={{perspective:1800,perspectiveOrigin:'50% 45%',transformStyle:'preserve-3d'}}>
    <div style={{position:'absolute',left:x,top:y,width:1010,height:522,
      opacity:reveal*(1-out),filter:`blur(${focusBlur}px)`,
      transform:`translate(-50%,-50%) scale(${scale}) rotateY(${(1-reveal)*-19+push*2.4}deg) rotateX(${(1-reveal)*8}deg) rotateZ(${(1-reveal)*-3+Math.sin(t*.6)*.22}deg)`,
      transformOrigin:'50% 47%', borderRadius:34,
      background:'linear-gradient(125deg, #F8F6EE, #F2F6F1 76%, #E3F1EC)',
      boxShadow:`0 ${30+reveal*20}px 95px #00000077, 0 12px 28px #00000026, 0 0 0 1px #ECFFF885`,
      overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,borderRadius:34,
        boxShadow:'inset 0 2px 3px #FFFFFFDE, inset 0 -2px 3px #8CBDBF22'}} />
      <div style={{position:'absolute',left:-600+sweep*2050,top:-260,width:420,height:1000,
        transform:'rotate(24deg)',background:'linear-gradient(90deg, transparent, #FFFFFF91 48%, transparent)',
        opacity:ramp(t,3.75,4.1)*(1-ramp(t,4.9,5.2)),filter:'blur(15px)',mixBlendMode:'screen'}} />
      <div style={{position:'absolute',left:62,right:62,top:54,color:'#082C3A'}}>
        <div style={{fontSize:21,letterSpacing:4,fontWeight:700,color:'#147BB4'}}>WORK ID / 作品信息</div>
        <div style={{fontSize:31,fontWeight:600,marginTop:17,letterSpacing:-.7}}>每一条任务主线，都有清晰归属。</div>
        <div style={{position:'absolute',right:0,top:0,padding:'12px 26px',borderRadius:99,
          background:'linear-gradient(100deg, #F5CA56, #F6D777)',fontSize:19,letterSpacing:1.4,fontWeight:600}}>ANCHOR · 2026</div>
        <div style={{marginTop:38}}>
          {[
            ['作品名 / TITLE',title],['学校 / SCHOOL',school],['组别 / GROUP',group],
          ].filter(([,value])=>value).map(([label,value],i)=>{
            const p=ramp(t,3.70+i*.24,4.24+i*.24);
            return <div key={label} style={{position:'relative',display:'flex',alignItems:'center',height:83,
              opacity:p,transform:`translateY(${(1-p)*16}px)`}}>
              <div style={{width:204,fontSize:19,color:'#667580',letterSpacing:1.3}}>{label}</div>
              <div style={{fontSize:40,fontWeight:650,letterSpacing:-.9}}>{value}</div>
              {i<2&&<div style={{position:'absolute',bottom:0,left:0,width:`${p*100}%`,height:1,background:'#173F4C17'}}/>}
            </div>;
          })}
        </div>
      </div>
    </div>
  </AbsoluteFill>;
};

const BrandIcon: React.FC<{t:number}> = ({t}) => {
  const p = spring({fps:FPS,frame:Math.max(0,(t-7.48)*FPS),config:{damping:15,stiffness:88,mass:1.0}});
  const enter = ramp(t,7.48,8.30);
  const scale = .61+p*.39;
  const bob = Math.sin((t-8.6)*1.15)*4*ramp(t,8.6,10);
  const sweep = ramp(t,9.05,10.30,easeInOut);
  const ring = ramp(t,8.70,9.55);
  const glint = Math.sin(sweep*Math.PI)*.9;
  return <div style={{position:'absolute',left:328,top:330,
    transform:`translateY(${(1-p)*52+bob}px) scale(${scale})`,transformOrigin:'50% 60%',
    opacity:enter,filter:`blur(${(1-enter)*7}px)`}}>
    <div style={{position:'absolute',left:1,top:361,width:322,height:37,
      background:'radial-gradient(ellipse, #CAE7DC90, #9ED8CB38 35%, transparent 71%)',
      transform:'rotate(-14deg)',filter:'blur(13px)',opacity:.36+glint*.30}} />
    <svg width="510" height="260" style={{position:'absolute',left:-91,top:212,opacity:ring*.55}}>
      <ellipse cx="255" cy="110" rx={188+ring*20} ry={64+ring*6} fill="none" stroke="#A0DAC2" strokeWidth="1.25" />
      <ellipse cx="255" cy="110" rx="241" ry="88" fill="none" stroke="#80BCAE" strokeWidth=".8" opacity=".35" />
    </svg>
    <div style={{width:332,height:332,perspective:1500,transformStyle:'preserve-3d'}}>
      <div style={{position:'absolute',inset:0,transformStyle:'preserve-3d',
        transform:`rotateY(${(1-enter)*-20+Math.sin(t*.5)*-3.2}deg) rotateX(${(1-enter)*9+3.5}deg) rotateZ(${(1-enter)*-7+Math.sin(t*.4)*-1.2}deg)`}}>
        {Array.from({length:11},(_,i)=><div key={i} style={{position:'absolute',inset:0,borderRadius:81,
          transform:`translateZ(${-22+i*2}px)`,background:i<5?'#94ABA8':'#D3E2DD',
          boxShadow:i===0?'0 36px 90px #00000045':undefined}}/>)}
        <div style={{position:'absolute',inset:0,transform:'translateZ(1px)',borderRadius:81,overflow:'hidden',
          background:'#F9FBFA',boxShadow:'inset 0 1px 3px #FFFFFF, inset 0 -2px 4px #86A9A238, 0 0 0 1px #EDFFF0CC'}}>
          <Img src={staticFile(assets+'app-icon.png')} style={{position:'absolute',width:398,height:398,left:-33,top:-33}} />
          <div style={{position:'absolute',left:-330+sweep*920,top:-190,width:150,height:760,
            transform:'rotate(26deg)',background:'linear-gradient(90deg, transparent, #FFFFFFE6 48%, transparent)',
            filter:'blur(10px)',opacity:glint,mixBlendMode:'screen'}} />
          <div style={{position:'absolute',inset:0,borderRadius:81,
            boxShadow:'inset 2px 3px 4px #FFFFFFBA, inset -3px -3px 6px #527E771A'}} />
        </div>
      </div>
    </div>
  </div>;
};

const TypeLine: React.FC<{t:number;start:number;children:React.ReactNode;size:number;color?:string;style?:React.CSSProperties}> = ({t,start,children,size,color=paper,style}) => {
  const p=ramp(t,start,start+.73);
  return <div style={{overflow:'hidden',paddingBottom:9,...style}}>
    <div style={{fontSize:size,fontWeight:650,letterSpacing:-size*.034,lineHeight:1.18,color,
      opacity:ramp(t,start,start+.34),filter:`blur(${(1-p)*3.0}px)`,
      transform:`translateY(${(1-p)*105}%)`}}>{children}</div>
  </div>;
};

const Ending: React.FC<Props> = (props) => {
  const frame=useCurrentFrame();
  const t=frame/FPS;
  const name=ramp(t,8.25,8.95);
  const footer=ramp(t,10.25,11.05);
  const underline=ramp(t,9.1,10.15);
  return <AbsoluteFill style={{fontFamily:'Arial, "PingFang SC", sans-serif',color:paper,overflow:'hidden'}}>
    <LightField t={t}/>
    <NativePages t={t}/>
    <div style={{position:'absolute',left:75,top:64,fontSize:17,letterSpacing:3,color:'#D8F5E3A6',display:'flex',alignItems:'center',gap:13}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:mint,boxShadow:'0 0 15px #9AF3D5A6'}}/>
      ANCHOR / 与 AI 从容共事
    </div>
    <WorkCard {...props} t={t}/>
    {t>7.43&&<BrandIcon t={t}/>}
    <div style={{position:'absolute',left:757,top:346,opacity:name,
      transform:`translateY(${(1-name)*12}px)`,fontSize:30,letterSpacing:3,color:'#BFE6D7',fontWeight:600}}>{props.title}</div>
    <div style={{position:'absolute',left:752,top:405,width:1000}}>
      <TypeLine t={t} start={8.48} size={104}>与 AI</TypeLine>
      <TypeLine t={t} start={8.67} size={112} color={mint}>从容共事</TypeLine>
      <div style={{marginTop:27,width:88*underline,height:4,borderRadius:2,
        background:'linear-gradient(90deg,#F6CC55,#F5DC80)',boxShadow:'0 0 15px #F6CC5522'}} />
    </div>
    <div style={{position:'absolute',left:0,right:0,bottom:86,textAlign:'center',fontSize:22,
      letterSpacing:.5,color:'#D4E9DF',opacity:footer,transform:`translateY(${(1-footer)*12}px)`}}>
      {[props.title,props.school,props.group].filter(Boolean).join('  ·  ')}
    </div>
  </AbsoluteFill>;
};

const Comparison: React.FC = () => <AbsoluteFill style={{background:'#061B28',fontFamily:'Arial,"PingFang SC",sans-serif',color:paper}}>
  <div style={{position:'absolute',left:60,top:100,fontSize:33,fontWeight:600}}>原片片尾 · 光影与运动参考</div>
  <div style={{position:'absolute',left:1025,top:100,fontSize:33,fontWeight:600}}>新版片尾 · 分层、景深与扫光</div>
  <div style={{position:'absolute',left:35,top:238,width:912,height:513,overflow:'hidden',borderRadius:18}}>
    <OffthreadVideo muted src={staticFile(assets+'reference-ending.mp4')} style={{width:'100%',height:'100%'}}/>
  </div>
  <div style={{position:'absolute',left:974,top:238,width:912,height:513,overflow:'hidden',borderRadius:18}}>
    <OffthreadVideo muted src={staticFile(assets+'new-ending.mp4')} style={{width:'100%',height:'100%'}}/>
  </div>
  <div style={{position:'absolute',left:60,bottom:180,fontSize:23,color:'#9BBDCA'}}>原片 2:26–2:38；两侧为各自片尾的同一播放时间。</div>
  <div style={{position:'absolute',left:60,bottom:126,fontSize:22,color:'#688E9F'}}>原片为 480p 压缩视频；新版为 1080p60 无声预览。</div>
</AbsoluteFill>;

const Root: React.FC = () => <>
  <Composition id="Anchor-Ending-AE" component={Ending}
    defaultProps={{title:'Anchor 安可',school:'',group:'',slogan:'与 AI 从容共事'}}
    durationInFrames={840} width={1920} height={1080} fps={FPS}/>
  <Composition id="Anchor-Ending-AE-Comparison" component={Comparison}
    durationInFrames={720} width={1920} height={1080} fps={FPS}/>
</>;

registerRoot(Root);
