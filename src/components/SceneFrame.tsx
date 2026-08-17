import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { anchorTheme } from "../config/anchorTheme";

type SceneFrameProps = {
  readonly children: React.ReactNode;
  readonly tone?: "night" | "paper" | "ocean";
  readonly eyebrow?: string;
};

const backgroundByTone = {
  night: {
    backgroundColor: anchorTheme.colors.night,
    color: anchorTheme.colors.paper,
  },
  paper: {
    backgroundColor: anchorTheme.colors.paper,
    color: anchorTheme.colors.ink,
  },
  ocean: {
    backgroundColor: anchorTheme.colors.ocean,
    color: anchorTheme.colors.paper,
  },
} as const;

export const SceneFrame: React.FC<SceneFrameProps> = ({
  children,
  tone = "night",
  eyebrow = "ANCHOR / 安可",
}) => {
  const frame = useCurrentFrame();
  const background = backgroundByTone[tone];
  const gridColor =
    tone === "paper" ? "rgba(7, 23, 35, 0.07)" : "rgba(170, 225, 255, 0.08)";
  const vignette =
    tone === "paper" ? "rgba(245, 248, 247, 0.16)" : "rgba(0, 0, 0, 0.34)";

  return (
    <AbsoluteFill
      style={{
        ...background,
        overflow: "hidden",
        fontFamily: anchorTheme.fonts.body,
      }}
    >
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [0, 45], [0.52, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          maskImage: "linear-gradient(to bottom, black, transparent 82%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 35%, transparent 0%, ${vignette} 100%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 52,
          left: 86,
          right: 86,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color:
            tone === "paper"
              ? anchorTheme.colors.inkMuted
              : "rgba(245,248,247,0.62)",
          fontFamily: anchorTheme.fonts.mono,
          fontSize: 16,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          zIndex: 20,
        }}
      >
        <span>{eyebrow}</span>
        <span>
          {String(Math.round((frame / 30) * 10) / 10).padStart(4, "0")}s
        </span>
      </div>
      {children}
    </AbsoluteFill>
  );
};
