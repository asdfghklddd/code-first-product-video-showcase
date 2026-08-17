import { interpolate, useCurrentFrame, Easing } from "remotion";
import { anchorTheme } from "../config/anchorTheme";

type DeviceFrameProps = {
  readonly children: React.ReactNode;
  readonly kind?: "iphone" | "mac";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly delay?: number;
  readonly rotate?: number;
};

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  kind = "iphone",
  x,
  y,
  width,
  height,
  delay = 0,
  rotate = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);
  const radius = kind === "iphone" ? 48 : 28;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        padding: kind === "iphone" ? 12 : 10,
        borderRadius: radius,
        background: "linear-gradient(145deg, #33434d, #0a151d 54%, #31414a)",
        border: "1px solid rgba(255,255,255,0.24)",
        boxShadow: anchorTheme.shadows.card,
        opacity: interpolate(localFrame, [0, 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: `0px ${interpolate(localFrame, [0, 32], [70, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px`,
        rotate: `${
          rotate +
          interpolate(localFrame, [0, 36], [rotate * -0.5, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })
        }deg`,
        scale: interpolate(localFrame, [0, 32], [0.94, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          output: "perceptual-scale",
        }),
        zIndex: 4,
      }}
    >
      {kind === "iphone" && (
        <div
          style={{
            position: "absolute",
            top: 22,
            left: "50%",
            width: 82,
            height: 18,
            borderRadius: 99,
            backgroundColor: "#050B10",
            translate: "-41px 0px",
            zIndex: 3,
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: radius - 10,
          backgroundColor: anchorTheme.colors.paper,
        }}
      >
        {kind === "mac" && (
          <div
            style={{
              height: 32,
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 14px",
              backgroundColor: "#E4ECEC",
              borderBottom: "1px solid rgba(7,23,35,0.12)",
            }}
          >
            {[
              anchorTheme.colors.coral,
              anchorTheme.colors.decision,
              anchorTheme.colors.seafoam,
            ].map((dot) => (
              <span
                key={dot}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 99,
                  backgroundColor: dot,
                }}
              />
            ))}
            <span
              style={{
                marginLeft: 12,
                color: anchorTheme.colors.inkMuted,
                fontSize: 12,
              }}
            >
              Anchor / Current session
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
