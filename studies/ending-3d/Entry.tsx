/**
 * 中文说明：12 秒三维片尾的文字合成层：前半接 Blender 镜头，后半呈现作品信息与品牌；信息从渲染参数注入。
 * 完整命令与适用场景：docs/动画目录.md
 */
import React from 'react';
import {
  AbsoluteFill, Composition, Easing, Img, OffthreadVideo, Sequence,
  interpolate, registerRoot, staticFile, useCurrentFrame,
} from 'remotion';

// The independent entry point avoids changing the existing film compositions.
const media = 'local-assets/ending-3d-20261001/';
const reveal = (frame: number, start: number, duration = 24) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

type EndingProps = {title: string; school: string; group: string; slogan: string};

const Ending: React.FC<EndingProps> = ({title, school, group, slogan: sloganText}) => {
  const frame = useCurrentFrame();
  const brand = reveal(frame, 239, 25);
  const slogan = reveal(frame, 254, 25);
  const identity = reveal(frame, 281, 24);
  const cardIn = reveal(frame, 120, 22);
  const cardOut = reveal(frame, 218, 28);
  const card = cardIn * (1-cardOut);
  return <AbsoluteFill style={{background: '#071723', color: '#F5F8F7',
    fontFamily: 'Arial, "PingFang SC", sans-serif', overflow: 'hidden'}}>
    <Sequence durationInFrames={180}>
      <OffthreadVideo muted src={staticFile(media + 'camera.mp4')}
        style={{width: '100%', height: '100%'}} />
    </Sequence>
    <Sequence from={180}>
      <Img src={staticFile(media + 'last-frame.png')}
        style={{width: '100%', height: '100%'}} />
    </Sequence>
    <AbsoluteFill style={{background: '#06131DBD', opacity: card}} />
    <div style={{position: 'absolute', left: 220, top: 159, width: 840,
      padding: '34px 44px 30px', borderRadius: 25, background: '#F5F8F7',
      boxShadow: '0 35px 90px #00000070', color: '#071723', opacity: card,
      transform: `perspective(1400px) translateX(${-cardOut*700}px) translateZ(${(1-cardIn)*-300}px) rotateY(${(1-cardIn)*-28+cardOut*64}deg)`,
      transformOrigin: 'left center'}}>
      <div style={{fontSize: 17, letterSpacing: 3, color: '#1688E8', fontWeight: 700}}>WORK ID / 作品信息</div>
      <div style={{fontSize: 23, marginTop: 10, marginBottom: 18, fontWeight: 600}}>每一条任务主线，都有清晰归属。</div>
      {[
        ['作品名 / TITLE', title], ['学校 / SCHOOL', school], ['组别 / GROUP', group],
      ].filter(([,value]) => value).map(([label,value]) => <div key={label}
        style={{display: 'flex', alignItems: 'center', minHeight: 62,
          borderBottom: '1px solid #173B5117', gap: 25}}>
        <div style={{width: 170, fontSize: 14, color: '#5D7281', letterSpacing: 1}}>{label}</div>
        <div style={{fontSize: 29, fontWeight: 600}}>{value}</div>
      </div>)}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 409,
      textAlign: 'center', fontSize: 77, fontWeight: 600, letterSpacing: -2,
      opacity: brand, transform: `translateY(${(1-brand)*23}px)`}}>{title}</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 520,
      textAlign: 'center', fontSize: 38, letterSpacing: 3, color: '#AFCFE5',
      opacity: slogan, transform: `translateY(${(1-slogan)*16}px)`}}>{sloganText}</div>
    {(school || group) && <div style={{position: 'absolute',
      left: 110, right: 110, top: 630, fontSize: 18, lineHeight: 1.6,
      color: '#A0B4C4', textAlign: 'center', opacity: identity}}>
      <div>{[title, school, group].filter(Boolean).join('  ·  ')}</div>
    </div>}
  </AbsoluteFill>;
};

const Root: React.FC = () => <Composition id="Anchor-Ending-3D-Study"
  component={Ending} defaultProps={{title:'Anchor 安可', school:'', group:'', slogan:'与 AI 从容共事'}}
  durationInFrames={360} width={1280} height={720} fps={30} />;

registerRoot(Root);
