/**
 * 中文说明：历史 30 秒整片草稿及品牌静帧；用于早期版本比较，生产素材位于 local-assets。
 * 完整命令与适用场景：docs/动画目录.md
 */
import type { CSSProperties, ReactNode } from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const media = "local-assets/2026-09-30/";
const colors = {
  ink: "#183F52",
  blue: "#315E8B",
  cyan: "#2BCBE3",
  muted: "#647F8C",
  gold: "#F4C62F",
  pink: "#E662D3",
};
const easing = Easing.bezier(0.16, 1, 0.3, 1);
const enter = (frame: number, delay = 0, duration = 28) =>
  interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const reveal = (frame: number, delay = 0): CSSProperties => ({
  opacity: enter(frame, delay),
  transform: `translateY(${(1 - enter(frame, delay)) * 24}px)`,
});

const Stage: React.FC<{
  children: ReactNode;
  chapter: string;
  caption: string;
  dark?: boolean;
}> = ({ children, chapter, caption, dark = false }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
        color: dark ? "#F2FBFF" : colors.ink,
        background: dark
          ? "linear-gradient(130deg, #061D2B, #0C3D53 75%, #10546A)"
          : "linear-gradient(140deg, #FAFDFE, #EAF9FC 60%, #CBF3F9)",
      }}
    >
      {[0, 1, 2].map((ring) => (
        <div
          key={ring}
          style={{
            position: "absolute",
            width: 980 + ring * 180,
            height: 780 + ring * 145,
            right: -420 - ring * 90,
            bottom: -520 - ring * 74,
            border: `2px solid ${dark ? "#71D9F320" : "#72C5D72B"}`,
            borderRadius: "50%",
            transform: `rotate(-22deg) translateY(${-frame * 0.08}px)`,
          }}
        />
      ))}
      <div
        style={{ position: "absolute", top: 49, left: 112, display: "flex", alignItems: "center", gap: 17 }}
      >
        <Img src={staticFile(`${media}app-icon.png`)} style={{ width: 57, height: 57, borderRadius: 15 }} />
        <span style={{ fontSize: 31, fontWeight: 700, letterSpacing: -0.8 }}>Anchor</span>
      </div>
      <div
        style={{ position: "absolute", top: 67, right: 112, fontSize: 17, letterSpacing: 3, opacity: 0.62 }}
      >
        {chapter}
      </div>
      {children}
      <div
        style={{
          position: "absolute", left: 112, right: 112, bottom: 43,
          borderTop: `1px solid ${dark ? "#FFFFFF22" : "#315E8B22"}`,
          paddingTop: 23, fontSize: 26, letterSpacing: 1, textAlign: "center",
          color: dark ? "#C8E8F2" : colors.blue,
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};

const Phone: React.FC<{ src: string; x: number; y: number; width?: number; delay?: number; rotation?: number }> = ({
  src, x, y, width = 390, delay = 12, rotation = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width,
        height: (width - 24) * 2622 / 1206 + 24,
        padding: 12, borderRadius: 48,
        background: "linear-gradient(145deg, #6D8B9A, #173443 55%, #537587)",
        boxShadow: "0 32px 70px #143D5230, 0 3px 7px #081B2A40",
        opacity: enter(frame, delay),
        transform: `translateY(${(1 - enter(frame, delay)) * 56}px) rotate(${rotation}deg)`,
      }}
    >
      <Img src={staticFile(`${media}${src}`)} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 36 }} />
    </div>
  );
};

const Mac: React.FC<{
  x: number; y: number; width: number; video?: boolean; src?: string; delay?: number; rotation?: number;
}> = ({ x, y, width, video = false, src = "mac-overview.png", delay = 12, rotation = 0 }) => {
  const frame = useCurrentFrame();
  const style: CSSProperties = { width: "100%", height: "100%", objectFit: "contain", display: "block" };
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width, height: (width - 16) / 1.5 + 16,
        padding: 8, borderRadius: 25, overflow: "hidden", background: "#1B3A4A",
        boxShadow: "0 35px 80px #163D522C",
        opacity: enter(frame, delay),
        transform: `translateY(${(1 - enter(frame, delay)) * 35}px) rotate(${rotation}deg)`,
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 18, overflow: "hidden" }}>
        {video ? (
          <OffthreadVideo src={staticFile(`${media}mac-workflow.mp4`)} muted style={style} />
        ) : (
          <Img src={staticFile(`${media}${src}`)} style={style} />
        )}
      </div>
    </div>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage dark chapter="01 / WORK IN MOTION" caption="几项工作同时推进，你的思路，也需要一个归处。">
      <div style={{ position: "absolute", left: 120, top: 258, zIndex: 2 }}>
        <div style={{ color: "#7BDEED", fontSize: 21, letterSpacing: 4, ...reveal(frame, 4) }}>与 AI 从容共事</div>
        <div style={{ marginTop: 28, fontSize: 87, lineHeight: 1.25, fontWeight: 650, letterSpacing: -4, ...reveal(frame, 12) }}>
          工作在继续。<br />思路有归处。
        </div>
        <div style={{ marginTop: 45, fontSize: 28, color: "#AECCD8", ...reveal(frame, 26) }}>把目标、进展和下一步，留在 Anchor。</div>
      </div>
      <Mac x={975} y={268} width={810} rotation={-4} />
      <div style={{ position: "absolute", left: 1000, top: 866, display: "flex", gap: 18, ...reveal(frame, 30) }}>
        {[colors.gold, colors.cyan, colors.pink].map((color, index) => (
          <div key={color} style={{ width: 230, padding: "16px 20px", borderRadius: 16, background: "#FFFFFF0C", border: `1px solid ${color}65`, fontSize: 21 }}>
            <span style={{ color, marginRight: 12 }}>●</span>{["梳理问题", "确认方案", "安排上线"][index]}
          </div>
        ))}
      </div>
    </Stage>
  );
};

const Overview: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage chapter="02 / HOLD THE CONTEXT" caption="每项工作独立保留目标与进展，一眼找到你要继续的那一项。">
      <div style={{ position: "absolute", left: 126, top: 154, ...reveal(frame, 6) }}>
        <div style={{ fontSize: 70, fontWeight: 650, lineHeight: 1.25, letterSpacing: -3, color: colors.blue }}>把每项工作，稳稳接住。</div>
        <div style={{ marginTop: 23, fontSize: 27, color: colors.muted }}>彩色 Anchors 图表 · 独立任务卡片 · 清晰的当前进展</div>
      </div>
      <Mac x={139} y={365} width={830} video delay={14} rotation={-1} />
      <Phone src="iphone-home.png" x={1276} y={146} width={374} rotation={3} />
    </Stage>
  );
};

const Decision: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 210], [1, 1.025], { extrapolateRight: "clamp" });
  return (
    <Stage chapter="03 / HUMAN DECISION" caption="状态、卡点和待决策事项，就在当前任务旁边。">
      <div style={{ position: "absolute", left: 121, top: 247, width: 570, ...reveal(frame, 7) }}>
        <div style={{ color: "#957019", fontSize: 21, letterSpacing: 3 }}>把注意力留给重要的事</div>
        <div style={{ marginTop: 27, fontSize: 72, lineHeight: 1.28, fontWeight: 650, letterSpacing: -3, color: colors.blue }}>
          真正需要你时，<br />把决定<br />交到你手里。
        </div>
        <div style={{ marginTop: 44, fontSize: 26, color: colors.muted, lineHeight: 1.65, ...reveal(frame, 30) }}>先看正在发生什么，<br />再进入需要你判断的地方。</div>
      </div>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "1260px 545px", transform: `scale(${zoom})` }}>
        <Mac x={729} y={185} width={1060} src="mac-decision.png" delay={14} />
      </div>
      <div style={{ position: "absolute", left: 929, top: 923, display: "flex", alignItems: "center", gap: 16, color: colors.blue, fontSize: 23, ...reveal(frame, 42) }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: colors.gold }} />
        这次先上线哪版注册页？
      </div>
    </Stage>
  );
};

const Return: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage chapter="04 / FIND YOUR WAY BACK" caption="离开时不丢失，回来时能继续。">
      <div style={{ position: "absolute", left: 126, top: 202, width: 835, ...reveal(frame, 6) }}>
        <div style={{ color: colors.muted, fontSize: 22, letterSpacing: 3 }}>WHILE YOU WERE AWAY</div>
        <div style={{ marginTop: 31, fontSize: 80, lineHeight: 1.25, fontWeight: 650, letterSpacing: -3, color: colors.blue }}>回来时，<br />不用从头想起。</div>
        <div style={{ marginTop: 41, fontSize: 28, color: colors.muted, lineHeight: 1.7 }}>先看离开期间的变化，<br />再找回当前进展和下一步。</div>
      </div>
      <div style={{ position: "absolute", left: 130, top: 749, display: "flex", gap: 19 }}>
        {["期间变化", "当前进展", "下一步"].map((label, index) => (
          <div key={label} style={{ width: 225, border: "1px solid #7FC9D84C", borderRadius: 22, background: "#FFFFFF9C", padding: "25px 26px", ...reveal(frame, 30 + index * 10) }}>
            <div style={{ fontSize: 17, color: colors.muted, letterSpacing: 2 }}>0{index + 1}</div>
            <div style={{ marginTop: 15, fontSize: 27, color: colors.blue, fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>
      <Phone src="iphone-return.png" x={1198} y={147} width={377} rotation={2} delay={15} />
    </Stage>
  );
};

export const CurrentPromoClosing: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage chapter="ANCHOR / IPHONE + MAC" caption="与 AI 从容共事。">
      <div style={{ position: "absolute", top: 178, left: 0, right: 0, textAlign: "center", ...reveal(frame, 4) }}>
        <Img src={staticFile(`${media}app-icon.png`)} style={{ width: 212, height: 212, borderRadius: 48, boxShadow: "0 18px 55px #315E8B16" }} />
        <div style={{ fontSize: 112, fontWeight: 650, letterSpacing: -5, marginTop: 20, color: colors.blue }}>Anchor</div>
        <div style={{ fontSize: 60, fontWeight: 500, letterSpacing: 5, marginTop: 31, ...reveal(frame, 17) }}>让思路靠岸。</div>
        <div style={{ fontSize: 24, letterSpacing: 4, marginTop: 59, color: colors.muted, ...reveal(frame, 27) }}>iPhone · Mac</div>
      </div>
    </Stage>
  );
};

export const CurrentPromo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={120}><Intro /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
    <TransitionSeries.Sequence durationInFrames={270}><Overview /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
    <TransitionSeries.Sequence durationInFrames={240}><Decision /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
    <TransitionSeries.Sequence durationInFrames={210}><Return /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
    <TransitionSeries.Sequence durationInFrames={120}><CurrentPromoClosing /></TransitionSeries.Sequence>
  </TransitionSeries>
);
