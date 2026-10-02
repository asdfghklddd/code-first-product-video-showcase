/**
 * 中文说明：短片头 A/B/C 与 26 秒整片；重点复用 Type 逐字入场、连续镜头、真实截图区域扩展及首尾帧衔接。含部分透视设备展示，严格平面需求请用 FlatEntry。
 * 完整命令与适用场景：docs/动画目录.md
 */
import type { CSSProperties } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Every product surface below is a texture captured from the native apps.
// Camera, framing, typography and brand geometry are the film's graphic layer.
const media = "local-assets/2026-09-30/real/";
const ink = "#102535";
const paper = "#F1F5F5";
const blue = "#1577F8";
const night = "#06131F";
const font = '"Arial", "PingFang SC", "Hiragino Sans GB", sans-serif';
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const travel = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ramp = (t: number, a: number, b: number, easing = ease) => interpolate(t, [a, b], [0, 1], { ...clamp, easing });
const track = (t: number, times: number[], values: number[], easing = travel) => interpolate(t, times, values, { ...clamp, easing });
const phoneHeight = (width: number) => (width - 12) * 2622 / 1206 + 12;
const macHeight = (width: number) => (width - 14) * 918 / 1440 + 14;
const asset = (name: string) => staticFile(`${media}${name}`);

export const Type: React.FC<{ text: string; t: number; start: number; size?: number; color?: string; stagger?: number; style?: CSSProperties }> = ({ text, t, start, size = 100, color = ink, stagger = 0.035, style }) => (
  <div style={{ fontFamily: font, fontWeight: 650, fontSize: size, lineHeight: 1.17, letterSpacing: -size * 0.035, color, ...style }}>
    {text.split("\n").map((line, row) => (
      <div key={row} style={{ overflow: "hidden", padding: "2px 5px 5px 0", marginRight: -5 }}>
        {Array.from(line).map((char, index) => {
          const p = ramp(t, start + row * 0.14 + index * stagger, start + row * 0.14 + index * stagger + 0.68);
          return <span key={index} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${(1 - p) * 118}%) rotate(${(1 - p) * 5}deg)`, opacity: ramp(p, 0, 0.25) }}>{char}</span>;
        })}
      </div>
    ))}
  </div>
);

const Caption: React.FC<{ text: string; t: number; start: number; color?: string; style?: CSSProperties }> = ({ text, t, start, color = "#667987", style }) => (
  <div style={{ fontSize: 29, letterSpacing: 1, color, opacity: ramp(t, start, start + 0.7), transform: `translateY(${(1 - ramp(t, start, start + 0.8)) * 20}px)`, lineHeight: 1.6, ...style }}>{text}</div>
);

const Brand: React.FC<{ size?: number; light?: boolean; style?: CSSProperties }> = ({ size = 34, light, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.35, color: light ? paper : ink, fontFamily: font, fontSize: size, fontWeight: 600, letterSpacing: -size * 0.045, ...style }}>
    <Img src={staticFile("brand/anchor-project-logo.png")} style={{ width: size * 1.2, height: size * 1.2, objectFit: "contain" }} />
    <span>Anchor</span>
  </div>
);

export const Phone: React.FC<{ width: number; style?: CSSProperties }> = ({ width, style }) => (
  <div style={{ position: "absolute", width, height: phoneHeight(width), padding: 6, borderRadius: width * 0.11, background: "linear-gradient(130deg, #71818C, #14202B 24%, #070E14 70%, #728692)", boxShadow: "0 28px 70px #0B2D4227, 0 4px 8px #00182635", ...style }}>
    <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: width * 0.095 }}>
      <Img src={asset("iphone-home.png")} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  </div>
);

export const Mac: React.FC<{ width: number; video?: boolean; source?: string; style?: CSSProperties }> = ({ width, video, source = "mac-home.png", style }) => (
  <div style={{ position: "absolute", width, height: macHeight(width), padding: 7, borderRadius: 23, background: "linear-gradient(140deg, #DCE5E9, #556671 25%, #1B2832 75%, #94A8B5)", boxShadow: "0 36px 100px #0B2D4230, 0 4px 8px #00182628", ...style }}>
    <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 17, background: "#E7F6FC" }}>
      {video ? <OffthreadVideo src={asset("mac-workflow.mp4")} muted style={{ width: "100%", height: "100%", display: "block" }} /> : <Img src={asset(source)} style={{ width: "100%", height: "100%", display: "block" }} />}
    </div>
  </div>
);

const Crop: React.FC<{ name: string; width: number; style?: CSSProperties }> = ({ name, width, style }) => (
  <Img src={asset(name)} style={{ position: "absolute", width, height: "auto", borderRadius: 26, boxShadow: "0 25px 65px #10334421", ...style }} />
);

const Trace: React.FC<{ t: number; start?: number; dark?: boolean; style?: CSSProperties }> = ({ t, start = 0, dark, style }) => (
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", pointerEvents: "none", ...style }}>
    <path d="M-40 880 C300 880 430 190 760 190 C1150 190 1040 880 1490 880 C1730 880 1770 550 1960 550" fill="none" stroke={dark ? "#318DEB" : "#78B8ED"} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ramp(t, start, start + 2.6, travel)} opacity={dark ? 0.38 : 0.32} />
  </svg>
);

// A — immediate typographic hook; match cuts on a fixed baseline, then a shutter.
export const OpeningA: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const shutter = ramp(t, 2.05, 2.8, travel);
  const entrance = ramp(t, 2.5, 3.8);
  const finalScale = track(t, [2.5, 4.1, 6], [1.08, 1, 1.015], ease);
  return (
    <AbsoluteFill style={{ background: paper, color: ink, fontFamily: font, overflow: "hidden" }}>
      <Brand size={32} style={{ position: "absolute", left: 110, top: 65 }} />
      <div style={{ position: "absolute", right: 110, top: 80, color: "#73828C", letterSpacing: 5, fontSize: 19 }}>THINK. DECIDE. MOVE.</div>
      {[["想法。", 0], ["判断。", 0.74], ["行动。", 1.48]].map(([word, start], index) => {
        const s = Number(start);
        return <div key={index} style={{ position: "absolute", left: 120, top: 292, opacity: t >= s && t < s + 0.79 ? 1 : 0 }}>
          <Type text={String(word)} t={t} start={s - 0.12} size={238} stagger={0.03} />
          <div style={{ marginTop: 18, width: 590 * ramp(t, s + 0.06, s + 0.63), height: 8, background: index === 2 ? "#EAB82C" : blue }} />
        </div>;
      })}
      <div style={{ position: "absolute", left: 960, top: 258, width: 750, height: 530, perspective: 1700, opacity: 1 - ramp(t, 2.35, 2.65) }}>
        <Crop name="card-0.png" width={485} style={{ left: 170, top: 35, transform: `translateX(${(1 - ramp(t, 0, 0.7)) * 250}px) rotate(-8deg)` }} />
        <Crop name="card-3.png" width={485} style={{ left: 90, top: 135, opacity: ramp(t, 0.73, 1.15), transform: `translateY(${(1 - ramp(t, 0.73, 1.45)) * 155}px) rotate(5deg)` }} />
        <Crop name="card-2.png" width={485} style={{ left: 20, top: 240, opacity: ramp(t, 1.48, 1.85), transform: `translateY(${(1 - ramp(t, 1.48, 2.08)) * 130}px) rotate(-3deg)` }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: blue, clipPath: `inset(${100 * (1 - shutter)}% 0 0 0)` }} />
      <AbsoluteFill style={{ opacity: entrance, transform: `scale(${finalScale})`, transformOrigin: "50% 54%" }}>
        <Trace t={t} start={2.65} dark style={{ opacity: 0.5, filter: "brightness(2)" }} />
        <Brand light size={30} style={{ position: "absolute", left: 110, top: 65 }} />
        <Type text="Anchor" t={t} start={2.64} size={226} color="white" stagger={0.025} style={{ position: "absolute", left: 117, top: 271 }} />
        <Type text="让思路靠岸。" t={t} start={2.95} size={74} color="white" style={{ position: "absolute", left: 132, top: 555 }} />
        <Caption text="想清楚。做下去。" t={t} start={3.55} color="#DAE9FF" style={{ position: "absolute", left: 137, top: 699 }} />
        <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
          <Crop name="card-0.png" width={360} style={{ left: 1456, top: 293, opacity: ramp(t, 2.85, 3.9), transform: "rotate(9deg)", boxShadow: "0 30px 70px #063C8D35" }} />
          <Phone width={326} style={{ left: 1240, top: 163, transform: `translateY(${(1 - entrance) * 200}px) rotateY(${-12 + entrance * 6}deg) rotate(${-7 + entrance * 4}deg)` }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// B — a single camera travels from a real UI macro shot through the whole workspace.
export const OpeningB: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const times = [0, 0.65, 2.3, 3.7, 5.15, 6.5, 8];
  const zoom = track(t, times, [5.6, 5.2, 1.36, 0.87, 0.77, 1, 1]);
  const cx = track(t, times, [175, 175, 175, 15, -380, -430, -430]);
  const cy = track(t, times, [265, 268, 370, 420, 420, 370, 370]);
  const rotation = track(t, times, [-4, -3.5, -1.5, 0, 0, 0, 0]);
  const deck = ramp(t, 1.9, 2.8) * (1 - ramp(t, 4.8, 5.85));
  const desktop = ramp(t, 2.6, 3.65) * (1 - ramp(t, 5.12, 5.9));
  return (
    <AbsoluteFill style={{ background: paper, color: ink, fontFamily: font, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 75% 45%, #E1F4F9 0%, transparent 55%)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: ramp(t, 3.3, 4.4) }}><Trace t={t} start={2.2} /></div>
      <div style={{ position: "absolute", transformOrigin: "0 0", transform: `translate(960px, 540px) scale(${zoom}) rotate(${rotation}deg) translate(${-cx}px, ${-cy}px)` }}>
        <div style={{ position: "absolute", left: -1490 - ramp(t, 5.12, 6.05, travel) * 700, top: 110, opacity: desktop, perspective: 2000 }}><Mac width={1180} style={{ transform: "rotateY(7deg) rotate(-2deg)" }} /></div>
        <Crop name="card-0.png" width={430} style={{ left: 445, top: 60, opacity: deck, transform: `translateY(${(1 - ramp(t, 1.85, 3)) * 180}px) rotate(7deg)` }} />
        <Crop name="card-2.png" width={360} style={{ left: 410, top: 520, opacity: deck, transform: `translateY(${(1 - ramp(t, 2.05, 3.2)) * 200}px) rotate(-6deg)` }} />
        <Phone width={350} style={{ left: 0, top: 0 }} />
      </div>
      <div style={{ opacity: ramp(t, 5.45, 6.35) }}><Brand size={34} style={{ position: "absolute", left: 120, top: 67 }} /></div>
      <Type text={"让思路，\n有处靠岸。"} t={t} start={5.4} size={112} style={{ position: "absolute", left: 125, top: 310 }} />
      <Caption text="从想法，到下一步。" t={t} start={6.25} style={{ position: "absolute", left: 135, top: 667 }} />
      <div style={{ position: "absolute", bottom: 75, left: 136, width: 83 * ramp(t, 6.5, 7.5), height: 3, background: blue }} />
    </AbsoluteFill>
  );
};

// C — an atmospheric brand reveal, a low-angle device orbit and a calm lockup.
export const OpeningC: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const brandOut = 1 - ramp(t, 2.25, 3.15);
  const devices = ramp(t, 2.6, 3.9) * (1 - ramp(t, 7.1, 8.05));
  const orbit = track(t, [2.5, 5.5, 7.5], [-15, 0, 6], ease);
  const settle = ramp(t, 7.65, 8.8);
  return (
    <AbsoluteFill style={{ background: night, color: paper, fontFamily: font, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 56% 70%, #123C5C 0%, #0A2335 26%, transparent 63%)" }} />
      <div style={{ position: "absolute", left: -180, right: -180, top: 742, height: 1, transform: `scaleX(${ramp(t, 0, 1.8, travel)})`, background: "linear-gradient(90deg, transparent, #7AC7FB 35%, #95E0FF 50%, #7AC7FB 65%, transparent)", opacity: 0.6 }} />
      <svg width="1920" height="1080" style={{ position: "absolute", opacity: 0.25 }}>
        {[0, 1, 2].map(i => <ellipse key={i} cx="960" cy="768" rx={410 + i * 170} ry={80 + i * 34} fill="none" stroke="#54ADEB" strokeWidth="1" style={{ transformOrigin: "960px 768px", transform: `scale(${0.7 + ramp(t, i * 0.17, 2.5) * 0.3})`, opacity: ramp(t, i * 0.2, 1.8) }} />)}
      </svg>
      <div style={{ position: "absolute", left: 820, top: 260, opacity: ramp(t, 0, 1.3) * brandOut, perspective: 1200 }}>
        <Img src={staticFile("brand/anchor-project-logo.png")} style={{ width: 280, height: 280, objectFit: "contain", filter: "drop-shadow(0 15px 45px #238AD655)", transform: `rotateY(${(1 - ramp(t, 0, 2.6)) * -35}deg) translateY(${(1 - ramp(t, 0, 2.5)) * 55}px)` }} />
        <div style={{ textAlign: "center", fontSize: 23, letterSpacing: 13, color: "#78A0BC", marginTop: 24 }}>ANCHOR</div>
      </div>
      <div style={{ position: "absolute", inset: 0, perspective: 2100, opacity: devices, transform: `translateY(${(1 - ramp(t, 2.6, 4.4)) * 300}px) scale(${track(t, [2.6, 5, 7.5], [1.12, 1, 0.96], ease)})`, transformOrigin: "60% 75%" }}>
        <Mac width={1050} style={{ left: 284, top: 339, transform: `rotateY(${orbit - 4}deg) rotateX(4deg) rotate(-3deg)`, boxShadow: "0 30px 100px #00000080" }} />
        <Phone width={298} style={{ left: 1320, top: 247, transform: `rotateY(${orbit + 8}deg) rotate(3deg)`, boxShadow: "0 30px 100px #00000080" }} />
      </div>
      <div style={{ opacity: ramp(t, 3, 3.4) * (1 - ramp(t, 6.7, 7.4)) }}><Type text="把每一步，稳稳接住。" t={t} start={3.05} size={75} color={paper} style={{ position: "absolute", left: 245, top: 126 }} /></div>
      <div style={{ position: "absolute", inset: 0, opacity: settle, transform: `translateY(${(1 - settle) * 70}px)` }}>
        <Img src={staticFile("brand/anchor-project-logo.png")} style={{ position: "absolute", width: 168, height: 168, left: 876, top: 282, objectFit: "contain" }} />
        <Type text="Anchor" t={t} start={7.7} size={124} color={paper} style={{ position: "absolute", top: 468, left: 0, width: "100%", textAlign: "center" }} />
        <Caption text="让思路靠岸。" t={t} start={8.15} color="#ADC5D7" style={{ position: "absolute", top: 674, width: "100%", textAlign: "center", fontSize: 39, letterSpacing: 5 }} />
      </div>
    </AbsoluteFill>
  );
};

const ContextPass: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const move = ramp(t, 0, 1.25, travel);
  const exit = ramp(t, 3.1, 4, travel);
  const carrierWidth = 450 + exit * 830;
  const carrierHeight = 450 * 322 / 523 + exit * (macHeight(1280) - 450 * 322 / 523);
  const x = 1390 - move * 1100;
  const y = 170 - move * 31;
  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 28% 52%, #DAF0F4 0%, transparent 62%)" }} />
      <Trace t={t + 6} />
      <Brand size={34} style={{ position: "absolute", left: 120, top: 67 }} />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - ramp(t, 0, 0.5) }}>
        <Type text={"让思路，\n有处靠岸。"} t={8} start={5.4} size={112} style={{ position: "absolute", left: 125, top: 310 }} />
        <Caption text="从想法，到下一步。" t={8} start={6.25} style={{ position: "absolute", left: 135, top: 667 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "470px 620px", transform: `translateX(${-exit * 180}px) scale(${1 + exit * 0.15})`, opacity: 1 - ramp(t, 3.15, 3.9) }}>
        <Phone width={350} style={{ left: x, top: y, transform: `rotate(${track(t, [0, 0.65, 1.4, 3.4], [0, -5, -2, -2])}deg)` }} />
      </div>
      <div style={{ opacity: 1 - ramp(t, 3.1, 3.6), position: "absolute", left: 850, top: 276 }}>
        <Type text={"把每项工作，\n稳稳接住。"} t={t} start={0.6} size={91} />
        <Caption text={"目标、进展、待办，一眼找回。"} t={t} start={1.5} style={{ marginTop: 45 }} />
        <div style={{ display: "flex", gap: 50, marginTop: 70, opacity: ramp(t, 2, 2.7), color: "#52728A", fontSize: 21, letterSpacing: 4 }}>
          <span>目标</span><span style={{ color: "#99B9CC" }}>—</span><span>进展</span><span style={{ color: "#99B9CC" }}>—</span><span>下一步</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 195 - exit * 95, top: 461 - exit * 241, width: carrierWidth, height: carrierHeight, padding: 7 * exit, borderRadius: 26 - exit * 3, background: "linear-gradient(140deg, #DCE5E9, #556671 25%, #1B2832 75%, #94A8B5)", boxShadow: "0 36px 100px #0B2D4230, 0 4px 8px #00182628", opacity: ramp(t, 1, 1.85), transform: `translateY(${(1 - ramp(t, 1, 1.9)) * 125}px) rotate(${-2 * (1 - exit)}deg)` }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: 26 - exit * 9 }}>
          <Img src={asset("card-0.png")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
          <Img src={asset("mac-first.png")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: ramp(exit, 0.2, 0.94, travel) }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DecisionPass: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  return (
    <AbsoluteFill style={{ background: paper, color: ink, fontFamily: font, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 60%, #D9EAF4 0%, transparent 66%)" }} />
      <Brand size={34} style={{ position: "absolute", left: 120, top: 67 }} />
      <div style={{ position: "absolute", right: 112, top: 80, color: "#7D909E", fontSize: 20, letterSpacing: 4, opacity: ramp(t, 0, 0.6) }}>MAC / WORKFLOW</div>
      <div style={{ position: "absolute", inset: 0, perspective: 2100 }}>
        <Mac width={1280} video style={{ left: 100, top: 220 }} />
      </div>
      <div style={{ position: "absolute", left: 1450, top: 338, width: 370 }}>
        <Type text={"关键判断，\n由你掌舵。"} t={t} start={0.35} size={64} />
        <div style={{ width: 70 * ramp(t, 1, 1.9), height: 3, background: blue, marginTop: 39 }} />
        <Caption text={"看清选项，\n再向前一步。"} t={t} start={1.35} style={{ marginTop: 33, fontSize: 27, whiteSpace: "pre-line" }} />
        <div style={{ marginTop: 88, opacity: ramp(t, 2.35, 3.1) * (1 - ramp(t, 5.0, 5.6)), color: "#547E9A", fontSize: 20, letterSpacing: 3 }}>选择你的方案</div>
        <div style={{ position: "absolute", top: 375, opacity: ramp(t, 5.25, 6.15), color: "#547E9A", fontSize: 20, letterSpacing: 3 }}>回来，继续推进</div>
      </div>
    </AbsoluteFill>
  );
};

const ClosingPass: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const shift = ramp(t, 0, 1.2, travel);
  const vanish = ramp(t, 2.3, 3.3, travel);
  const dark = ramp(t, 2.4, 3.45, travel);
  const lock = ramp(t, 3, 3.95);
  const macWidth = 1280 - shift * 230;
  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 60%, #D9EAF4 0%, transparent 66%)", opacity: 1 - dark }} />
      <AbsoluteFill style={{ background: night, opacity: dark }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #113B5B 0%, transparent 63%)", opacity: dark }} />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - ramp(t, 0, 0.7) }}>
        <Brand size={34} style={{ position: "absolute", left: 120, top: 67 }} />
        <Type text={"关键判断，\n由你掌舵。"} t={8} start={0.35} size={64} style={{ position: "absolute", left: 1450, top: 338 }} />
      </div>
      <div style={{ opacity: 1 - ramp(t, 2.2, 2.7) }}><Type text="下一次打开，接着向前。" t={t} start={0.4} size={72} style={{ position: "absolute", left: 0, top: 116, width: "100%", textAlign: "center" }} /></div>
      <div style={{ position: "absolute", inset: 0, perspective: 2000, transformOrigin: "960px 590px", opacity: 1 - vanish, transform: `scale(${1 - vanish * 0.65}) translateY(${vanish * 140}px)` }}>
        <Mac width={macWidth} source="mac-closing.png" style={{ left: 100 + shift * 130, top: 220 + shift * 76, transform: `rotateY(${shift * -5}deg) rotate(${shift * -2}deg)` }} />
        <Phone width={300} style={{ left: 1530 - shift * 200, top: 1080 - shift * 810, transform: `rotateY(-6deg) rotate(3deg)` }} />
      </div>
      <svg width="1920" height="1080" style={{ position: "absolute", opacity: dark * 0.35 }}>
        <path d="M-100 772 C230 772 540 752 710 600 C855 470 1020 320 1170 421 C1460 616 1540 769 2020 769" fill="none" stroke="#5EBFFF" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ramp(t, 2.8, 4.7, travel)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, opacity: lock, transform: `translateY(${(1 - lock) * 70}px) scale(${1.03 - lock * 0.03})` }}>
        <Img src={staticFile("brand/anchor-project-logo.png")} style={{ position: "absolute", left: 878, top: 268, width: 164, height: 164, objectFit: "contain" }} />
        <Type text="Anchor" t={t} start={3.0} size={124} color={paper} style={{ position: "absolute", left: 0, top: 452, width: "100%", textAlign: "center" }} />
        <Caption text="让思路靠岸。" t={t} start={3.6} color="#ADC5D7" style={{ position: "absolute", left: 0, top: 656, width: "100%", textAlign: "center", fontSize: 39, letterSpacing: 5 }} />
      </div>
    </AbsoluteFill>
  );
};

export const PremiumPromo: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={480}><OpeningB /></Sequence>
    <Sequence from={480} durationInFrames={240}><ContextPass /></Sequence>
    <Sequence from={720} durationInFrames={510}><DecisionPass /></Sequence>
    <Sequence from={1230} durationInFrames={330}><ClosingPass /></Sequence>
  </AbsoluteFill>
);

const ComparisonCard: React.FC<{ letter: string; title: string; detail: string }> = ({ letter, title, detail }) => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  return <AbsoluteFill style={{ background: night, color: paper, fontFamily: font, justifyContent: "center", paddingLeft: 220 }}>
    <div style={{ position: "absolute", right: 165, top: 218, fontSize: 440, lineHeight: 1, fontWeight: 600, color: "#17384D", letterSpacing: -20 }}>{letter}</div>
    <Brand light size={30} style={{ position: "absolute", left: 120, top: 75 }} />
    <Type text={title} t={t} start={0} size={90} color={paper} />
    <Caption text={detail} t={t} start={0.2} color="#ADC5D7" style={{ marginTop: 30 }} />
  </AbsoluteFill>;
};

export const OpeningComparison: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={90}><ComparisonCard letter="A" title="快速落锚" detail="6 秒 · 逐字排版 / 节奏切镜 / 色面转场" /></Sequence>
    <Sequence from={90} durationInFrames={360}><OpeningA /></Sequence>
    <Sequence from={450} durationInFrames={90}><ComparisonCard letter="B" title="连续运镜" detail="8 秒 · UI 特写 / 镜头拉远 / 同画面衔接" /></Sequence>
    <Sequence from={540} durationInFrames={480}><OpeningB /></Sequence>
    <Sequence from={1020} durationInFrames={90}><ComparisonCard letter="C" title="深海靠岸" detail="10 秒 · 标志揭幕 / 立体环绕 / 品牌收束" /></Sequence>
    <Sequence from={1110} durationInFrames={600}><OpeningC /></Sequence>
  </AbsoluteFill>
);
