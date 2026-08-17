import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export type CamKey = {
  readonly frame: number;
  readonly cx: number;
  readonly cy: number;
  readonly zoom: number;
  readonly rotX?: number;
  readonly rotY?: number;
  readonly rotZ?: number;
  readonly persp?: number;
};

type PageCamProps = {
  readonly pageH: number;
  readonly keys: readonly CamKey[];
  readonly children: React.ReactNode;
  readonly backgroundColor?: string;
  readonly ease?: (t: number) => number;
  readonly dof?: { readonly focusY: number; readonly strength: number };
};

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Anchor-specific 2.5D camera, adapted from video-shotcraft's PageCam.
 * The page is kept in a 1920px coordinate system while CSS `zoom` performs
 * layout-level magnification, keeping text and SVG overlays sharp during a
 * perspective push-in.
 */
export const PageCam: React.FC<PageCamProps> = ({
  pageH,
  keys,
  children,
  backgroundColor = "#071723",
  ease = Easing.bezier(0.33, 0, 0.15, 1),
  dof,
}) => {
  const frame = useCurrentFrame();
  let a = keys[0];
  let b = keys[keys.length - 1];

  for (let index = 0; index < keys.length - 1; index += 1) {
    if (frame >= keys[index].frame && frame <= keys[index + 1].frame) {
      a = keys[index];
      b = keys[index + 1];
      break;
    }
  }

  const progress =
    a.frame === b.frame
      ? 1
      : interpolate(frame, [a.frame, b.frame], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
  const cx = lerp(a.cx, b.cx, progress);
  const cy = lerp(a.cy, b.cy, progress);
  const zoom = lerp(a.zoom, b.zoom, progress);
  const rotX = lerp(a.rotX ?? 0, b.rotX ?? 0, progress);
  const rotY = lerp(a.rotY ?? 0, b.rotY ?? 0, progress);
  const rotZ = lerp(a.rotZ ?? 0, b.rotZ ?? 0, progress);
  const perspective = lerp(a.persp ?? 1400, b.persp ?? 1400, progress);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: `${perspective * zoom}px`,
          perspectiveOrigin: "960px 540px",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 1920,
            height: pageH,
            zoom,
            transform: `translate(${960 / zoom - cx}px, ${540 / zoom - cy}px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
      {dof ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: Math.max(0, dof.focusY),
            backdropFilter: `blur(${dof.strength}px)`,
            WebkitBackdropFilter: `blur(${dof.strength}px)`,
            maskImage:
              "linear-gradient(to bottom, black 0%, black 45%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 45%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
