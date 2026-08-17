import { Easing, interpolate, useCurrentFrame } from "remotion";
import { anchorTheme } from "../config/anchorTheme";
import { AnchorDashboardMock } from "../components/AnchorDashboardMock";
import { DeviceFrame } from "../components/DeviceFrame";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";

type DecisionSceneProps = {
  readonly recordingSrc?: string;
};

export const DecisionScene: React.FC<DecisionSceneProps> = ({
  recordingSrc,
}) => {
  const frame = useCurrentFrame();
  const spotlightOpacity = interpolate(
    frame,
    [36, 72, 150, 180],
    [0, 0.9, 0.9, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <SceneFrame tone="paper" eyebrow="ANCHOR / HUMAN DECISION">
      <div
        style={{
          position: "absolute",
          left: 144,
          top: 218,
          width: 680,
          zIndex: 3,
        }}
      >
        <div
          style={{
            color: anchorTheme.colors.coral,
            fontFamily: anchorTheme.fonts.mono,
            fontSize: 16,
            letterSpacing: "0.12em",
          }}
        >
          A QUIET SIGNAL IN THE NOISE
        </div>
        <div style={{ marginTop: 26 }}>
          <KineticText color={anchorTheme.colors.ink} size={84} delay={8}>
            只把真正重要的决定，交给你。
          </KineticText>
        </div>
        <div
          style={{
            width: 500,
            marginTop: 32,
            color: anchorTheme.colors.inkMuted,
            fontSize: 25,
            lineHeight: 1.45,
            opacity: interpolate(frame, [42, 76], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          不是更多提醒，而是更少、更清楚的入口。
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 50,
            color: anchorTheme.colors.ink,
            fontSize: 17,
            fontWeight: 700,
            opacity: interpolate(frame, [65, 95], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 99,
              backgroundColor: anchorTheme.colors.decision,
              boxShadow: `0 0 0 8px ${anchorTheme.colors.decision}25`,
            }}
          />
          需要你判断的，只有一件事。
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 970,
          top: 95,
          width: 780,
          height: 920,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${anchorTheme.colors.decision}24 0%, transparent 64%)`,
          opacity: spotlightOpacity,
          pointerEvents: "none",
        }}
      />

      <DeviceFrame
        kind="iphone"
        x={970}
        y={168}
        width={610}
        height={855}
        delay={22}
        rotate={-3}
      >
        <AnchorDashboardMock
          focus="decision"
          recordingSrc={recordingSrc}
          compact
        />
      </DeviceFrame>
      <div
        style={{
          position: "absolute",
          left: 1510,
          top: 470,
          width: 260,
          padding: "18px 20px",
          border: `1px solid ${anchorTheme.colors.decision}88`,
          borderRadius: 20,
          backgroundColor: "rgba(255,251,235,0.94)",
          boxShadow: `0 24px 50px ${anchorTheme.colors.decision}26`,
          color: anchorTheme.colors.ink,
          opacity: interpolate(frame, [72, 100], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: `${interpolate(frame, [72, 106], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px 0px`,
          zIndex: 5,
        }}
      >
        <div
          style={{
            color: "#9A7415",
            fontFamily: anchorTheme.fonts.mono,
            fontSize: 11,
            letterSpacing: "0.09em",
          }}
        >
          NEEDS DECISION
        </div>
        <div
          style={{
            marginTop: 9,
            fontSize: 18,
            lineHeight: 1.25,
            fontWeight: 700,
          }}
        >
          Choose the final direction
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 15 }}>
          <div
            style={{
              flex: 1,
              height: 7,
              borderRadius: 99,
              backgroundColor: anchorTheme.colors.decision,
            }}
          />
          <div
            style={{
              flex: 1,
              height: 7,
              borderRadius: 99,
              backgroundColor: `${anchorTheme.colors.ink}15`,
            }}
          />
        </div>
      </div>
    </SceneFrame>
  );
};
