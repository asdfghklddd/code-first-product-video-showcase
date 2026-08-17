import { Img, staticFile } from "remotion";
import { anchorTheme } from "../config/anchorTheme";

type AnchorDashboardMockProps = {
  readonly focus?: "overview" | "decision" | "return";
  readonly recordingSrc?: string;
  readonly compact?: boolean;
};

const processRows = [
  {
    name: "Build the product story",
    source: "Codex",
    color: anchorTheme.colors.cobalt,
    progress: 0.78,
  },
  {
    name: "Review visual system",
    source: "Claude",
    color: anchorTheme.colors.violet,
    progress: 0.52,
  },
  {
    name: "Prepare launch assets",
    source: "Terminal",
    color: anchorTheme.colors.coral,
    progress: 0.34,
  },
];

export const AnchorDashboardMock: React.FC<AnchorDashboardMockProps> = ({
  focus = "overview",
  recordingSrc,
  compact = false,
}) => {
  if (recordingSrc) {
    return (
      <Img
        src={staticFile(recordingSrc)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: compact ? 24 : 30,
        display: "flex",
        flexDirection: "column",
        gap: compact ? 18 : 22,
        background: "linear-gradient(145deg, #F7FAF9, #E8F0EF)",
        color: anchorTheme.colors.ink,
        fontFamily: anchorTheme.fonts.body,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: compact ? 30 : 36,
              height: compact ? 30 : 36,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              backgroundColor: anchorTheme.colors.ocean,
              color: anchorTheme.colors.sky,
              fontSize: compact ? 16 : 20,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: compact ? 16 : 20, fontWeight: 700 }}>
              Current session
            </div>
            <div
              style={{
                marginTop: 3,
                color: anchorTheme.colors.inkMuted,
                fontSize: compact ? 11 : 13,
              }}
            >
              Product launch / Focused
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 99,
            backgroundColor: `${anchorTheme.colors.seafoam}55`,
            color: "#286D59",
            fontSize: compact ? 10 : 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          {focus === "return" ? "WELCOME BACK" : "ANCHORED"}
        </div>
      </div>

      <div
        style={{
          padding: compact ? "15px 17px" : "19px 22px",
          borderRadius: 20,
          backgroundColor: anchorTheme.colors.ocean,
          color: anchorTheme.colors.paper,
          boxShadow: "0 16px 30px rgba(11, 42, 62, 0.16)",
        }}
      >
        <div
          style={{
            color: "rgba(245,248,247,0.58)",
            fontSize: compact ? 10 : 12,
            letterSpacing: "0.1em",
          }}
        >
          ANCHOR NOTE
        </div>
        <div
          style={{
            marginTop: 9,
            fontSize: compact ? 16 : 22,
            fontWeight: 700,
            letterSpacing: "-0.025em",
          }}
        >
          Keep the story clear. Make the next decision visible.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: compact ? 13 : 16, fontWeight: 700 }}>
          Live processes
        </div>
        <div
          style={{
            color: anchorTheme.colors.inkMuted,
            fontSize: compact ? 11 : 13,
          }}
        >
          3 active · 1 needs you
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: compact ? 10 : 13,
        }}
      >
        {processRows.map((row, index) => {
          const isDecision = focus === "decision" && index === 1;

          return (
            <div
              key={row.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: compact ? 10 : 14,
                padding: compact ? "11px 12px" : "14px 16px",
                border: `1px solid ${isDecision ? anchorTheme.colors.decision : "rgba(7,23,35,0.08)"}`,
                borderRadius: 17,
                backgroundColor: isDecision
                  ? `${anchorTheme.colors.decision}20`
                  : "rgba(255,255,255,0.62)",
                boxShadow: isDecision
                  ? `0 0 0 4px ${anchorTheme.colors.decision}15`
                  : undefined,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  backgroundColor: row.color,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: compact ? 12 : 15,
                      fontWeight: 700,
                    }}
                  >
                    {row.name}
                  </span>
                  <span
                    style={{
                      color: row.color,
                      fontFamily: anchorTheme.fonts.mono,
                      fontSize: compact ? 9 : 11,
                    }}
                  >
                    {row.source}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 5,
                      borderRadius: 99,
                      backgroundColor: "rgba(7,23,35,0.08)",
                    }}
                  >
                    <div
                      style={{
                        width: `${row.progress * 100}%`,
                        height: "100%",
                        borderRadius: 99,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: anchorTheme.colors.inkMuted,
                      fontFamily: anchorTheme.fonts.mono,
                      fontSize: 10,
                    }}
                  >
                    {Math.round(row.progress * 100)}%
                  </span>
                </div>
              </div>
              {isDecision && (
                <div
                  style={{
                    width: compact ? 24 : 30,
                    height: compact ? 24 : 30,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 10,
                    backgroundColor: anchorTheme.colors.decision,
                    color: anchorTheme.colors.ink,
                    fontWeight: 800,
                  }}
                >
                  !
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: "auto",
          color: anchorTheme.colors.inkMuted,
          fontSize: compact ? 10 : 12,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 99,
            backgroundColor: anchorTheme.colors.seafoam,
          }}
        />
        <span>Last observed just now</span>
        <span
          style={{ marginLeft: "auto", fontFamily: anchorTheme.fonts.mono }}
        >
          SYNCED
        </span>
      </div>
    </div>
  );
};
