export const FPS = 30;

export const VIDEO_SIZE = {
  width: 1920,
  height: 1080,
} as const;

export const TRANSITION_FRAMES = 15;

export type SceneId = "cold-open" | "anchor" | "decision" | "return";

export type SceneSpec = {
  readonly id: SceneId;
  readonly name: string;
  readonly durationInFrames: number;
  readonly purpose: string;
  readonly onScreen: string;
  readonly narration: string;
};

export const anchorStoryboard: readonly SceneSpec[] = [
  {
    id: "cold-open",
    name: "Cold Open",
    durationInFrames: 135,
    purpose: "从并行工作和注意力碎片化切入",
    onScreen: "有太多事情，正在同时发生。",
    narration: "当几个 AI 工作同时推进，最容易丢掉的，不是任务本身。",
  },
  {
    id: "anchor",
    name: "Anchor",
    durationInFrames: 180,
    purpose: "展示 Anchor 将目标、状态和过程聚拢",
    onScreen: "把上下文，稳稳接住。",
    narration: "Anchor 安可，把目标、进程和人类判断，固定在一起。",
  },
  {
    id: "decision",
    name: "Decision",
    durationInFrames: 195,
    purpose: "把真正需要人的决定提到前景",
    onScreen: "只把真正重要的决定，交给你。",
    narration: "你一眼看到正在发生什么，也只在真正需要时做决定。",
  },
  {
    id: "return",
    name: "Return",
    durationInFrames: 135,
    purpose: "以离开与返回形成记忆点并落版",
    onScreen: "离开时不丢失，回来时能继续。",
    narration: "离开时不丢失，回来时不用重建上下文。",
  },
] as const;

export const ANCHOR_PROMO_DURATION_IN_FRAMES =
  anchorStoryboard.reduce((total, scene) => total + scene.durationInFrames, 0) -
  TRANSITION_FRAMES * (anchorStoryboard.length - 1);

export const sceneById = (id: SceneId): SceneSpec => {
  const scene = anchorStoryboard.find((candidate) => candidate.id === id);

  if (!scene) {
    throw new Error(`Unknown Anchor scene: ${id}`);
  }

  return scene;
};
