import { Easing, interpolate, useCurrentFrame } from "remotion";
import { anchorTheme } from "../config/anchorTheme";
import { AnchorDashboardMock } from "../components/AnchorDashboardMock";
import { AnchorGlyph } from "../components/AnchorGlyph";
import { DeviceFrame } from "../components/DeviceFrame";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";

type AnchorSceneProps = {
  readonly recordingSrc?: string;
};

export const AnchorScene: React.FC<AnchorSceneProps> = ({ recordingSrc }) => {
  const frame = useCurrentFrame();
  const lineProgress = interpolate(frame, [24, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <SceneFrame tone="ocean" eyebrow="ANCHOR / HOLD THE CONTEXT">
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 210,
          width: 680,
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: anchorTheme.colors.seafoam,
            fontFamily: anchorTheme.fonts.mono,
            fontSize: 16,
            letterSpacing: "0.12em",
            opacity: interpolate(frame, [0, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span
            style={{
              width: 42,
              height: 1,
              backgroundColor: anchorTheme.colors.seafoam,
            }}
          />
          A BETTER RETURN PATH
        </div>
        <div style={{ marginTop: 28 }}>
          <KineticText size={96} delay={10}>
            把上下文，
            <br />
            稳稳接住。
          </KineticText>
        </div>
        <div
          style={{
            marginTop: 34,
            width: 480,
            color: "rgba(245,248,247,0.7)",
            fontSize: 25,
            lineHeight: 1.45,
            opacity: interpolate(frame, [42, 72], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Anchor 安可，把目标、进程和人类判断，固定在一起。
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 48,
          }}
        >
          <AnchorGlyph size={72} color={anchorTheme.colors.sky} delay={32} />
          <div
            style={{
              color: anchorTheme.colors.sky,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            One place to come back to.
          </div>
        </div>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 720 480"
        style={{
          position: "absolute",
          left: 640,
          top: 310,
          width: 720,
          height: 480,
          overflow: "visible",
          opacity: 0.74,
        }}
      >
        <path
          d="M18 420 C180 80 320 80 680 20"
          fill="none"
          stroke={`${anchorTheme.colors.sky}33`}
          strokeWidth="2"
        />
        <path
          d="M18 420 C180 80 320 80 680 20"
          fill="none"
          stroke={anchorTheme.colors.sky}
          strokeWidth="4"
          strokeDasharray="4 18"
          strokeDashoffset={-lineProgress * 380}
        />
        <circle
          cx={18 + lineProgress * 662}
          cy={420 - lineProgress * 400}
          r="10"
          fill={anchorTheme.colors.seafoam}
        />
      </svg>

      <DeviceFrame
        kind="iphone"
        x={1035}
        y={192}
        width={560}
        height={820}
        delay={20}
        rotate={4}
      >
        <AnchorDashboardMock recordingSrc={recordingSrc} compact />
      </DeviceFrame>
      <div
        style={{
          position: "absolute",
          right: 70,
          bottom: 84,
          color: "rgba(245,248,247,0.46)",
          fontFamily: anchorTheme.fonts.mono,
          fontSize: 14,
          letterSpacing: "0.1em",
        }}
      >
        GOAL / STATE / DECISION / RETURN
      </div>
    </SceneFrame>
  );
};
