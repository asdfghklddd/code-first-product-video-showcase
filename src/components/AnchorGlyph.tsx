import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

type AnchorGlyphProps = {
  readonly size?: number;
  readonly color?: string;
  readonly glow?: boolean;
  readonly delay?: number;
};

export const AnchorGlyph: React.FC<AnchorGlyphProps> = ({
  size = 180,
  glow = true,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  return (
    <Img
      src={staticFile("brand/anchor-project-logo.png")}
      alt="Anchor 安可 logo"
      width={size}
      height={size}
      style={{
        display: "block",
        margin: "0 auto",
        objectFit: "contain",
        opacity: interpolate(localFrame, [0, 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        scale: interpolate(localFrame, [0, 24], [0.72, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          output: "perceptual-scale",
        }),
        filter: glow ? "drop-shadow(0 0 22px rgba(22,136,232,0.42))" : undefined,
      }}
    />
  );
};
