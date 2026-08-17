import { Easing, interpolate, useCurrentFrame } from "remotion";
import { anchorTheme } from "../config/anchorTheme";

type KineticTextProps = {
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly size?: number;
  readonly color?: string;
  readonly weight?: number;
  readonly align?: "left" | "center" | "right";
  readonly maxWidth?: number;
  readonly tracking?: string;
};

export const KineticText: React.FC<KineticTextProps> = ({
  children,
  delay = 0,
  size = 64,
  color = anchorTheme.colors.paper,
  weight = 700,
  align = "left",
  maxWidth = 980,
  tracking = "-0.045em",
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  return (
    <div
      style={{
        maxWidth,
        color,
        fontFamily: anchorTheme.fonts.display,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: tracking,
        lineHeight: 1.04,
        textAlign: align,
        opacity: interpolate(localFrame, [0, 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: `0px ${interpolate(localFrame, [0, 22], [38, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px`,
        scale: interpolate(localFrame, [0, 22], [0.96, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          output: "perceptual-scale",
        }),
      }}
    >
      {children}
    </div>
  );
};
