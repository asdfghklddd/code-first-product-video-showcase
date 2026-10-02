/**
 * 中文说明：Blender 片头的 Remotion 合成层：文字、图形与真实三维视频分工；A/B/C/D 是排版方案，原始几何由 blender-hero.py 生成。
 * 完整命令与适用场景：docs/动画目录.md
 */
import type { CSSProperties } from "react";
import { createContext, useContext } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { PageCam, type CamKey } from "./components/PageCam";
import { Mac, Phone, Type } from "./PremiumMotion";

// The graphic planes are brand advertising. Every product surface is a native capture.
// Hero videos contain real Blender geometry, lighting, depth of field and camera motion.
const palette = { ink: "#071723", paper: "#F5F8F7", fog: "#E9F0EF", blue: "#1688E8", sky: "#62C7FF", night: "#06131D", ocean: "#0B2A3E" };
const font = '"Arial", "PingFang SC", "Hiragino Sans GB", sans-serif';
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const smooth = Easing.bezier(.22, 1, .36, 1);
const travel = Easing.bezier(.65, 0, .35, 1);
const originalEase = Easing.bezier(.33, 0, .15, 1);
const ramp = (t: number, a: number, b: number, easing = smooth) => interpolate(t, [a, b], [0, 1], { ...clamp, easing });
const track = (t: number, times: number[], values: number[], easing = travel) => interpolate(t, times, values, { ...clamp, easing });
const logo = staticFile("brand/anchor-project-logo.png");
const PreviewContext = createContext(false);
const useHero = (variant: string) => {
  const preview = useContext(PreviewContext);
  return staticFile(`local-assets/2026-10-01/hero/${preview ? "draft" : "hero"}-${variant}.mp4`);
};
const real = (name: string) => staticFile(`local-assets/2026-09-30/real/${name}`);

const Label: React.FC<{ children: React.ReactNode; style?: CSSProperties; light?: boolean }> = ({ children, style, light }) => <div style={{ fontFamily: font, fontSize: 22, letterSpacing: 3, fontWeight: 500, color: light ? "#A3C5D9" : "#6D8090", ...style }}>{children}</div>;
const Wordmark: React.FC<{ size?: number; light?: boolean; style?: CSSProperties }> = ({ size = 36, light, style }) => <div style={{ display: "flex", alignItems: "center", gap: size * .35, fontFamily: font, fontSize: size, fontWeight: 600, letterSpacing: -size * .035, color: light ? palette.paper : palette.ink, ...style }}><Img src={logo} style={{ width: size * 1.22, height: size * 1.22, objectFit: "contain" }} /><span>Anchor 安可</span></div>;

const EdgeLight: React.FC<{ frame: number; width: number; height: number; radius?: number; start?: number; style?: CSSProperties }> = ({ frame, width, height, radius = 28, start = 174, style }) => {
  const draw = ramp(frame, start, start + 28, originalEase);
  const fade = ramp(frame, start, start + 16) * (1 - ramp(frame, start + 38, start + 74));
  return <svg width={width + 12} height={height + 12} style={{ position: "absolute", left: -6, top: -6, overflow: "visible", opacity: fade, pointerEvents: "none", ...style }}>
    <rect x="6" y="6" width={width} height={height} rx={radius} fill="none" stroke={palette.sky} strokeWidth="4" pathLength="1" strokeDasharray=".14 1" strokeDashoffset={-draw} style={{ filter: "drop-shadow(0 0 10px #62C7FF)" }} />
    <rect x="6" y="6" width={width} height={height} rx={radius} fill="none" stroke="white" strokeWidth="1.5" pathLength="1" strokeDasharray=".045 1" strokeDashoffset={-draw - .03} />
  </svg>;
};

// Original GitHub hero shot: exact PageCam perspective and lift / reseat / edge-beam curves,
// retimed from 30 fps to 60 fps, with advertising planes replacing the original UI cards.
const BrandDeck: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame / 2;
  const rise = ramp(f, 66, 77, Easing.bezier(.2, 1.25, .3, 1));
  const reseat = ramp(f, 116, 133, Easing.bezier(.4, 0, .3, 1.05));
  const lift = rise * (1 - reseat);
  const z = 126 * lift + Math.sin((f - 77) / 38 * Math.PI * 2) * 4 * lift;
  const press = track(f, [128, 132, 134], [1, .997, 1]);
  const keys: CamKey[] = [
    { frame: 0, cx: 960, cy: 665, zoom: .84 },
    { frame: 96, cx: 960, cy: 665, zoom: .84 },
    { frame: 132, cx: 1230, cy: 665, zoom: 1.88, rotX: 7, rotY: 30, rotZ: 2, persp: 1200 },
    { frame: 270, cx: 1230, cy: 665, zoom: 1.88, rotX: 7, rotY: 30, rotZ: 2, persp: 1200 },
    { frame: 300, cx: 960, cy: 680, zoom: .95, rotY: -8, persp: 1200 },
  ];
  const plane = (x: number, y: number, word: string, note: string, color: string, delay: number) => <div key={word} style={{ position: "absolute", left: x, top: y, width: 540, height: 300, borderRadius: 28, background: color, boxShadow: "0 20px 45px #07172313", color: palette.ink, padding: 40, opacity: ramp(frame, delay, delay + 30), transform: `translateY(${(1 - ramp(frame, delay, delay + 45)) * 150}px) translateZ(4px)` }}><div style={{ fontSize: 94, fontWeight: 600, letterSpacing: -5 }}>{word}</div><div style={{ fontSize: 27, marginTop: 24, color: "#41627A" }}>{note}</div></div>;
  return <PageCam pageH={1320} keys={keys} backgroundColor={palette.fog}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 55% 50%, #C9E9F6, transparent 60%)" }} />
    <div style={{ position: "absolute", left: 392, top: 145 }}><div style={{ fontSize: 164, lineHeight: 1.12, fontWeight: 600, letterSpacing: -7 }}>Anchor 安可</div><div style={{ fontSize: 54, lineHeight: 1.25, marginTop: 18, letterSpacing: 2 }}>与 AI 从容共事</div></div>
    <Label style={{ position: "absolute", left: 392, top: 446, fontSize: 25 }}>AI 工作节奏管理应用</Label>
    {plane(392, 515, "全局", "工作线索，一眼汇集", "#CDEEFF", 8)}
    {plane(392, 871, "专注", "安排注意力，掌握节奏", "#DDF2EA", 20)}
    {plane(988, 871, "接续", "随时回来，从容向前", "#E3E8F7", 30)}
    <div style={{ position: "absolute", left: 988, top: 515, width: 540, height: 300, transformStyle: "preserve-3d", transform: `translateZ(${z}px) scale(${press})` }}>
      {[5, 4, 3, 2, 1].map(depth => <div key={depth} style={{ position: "absolute", inset: 0, borderRadius: 28, background: depth === 5 ? palette.blue : "#CDE9F8", transform: `translateZ(${-depth * 2.7}px)`, boxShadow: depth === 5 ? `0 ${18 + lift * 26}px ${40 + lift * 35}px #09324C30` : undefined }} />)}
      <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: "linear-gradient(130deg, white, #EDF7FB)", border: "1px solid #FFFFFF", display: "flex", alignItems: "center", padding: 28, gap: 24 }}>
        <Img src={logo} style={{ width: 200, height: 200, flexShrink: 0, objectFit: "contain" }} />
        <div><div style={{ fontSize: 49, lineHeight: 1.1, fontWeight: 600, letterSpacing: -1 }}>Anchor</div><div style={{ fontSize: 40, lineHeight: 1.1, marginTop: 6 }}>安可</div><div style={{ fontSize: 22, lineHeight: 1.4, marginTop: 24, color: "#57748A", whiteSpace: "nowrap" }}>与 AI 从容共事</div></div>
      </div>
      <EdgeLight frame={frame} width={540} height={300} />
    </div>
  </PageCam>;
};

const HeroStudio: React.FC<{ variant: string; titleAt: number; dark?: boolean; copy?: string }> = ({ variant, titleAt, dark, copy = "与 AI\n从容共事" }) => {
  const t = useCurrentFrame() / 60;
  const frame = useCurrentFrame();
  const source = useHero(variant);
  const color = dark ? palette.paper : palette.ink;
  return <AbsoluteFill style={{ background: dark ? palette.night : palette.fog }}>
    <OffthreadVideo src={source} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <Wordmark size={32} light={dark} style={{ position: "absolute", left: 110, top: 60, opacity: ramp(t, .25, 1.1) }} />
    <div style={{ position: "absolute", top: 83, right: 110, width: 65 * ramp(t, .5, 1.5), height: 2, background: dark ? palette.sky : palette.blue, opacity: .75 }} />
    <div style={{ position: "absolute", left: 119, top: 330, width: 760 }}>
      <Label light={dark} style={{ opacity: ramp(t, titleAt, titleAt + .7), marginBottom: 29 }}>AI 工作节奏管理应用</Label>
      <Type text={copy} t={t} start={titleAt + .16} size={113} color={color} stagger={.05} />
      <div style={{ height: 3, width: 86 * ramp(t, titleAt + 1.15, titleAt + 2.2), background: palette.blue, marginTop: 40 }} />
      <div style={{ marginTop: 28, fontSize: 30, lineHeight: 1.7, color: dark ? "#ADC5D7" : "#6D8090", opacity: ramp(t, titleAt + 1.5, titleAt + 2.3) }}>掌握全局 · 安排注意力 · 从容接续</div>
    </div>
    <div style={{ position: "absolute", left: 120, bottom: 72, display: "flex", gap: 35, fontSize: 21, letterSpacing: 3, color: dark ? "#8AAFC8" : "#6D8090", opacity: ramp(t, titleAt + 2.1, titleAt + 2.9) }}><span>Mac</span><span style={{ opacity: .4 }}>↔</span><span>iPhone</span></div>
    {dark && <AbsoluteFill style={{ pointerEvents: "none", boxShadow: "inset 0 0 150px #00000035", opacity: ramp(frame, 0, 60) }} />}
  </AbsoluteFill>;
};

// A continuous 2.5D camera crosses typographic planes, then match-cuts into a real 3D macro.
const TypeTunnel: React.FC = () => {
  const t = useCurrentFrame() / 60;
  const zoom = track(t, [0, .5, 2.05, 3.4, 4.7, 6], [3.8, 3.55, 1.14, .82, .86, 1.16]);
  const cx = track(t, [0, 1.5, 2.2, 3.4, 4.7, 6], [480, 480, 850, 930, 920, 1230]);
  const cy = track(t, [0, 1.5, 2.2, 3.4, 4.7, 6], [460, 460, 470, 570, 570, 535]);
  const rot = track(t, [0, 2.1, 3.5, 5, 6], [23, 11, -12, -8, 23]);
  return <AbsoluteFill style={{ background: palette.paper, perspective: 1700, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 60%, #D5ECF8, transparent 65%)" }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformStyle: "preserve-3d", transformOrigin: "0 0", transform: `translate(960px,540px) scale(${zoom}) rotateY(${rot}deg) rotateZ(${track(t, [0, 2, 3.8, 6], [-5, 0, 2, -3])}deg) translate(${-cx}px,${-cy}px)` }}>
      <div style={{ position: "absolute", left: 120, top: 190, transform: "translateZ(-100px)", fontSize: 230, fontWeight: 400, WebkitTextStroke: "1.5px #A5C9DF", color: "transparent", letterSpacing: -10 }}>从容共事</div>
      <div style={{ position: "absolute", left: 122, top: 395, fontSize: 165, fontWeight: 600, letterSpacing: -7, transform: "translateZ(0px)" }}>AI 不断向前。</div>
      <div style={{ position: "absolute", left: 125, top: 628, fontSize: 117, fontWeight: 600, letterSpacing: -4, color: palette.blue, transform: "translateZ(60px)", opacity: ramp(t, 1.35, 2.45) }}>节奏，由你掌握。</div>
      <div style={{ position: "absolute", left: 1190, top: 230, width: 450, height: 510, borderRadius: 64, background: "linear-gradient(130deg, #E7F5FC, #D5E9F4)", boxShadow: "20px 36px 55px #07172316", transform: `translateZ(${100 * ramp(t, 1.6, 3)}px) rotateY(-13deg)`, opacity: ramp(t, 1.3, 2.6) }}><Img src={logo} style={{ width: 340, height: 340, objectFit: "contain", position: "absolute", left: 55, top: 73 }} /><EdgeLight frame={useCurrentFrame()} width={450} height={510} radius={64} start={174} /></div>
      <Wordmark size={32} style={{ position: "absolute", left: 125, top: 895, transform: "translateZ(8px)", opacity: ramp(t, 2.0, 3.4) }} />
      <Label style={{ position: "absolute", left: 126, top: 980, opacity: ramp(t, 2.3, 3.5) }}>与 AI 从容共事</Label>
      <svg width="1920" height="1080" style={{ position: "absolute", transform: "translateZ(-80px)", opacity: .45 }}><path d="M-150 820 C400 900 650 850 810 550 C950 220 1500 130 2010 320" fill="none" stroke={palette.blue} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ramp(t, .2, 4)} /></svg>
    </div>
  </AbsoluteFill>;
};

// Reference choreography: huge thin text + outline text, diagonal logo fragments converging,
// baseline wordmark assembly, then a three-column product hero. Anchor palette throughout.
const ReferenceIntro: React.FC = () => {
  const t = useCurrentFrame() / 60;
  const source = useHero("A");
  const titleOut = ramp(t, 3, 3.65, travel);
  const converge = ramp(t, 5.15, 6.35, travel);
  const white = ramp(t, 6.25, 6.95, travel);
  const brandOut = ramp(t, 8.65, 9.15);
  const floating = Math.sin(t * 1.7) * 12;
  const letters = Array.from("Anchor 安可");
  return <AbsoluteFill style={{ background: palette.blue, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: palette.sky, opacity: 1 - ramp(t, 2.8, 3.5) }} />
    <div style={{ position: "absolute", left: 82, top: 239, width: 1770, transform: `translateX(${(1 - ramp(t, 0, 1.1)) * 230 - titleOut * 220}px) scale(${track(t, [0, 2.6, 3.5], [1.18, 1, .94])})`, transformOrigin: "0 50%", opacity: 1 - titleOut }}>
      <div style={{ color: "white", fontSize: 240, lineHeight: 1.18, fontWeight: 300, letterSpacing: -11, whiteSpace: "nowrap" }}>遇见你的 AI 同伴</div>
      <div style={{ fontSize: 225, lineHeight: 1.2, fontWeight: 300, color: "transparent", WebkitTextStroke: "2px white", letterSpacing: -9, whiteSpace: "nowrap", transform: `translateX(${(1 - ramp(t, .75, 1.7)) * -430}px)`, opacity: ramp(t, .65, 1.45) }}>AI 协作的新节奏</div>
    </div>
    <Wordmark light size={31} style={{ position: "absolute", left: 92, top: 61, opacity: 1 - white }} />
    <Label light style={{ position: "absolute", right: 93, bottom: 61, color: "white", opacity: 1 - white }}>AI 工作节奏管理应用</Label>
    <div style={{ position: "absolute", left: 0, top: 421, width: "100%", textAlign: "center", fontSize: 141, color: "white", fontWeight: 650, letterSpacing: -6, opacity: ramp(t, 3.2, 3.75) * (1 - ramp(t, 5.25, 5.9)), transform: `translateY(${(1 - ramp(t, 3.2, 3.95)) * 120}px)` }}>与 AI 从容共事</div>
    {[0, 1].map(i => {
      const x = track(converge, [0, 1], [i === 0 ? 232 : 1310, 780], smooth);
      const y = track(converge, [0, 1], [i === 0 ? 180 : 695, 329], smooth);
      return <Img key={i} src={logo} style={{ position: "absolute", left: x, top: y + floating * (1 - converge), width: 360, height: 360, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: ramp(t, 3.25, 4) * (1 - white), transform: `rotate(${(i === 0 ? -35 : 145) * (1 - converge)}deg) scale(${.76 + converge * .24})` }} />;
    })}
    <AbsoluteFill style={{ background: palette.paper, clipPath: `circle(${white * 150}% at 50% 50%)` }} />
    <div style={{ position: "absolute", inset: 0, opacity: white * (1 - brandOut) }}>
      <Img src={logo} style={{ position: "absolute", width: 220, height: 220, left: 325, top: 387, objectFit: "contain", transform: `scale(${1.15 - ramp(t, 6.35, 7.1) * .15})` }} />
      <div style={{ position: "absolute", left: 585, top: 415, color: palette.ink, fontSize: 132, fontWeight: 600, letterSpacing: -6, display: "flex", whiteSpace: "pre" }}>{letters.map((char, index) => <span key={index} style={{ opacity: ramp(t, 6.7 + index * .055, 7.12 + index * .055), transform: `translateY(${(1 - ramp(t, 6.7 + index * .055, 7.25 + index * .055)) * (index % 2 ? -90 : 90)}px)` }}>{char}</span>)}</div>
      <div style={{ position: "absolute", left: 598, top: 603, color: "#6D8090", fontSize: 37, letterSpacing: 4 }}>{Array.from("与 AI 从容共事").map((char, index) => <span key={index} style={{ opacity: t >= 7.65 + index * .055 ? 1 : 0 }}>{char}</span>)}</div>
    </div>
    <Sequence from={522} durationInFrames={378}>
      <AbsoluteFill style={{ opacity: ramp(t, 8.7, 9.3), background: palette.fog }}>
        <OffthreadVideo src={source} startFrom={180} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <Wordmark size={33} style={{ position: "absolute", left: 93, top: 65 }} />
        <div style={{ position: "absolute", left: 110, top: 300, width: 795 }}>
          <div style={{ fontSize: 127, color: "transparent", WebkitTextStroke: "1.5px #A7CADD", letterSpacing: -6, marginBottom: 9 }}>从容共事</div>
          <Type text={"工作很快。\n你可以从容。"} t={t} start={9.05} size={100} />
          <div style={{ marginTop: 36, fontSize: 29, color: "#6D8090", opacity: ramp(t, 10.2, 10.85) }}>Anchor 安可 · AI 工作节奏管理应用</div>
          <div style={{ width: 90 * ramp(t, 10.4, 11.3), height: 3, background: palette.blue, marginTop: 36 }} />
        </div>
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>;
};

// Native captures appear only at frame 900 (15 seconds) across all four variants.
const ProductHero: React.FC<{ variant: string }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const preview = useContext(PreviewContext);
  const t = frame / 60;
  const dark = variant === "C";
  const p = ramp(t, 0, 1.2, Easing.bezier(.2, 1.15, .3, 1));
  const cam = track(t, [0, 1.4, 3.5, 5], [1.08, 1, 1.014, 1.024], smooth);
  const color = dark ? palette.paper : palette.ink;
  const reference = variant === "D";
  return <AbsoluteFill style={{ background: dark ? palette.night : palette.paper, overflow: "hidden", perspective: 1800 }}>
    <AbsoluteFill style={{ background: dark ? "radial-gradient(ellipse at 60% 65%, #143B51, transparent 65%)" : "radial-gradient(ellipse at 70% 60%, #D5EBF5, transparent 65%)" }} />
    <Wordmark size={34} light={dark} style={{ position: "absolute", left: 100, top: 56 }} />
    <Label light={dark} style={{ position: "absolute", right: 100, top: 77 }}>Mac 与 iPhone · 从容接续</Label>
    {reference ? <>
      <div style={{ position: "absolute", left: -20, top: 193, color: "transparent", WebkitTextStroke: "1.5px #B7D4E5", fontSize: 195, fontWeight: 400, letterSpacing: -8, opacity: .55, whiteSpace: "nowrap" }}>Anchor 安可</div>
      <div style={{ position: "absolute", left: 93, top: 346, width: 448, height: 425, overflow: "hidden", borderRadius: "48% 48% 38% 38%", background: palette.fog, transform: `translateY(${(1 - p) * 260}px) rotate(${-6 * (1 - p)}deg)`, boxShadow: "0 28px 60px #0B2A3E20" }}>
        <Img src={staticFile(`local-assets/2026-10-01/hero/${preview ? "draft" : "hero"}-A-final.png`)} style={{ position: "absolute", width: 900, height: 506, left: -420, top: -37, objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 109, top: 805, opacity: ramp(t, .7, 1.3), color, fontSize: 35, letterSpacing: 1, lineHeight: 1.5 }}>与 AI<br />从容共事</div>
      <Phone width={300} style={{ left: 608, top: 290, transform: `translateY(${(1 - p) * 430}px) rotateY(${-12 + p * 9}deg) rotate(${-5 * (1 - p)}deg)`, boxShadow: "0 28px 85px #0B2A3E35" }} />
      <div style={{ position: "absolute", left: 994, top: 310, width: 824, height: 590, overflow: "hidden", borderRadius: 75, background: "#D7ECF6", boxShadow: "0 30px 70px #0B2A3E1F", transform: `translateX(${(1 - p) * 650}px) rotateY(${-8 * (1 - p)}deg)` }}>
        <OffthreadVideo src={real("mac-workflow.mp4")} muted style={{ position: "absolute", width: "100%", height: 526, left: 0, top: 84, objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "21px 37px", fontSize: 38, fontWeight: 600, color: palette.ink, background: "linear-gradient(180deg,#F5F8F7 55%,#F5F8F700)", zIndex: 2 }}>掌握全局，从容接续。</div>
        <EdgeLight frame={frame} width={824} height={590} radius={75} start={46} />
      </div>
    </> : <>
      <Type text="与 AI 从容共事" t={t} start={.1} size={66} color={color} style={{ position: "absolute", left: 110, top: 163 }} />
      <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 630px", transformStyle: "preserve-3d", transform: `scale(${cam}) rotateY(${track(t, [0, 1.5, 5], [9, -1.5, 1.5])}deg)` }}>
        <Mac width={1150} video style={{ left: 106, top: 260, transform: `translateX(${(1 - p) * -1120}px) translateZ(${32 * p}px) rotateY(${(1 - p) * 17}deg)`, boxShadow: dark ? "0 40px 90px #00000070" : undefined }} />
        <Phone width={315} style={{ left: 1455, top: 236, transform: `translateX(${(1 - p) * 920}px) translateZ(${66 * p}px) rotateY(${-9 + p * 5}deg) rotate(${(1 - p) * 8 + 2}deg)`, boxShadow: dark ? "0 40px 90px #00000070" : undefined }} />
        <div style={{ position: "absolute", left: 106, top: 260, width: 1150, height: 739, pointerEvents: "none", transform: `translateX(${(1 - p) * -1120}px) translateZ(${33 * p}px) rotateY(${(1 - p) * 17}deg)` }}><EdgeLight frame={frame} width={1150} height={739} radius={23} start={57} /></div>
      </div>
    </>}
    <div style={{ position: "absolute", left: 111, bottom: 31, color: dark ? "#92B6CD" : "#6D8090", fontSize: 21, letterSpacing: 2, opacity: ramp(t, 1, 1.8) }}>汇集任务状态、关键变化与工作线索</div>
  </AbsoluteFill>;
};

// Shape-driven scene wipes carry direction / energy across shots instead of dissolving.
const SceneWipes: React.FC<{ variant: string }> = ({ variant }) => {
  const t = useCurrentFrame() / 60;
  const first = variant === "A" ? 5 : variant === "B" ? 6 : -10;
  const make = (center: number, key: string, color: string, vertical: boolean) => {
    const shift = track(t, [center - .38, center, center + .48], [-2600, 0, 2600], travel);
    return <AbsoluteFill key={key} style={{ inset: -250, pointerEvents: "none", background: color, transform: vertical ? `translateX(${shift}px) skewX(-12deg)` : `translateY(${shift * .62}px)`, opacity: t > center - .39 && t < center + .5 ? 1 : 0 }} />;
  };
  return <>{first > 0 && make(first, "hero", palette.blue, true)}{make(15, "product", variant === "C" ? palette.sky : palette.blue, variant !== "D")}</>;
};

export const HeroRebuild: React.FC<{ variant: string; preview?: boolean }> = ({ variant, preview = false }) => <PreviewContext.Provider value={preview}><AbsoluteFill style={{ fontFamily: font, color: palette.ink, background: palette.paper, overflow: "hidden" }}>
  {variant === "A" && <><Sequence durationInFrames={300}><BrandDeck /></Sequence><Sequence from={300} durationInFrames={600}><HeroStudio variant="A" titleAt={1.9} /></Sequence></>}
  {variant === "B" && <><Sequence durationInFrames={360}><TypeTunnel /></Sequence><Sequence from={360} durationInFrames={540}><HeroStudio variant="B" titleAt={2.2} copy={"掌握全局。\n从容接续。"} /></Sequence></>}
  {variant === "C" && <Sequence durationInFrames={900}><HeroStudio variant="C" titleAt={3.45} dark /></Sequence>}
  {variant === "D" && <Sequence durationInFrames={900}><ReferenceIntro /></Sequence>}
  <Sequence from={900} durationInFrames={300}><ProductHero variant={variant} /></Sequence>
  <SceneWipes variant={variant} />
</AbsoluteFill></PreviewContext.Provider>;
