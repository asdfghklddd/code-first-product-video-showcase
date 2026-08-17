import { Easing, interpolate, useCurrentFrame } from "remotion";
import { anchorTheme } from "../config/anchorTheme";
import { AnchorDashboardMock } from "../components/AnchorDashboardMock";
import { AnchorGlyph } from "../components/AnchorGlyph";
import { DeviceFrame } from "../components/DeviceFrame";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";

type ReturnSceneProps = {
  readonly recordingSrc?: string;
  readonly productName: string;
  readonly tagline: string;
};

export const ReturnScene: React.FC<ReturnSceneProps> = ({
  recordingSrc,
  productName,
  tagline,
}) => {
  const frame = useCurrentFrame();
  const ringScale = interpolate(frame, [20, 95, 132], [0.46, 1.2, 1.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    output: "perceptual-scale",
  });
  const ringOpacity = interpolate(frame, [18, 60, 125], [0, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFrame tone="night" eyebrow="ANCHOR / FIND YOUR WAY BACK">
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 165,
          display: "flex",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        <KineticText align="center" size={86} maxWidth={1200} delay={10}>
          离开时不丢失，回来时能继续。
        </KineticText>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 320,
          display: "flex",
          justifyContent: "center",
          color: "rgba(245,248,247,0.62)",
          fontSize: 24,
          opacity: interpolate(frame, [36, 70], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          zIndex: 3,
        }}
      >
        回来时，你不用重建上下文，直接回到正确的决定。
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 450,
          display: "flex",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: 500,
            height: 500,
            border: `1px solid ${anchorTheme.colors.sky}66`,
            borderRadius: "50%",
            opacity: ringOpacity,
            scale: ringScale,
            boxShadow: `0 0 100px ${anchorTheme.colors.cobalt}44`,
          }}
        />
      </div>

      <DeviceFrame
        kind="mac"
        x={405}
        y={448}
        width={760}
        height={430}
        delay={40}
        rotate={-3}
      >
        <AnchorDashboardMock focus="return" recordingSrc={recordingSrc} />
      </DeviceFrame>
      <DeviceFrame
        kind="iphone"
        x={1120}
        y={430}
        width={325}
        height={520}
        delay={58}
        rotate={7}
      >
        <AnchorDashboardMock
          focus="return"
          recordingSrc={recordingSrc}
          compact
        />
      </DeviceFrame>

      <div
        style={{
          position: "absolute",
          left: 86,
          bottom: 76,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: interpolate(frame, [55, 88], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          zIndex: 7,
        }}
      >
        <AnchorGlyph size={64} color={anchorTheme.colors.sky} delay={56} />
        <div>
          <div
            style={{
              color: anchorTheme.colors.paper,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            {productName}
          </div>
          <div
            style={{
              marginTop: 5,
              color: anchorTheme.colors.sky,
              fontFamily: anchorTheme.fonts.mono,
              fontSize: 13,
              letterSpacing: "0.11em",
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 86,
          bottom: 90,
          color: "rgba(245,248,247,0.38)",
          fontFamily: anchorTheme.fonts.mono,
          fontSize: 13,
          letterSpacing: "0.1em",
        }}
      >
        GO BACK TO WHAT MATTERS
      </div>
    </SceneFrame>
  );
};
