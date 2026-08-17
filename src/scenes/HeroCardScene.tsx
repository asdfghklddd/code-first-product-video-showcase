import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { anchorTheme } from "../config/anchorTheme";
import { AnchorGlyph } from "../components/AnchorGlyph";
import { PageCam, CamKey } from "../components/PageCam";
import { SceneFrame } from "../components/SceneFrame";

const PAGE_HEIGHT = 1320;
const CARD_RADIUS = 24;

const HERO_CARD = {
  x: 750,
  y: 500,
  width: 420,
  height: 258,
};

const pageCards = [
  {
    x: 144,
    y: 500,
    width: 420,
    height: 258,
    color: anchorTheme.colors.cobalt,
    title: "Build the product story",
    source: "Codex",
    status: "RUNNING",
    progress: 0.78,
  },
  {
    x: 750,
    y: 500,
    width: 420,
    height: 258,
    color: anchorTheme.colors.violet,
    title: "Review visual system",
    source: "Claude",
    status: "NEEDS DECISION",
    progress: 0.52,
  },
  {
    x: 144,
    y: 824,
    width: 420,
    height: 258,
    color: anchorTheme.colors.coral,
    title: "Prepare launch assets",
    source: "Terminal",
    status: "AWAY / OBSERVED",
    progress: 0.34,
  },
  {
    x: 1248,
    y: 824,
    width: 420,
    height: 258,
    color: anchorTheme.colors.seafoam,
    title: "Prototype capture",
    source: "Demo",
    status: "RUNNING",
    progress: 0.64,
  },
] as const;

const cameraKeys: readonly CamKey[] = [
  {
    frame: 0,
    cx: 960,
    cy: 680,
    zoom: 0.62,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    persp: 1200,
  },
  {
    frame: 48,
    cx: 960,
    cy: 680,
    zoom: 0.62,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    persp: 1200,
  },
  {
    frame: 66,
    cx: HERO_CARD.x + HERO_CARD.width / 2 - 28,
    cy: HERO_CARD.y + HERO_CARD.height / 2,
    zoom: 2.12,
    rotX: 7,
    rotY: 30,
    rotZ: 2,
    persp: 1200,
  },
  {
    frame: 135,
    cx: HERO_CARD.x + HERO_CARD.width / 2 - 28,
    cy: HERO_CARD.y + HERO_CARD.height / 2,
    zoom: 2.12,
    rotX: 7,
    rotY: 30,
    rotZ: 2,
    persp: 1200,
  },
];

const PageHeader: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        left: 144,
        top: 124,
        right: 144,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            display: "grid",
            placeItems: "center",
            borderRadius: 20,
            backgroundColor: anchorTheme.colors.ocean,
            color: anchorTheme.colors.sky,
            fontSize: 32,
            fontWeight: 800,
          }}
        >
          A
        </div>
        <div>
          <div
            style={{
              color: anchorTheme.colors.ink,
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            Current session
          </div>
          <div
            style={{
              marginTop: 6,
              color: anchorTheme.colors.inkMuted,
              fontFamily: anchorTheme.fonts.mono,
              fontSize: 13,
              letterSpacing: "0.08em",
            }}
          >
            PRODUCT LAUNCH / FOCUSED
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "12px 17px",
          borderRadius: 99,
          backgroundColor: `${anchorTheme.colors.seafoam}55`,
          color: "#286D59",
          fontFamily: anchorTheme.fonts.mono,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.08em",
        }}
      >
        ANCHORED
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 144,
        top: 278,
        right: 144,
        height: 1,
        backgroundColor: "rgba(7,23,35,0.12)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 144,
        top: 350,
        color: anchorTheme.colors.ink,
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: "-0.02em",
      }}
    >
      Live processes
    </div>
    <div
      style={{
        position: "absolute",
        right: 144,
        top: 354,
        color: anchorTheme.colors.inkMuted,
        fontFamily: anchorTheme.fonts.mono,
        fontSize: 13,
      }}
    >
      4 ACTIVE · 1 NEEDS YOU
    </div>
  </>
);

type PageCardProps = {
  readonly card: (typeof pageCards)[number];
  readonly hero?: boolean;
  readonly frame: number;
};

const PageCard: React.FC<PageCardProps> = ({ card, hero = false, frame }) => {
  const isDecision = card.status === "NEEDS DECISION";
  const heroRise = hero
    ? interpolate(frame, [66, 77], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.2, 1.25, 0.3, 1),
      })
    : 0;
  const heroReseat = hero
    ? interpolate(frame, [116, 133], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.4, 0, 0.3, 1.05),
      })
    : 0;
  const lift = heroRise * (1 - heroReseat);
  const bob = Math.sin(((frame - 77) / 38) * Math.PI * 2) * 4 * lift;
  const z = 126 * lift + bob;
  const press = hero
    ? interpolate(frame, [128, 132, 134], [1, 0.997, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const shadow = hero
    ? `0 ${10 + 12 * lift}px ${20 + 36 * lift}px rgba(7, 23, 35, ${0.16 + 0.14 * lift}), 0 ${52 * lift}px ${96 * lift}px rgba(22, 136, 232, ${0.14 * lift})`
    : "0 16px 34px rgba(7, 23, 35, 0.08)";
  const beam1 = interpolate(frame, [87, 101], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beam2 = interpolate(frame, [106, 124], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.4, 1),
  });
  const beamOn =
    hero && ((frame >= 86 && frame <= 102) || (frame >= 105 && frame <= 125));
  const beamProgress = frame < 104 ? beam1 : beam2;
  const beamOpacity = frame < 104 ? 1 : 0.62;
  const pageAccent = hero ? anchorTheme.colors.decision : card.color;

  return (
    <div
      style={{
        position: "absolute",
        left: card.x,
        top: card.y,
        width: card.width,
        height: card.height,
        padding: 24,
        borderRadius: CARD_RADIUS,
        overflow: "visible",
        border: `1px solid ${pageAccent}${hero ? "AA" : "40"}`,
        background: hero
          ? "linear-gradient(145deg, #183849, #0A2333)"
          : "rgba(255,255,255,0.82)",
        color: hero ? anchorTheme.colors.paper : anchorTheme.colors.ink,
        boxShadow: shadow,
        transform: `translateZ(${z}px) scale(${press})`,
        transformOrigin: "center center",
        transformStyle: "preserve-3d",
        zIndex: hero ? 8 : 2,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 15 }}>
        <div
          style={{
            width: 42,
            height: 42,
            display: "grid",
            placeItems: "center",
            borderRadius: 14,
            backgroundColor: `${pageAccent}${hero ? "28" : "18"}`,
            color: hero ? pageAccent : card.color,
            fontFamily: anchorTheme.fonts.mono,
            fontSize: 20,
            fontWeight: 800,
          }}
        >
          {isDecision ? "!" : "↗"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 21,
                lineHeight: 1.12,
                fontWeight: 800,
                letterSpacing: "-0.035em",
              }}
            >
              {card.title}
            </div>
            <div
              style={{
                color: hero ? pageAccent : card.color,
                fontFamily: anchorTheme.fonts.mono,
                fontSize: 10,
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}
            >
              {card.status}
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              color: hero
                ? "rgba(245,248,247,0.62)"
                : anchorTheme.colors.inkMuted,
              fontSize: 14,
              lineHeight: 1.35,
            }}
          >
            {hero
              ? "A choice is waiting for a human."
              : `${card.source} is moving the thread forward.`}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 28,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 99,
            backgroundColor: hero
              ? "rgba(245,248,247,0.14)"
              : "rgba(7,23,35,0.08)",
          }}
        >
          <div
            style={{
              width: `${card.progress * 100}%`,
              height: "100%",
              borderRadius: 99,
              backgroundColor: hero ? pageAccent : card.color,
            }}
          />
        </div>
        <span
          style={{
            color: hero
              ? "rgba(245,248,247,0.58)"
              : anchorTheme.colors.inkMuted,
            fontFamily: anchorTheme.fonts.mono,
            fontSize: 11,
          }}
        >
          {Math.round(card.progress * 100)}%
        </span>
      </div>
      {hero && (
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}
        >
          <div
            style={{
              padding: "8px 13px",
              borderRadius: 99,
              backgroundColor: `${anchorTheme.colors.decision}22`,
              color: anchorTheme.colors.decision,
              fontFamily: anchorTheme.fonts.mono,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.06em",
            }}
          >
            OPEN DECISION
          </div>
        </div>
      )}
      {beamOn && hero && lift > 0.35 && (
        <svg
          aria-hidden="true"
          width={card.width + 12}
          height={card.height + 12}
          viewBox={`0 0 ${card.width + 12} ${card.height + 12}`}
          style={{
            position: "absolute",
            left: -6,
            top: -6,
            overflow: "visible",
            pointerEvents: "none",
            opacity: beamOpacity,
            filter: `drop-shadow(0 0 7px ${anchorTheme.colors.decision}) drop-shadow(0 0 20px ${anchorTheme.colors.sky}66)`,
          }}
        >
          <rect
            x={3}
            y={3}
            width={card.width + 6}
            height={card.height + 6}
            rx={CARD_RADIUS}
            fill="none"
            stroke={anchorTheme.colors.decision}
            strokeWidth={frame < 104 ? 5 : 3.5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="0.14 1"
            strokeDashoffset={-beamProgress}
          />
          <rect
            x={3}
            y={3}
            width={card.width + 6}
            height={card.height + 6}
            rx={CARD_RADIUS}
            fill="none"
            stroke="#FFF8E8"
            strokeWidth={frame < 104 ? 2.5 : 1.75}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="0.14 1"
            strokeDashoffset={-beamProgress}
          />
        </svg>
      )}
    </div>
  );
};

const AnchorHeroPage: React.FC<{ readonly frame: number }> = ({ frame }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: PAGE_HEIGHT,
        overflow: "hidden",
        borderRadius: 34,
        background: "linear-gradient(150deg, #F8FBFA 0%, #E8F0EF 100%)",
        color: anchorTheme.colors.ink,
        fontFamily: anchorTheme.fonts.body,
        boxShadow: "0 36px 100px rgba(0,0,0,0.28)",
      }}
    >
      <PageHeader />
      <div
        style={{
          position: "absolute",
          left: 144,
          top: 408,
          right: 144,
          height: 1,
          backgroundColor: "rgba(7,23,35,0.08)",
        }}
      />
      {pageCards.map((card, index) => (
        <PageCard
          key={card.title}
          card={card}
          hero={index === 1}
          frame={frame}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 144,
          top: 1175,
          color: anchorTheme.colors.inkMuted,
          fontFamily: anchorTheme.fonts.mono,
          fontSize: 13,
          letterSpacing: "0.08em",
        }}
      >
        LAST OBSERVED JUST NOW
      </div>
      <div
        style={{
          position: "absolute",
          right: 144,
          top: 1175,
          color: anchorTheme.colors.inkMuted,
          fontFamily: anchorTheme.fonts.mono,
          fontSize: 13,
          letterSpacing: "0.08em",
        }}
      >
        SESSION / 04 PROCESSES / LOCAL
      </div>
    </div>
  );
};

export const HeroCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const spotX = interpolate(
    frame,
    [18, 27, 37, 48, 58, 68],
    [24, 24, 70, 42, 55, 56],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.3, 1),
    },
  );
  const spotY = interpolate(
    frame,
    [18, 27, 37, 48, 58, 68],
    [30, 30, 44, 62, 58, 50],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.3, 1),
    },
  );
  const spotOn = interpolate(frame, [16, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const poolBase = interpolate(frame, [42, 58, 68], [640, 420, 340], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.3, 1),
  });
  const poolPulse = interpolate(frame, [58, 62, 66], [0, 0.06, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vignette = interpolate(frame, [42, 58, 70], [0.12, 0.34, 0.48], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(frame, [130, 135], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFrame tone="ocean" eyebrow="ANCHOR / SPOTLIGHT HERO">
      <AbsoluteFill style={{ opacity: 1 - out }}>
        <PageCam
          pageH={PAGE_HEIGHT}
          keys={cameraKeys}
          dof={{
            focusY: 230,
            strength: interpolate(frame, [58, 75, 92], [0, 8, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <AnchorHeroPage frame={frame} />
        </PageCam>
        <AbsoluteFill
          style={{
            background: `radial-gradient(${poolBase * (1 + poolPulse)}px ${poolBase * 0.78 * (1 + poolPulse)}px at ${spotX}% ${spotY}%, rgba(255,246,216,0.38), rgba(255,246,216,0.09) 46%, rgba(2,18,29,${vignette * spotOn}) 100%)`,
            opacity: spotOn,
            pointerEvents: "none",
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(260px 190px at ${spotX - 6}% ${spotY + 10}%, rgba(255,252,236,0.18), transparent 70%)`,
            opacity: spotOn * 0.8,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 104,
            bottom: 78,
            display: "flex",
            alignItems: "center",
            gap: 15,
            color: "rgba(245,248,247,0.65)",
            fontFamily: anchorTheme.fonts.mono,
            fontSize: 15,
            letterSpacing: "0.08em",
            zIndex: 20,
          }}
        >
          <AnchorGlyph size={44} color={anchorTheme.colors.sky} delay={0} />
          <span>ONE CLEAR DECISION</span>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
