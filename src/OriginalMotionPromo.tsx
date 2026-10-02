/**
 * 中文说明：保持原四幕运动节奏的 20 秒整片，换入真实截图和录屏；用于既有动画与真实产品内容的结合。
 * 完整命令与适用场景：docs/动画目录.md
 */
import { AnchorPromo } from "./AnchorPromo";

// Use the original scenes, timeline, camera curves and transition definitions.
// Only the copy and owner-provided media differ from the public edition.
const media = "local-assets/2026-09-30/real/";

export const OriginalMotionPromo: React.FC = () => (
  <AnchorPromo
    productName="Anchor"
    tagline="让思路靠岸。"
    heroCapture={{ headerSrc: `${media}page-header.png`, cardSources: [0, 1, 2, 3].map(index => `${media}card-${index}.png`) }}
    anchorRecordingSrc={`${media}iphone-home.png`}
    decisionRecordingSrc={`${media}iphone-home.png`}
    decisionCalloutSrc={`${media}decision-callout.png`}
    returnPhoneRecordingSrc={`${media}iphone-home.png`}
    returnMacRecordingSrc={`${media}mac-workflow.mp4`}
  />
);
