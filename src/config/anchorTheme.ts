export const anchorTheme = {
  colors: {
    ink: "#071723",
    inkMuted: "#6D8090",
    night: "#06131D",
    ocean: "#0B2A3E",
    oceanSoft: "#143B51",
    cobalt: "#1688E8",
    sky: "#62C7FF",
    seafoam: "#8EE3C7",
    coral: "#FF8A75",
    violet: "#A892FF",
    decision: "#F4C85B",
    paper: "#F5F8F7",
    fog: "#E9F0EF",
    white: "#FFFFFF",
  },
  fonts: {
    display: "Arial, PingFang SC, Hiragino Sans GB, sans-serif",
    body: "Arial, PingFang SC, Hiragino Sans GB, sans-serif",
    mono: "SFMono-Regular, SF Mono, Menlo, monospace",
  },
  radii: {
    card: 28,
    device: 42,
    pill: 999,
  },
  shadows: {
    card: "0 32px 80px rgba(2, 17, 28, 0.22)",
    soft: "0 18px 46px rgba(2, 17, 28, 0.14)",
    glow: "0 0 80px rgba(22, 136, 232, 0.38)",
  },
} as const;

export type AnchorTheme = typeof anchorTheme;
