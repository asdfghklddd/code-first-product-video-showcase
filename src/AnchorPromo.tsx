import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import {
  anchorStoryboard,
  ANCHOR_PROMO_DURATION_IN_FRAMES,
  FPS,
  TRANSITION_FRAMES,
  VIDEO_SIZE,
} from "./data/storyboard";
import { AnchorScene } from "./scenes/AnchorScene";
import { DecisionScene } from "./scenes/DecisionScene";
import { HeroCardScene, HeroCapture } from "./scenes/HeroCardScene";
import { ReturnScene } from "./scenes/ReturnScene";

export type AnchorPromoProps = {
  readonly productName: string;
  readonly tagline: string;
  readonly recordingSrc?: string;
  readonly anchorRecordingSrc?: string;
  readonly decisionRecordingSrc?: string;
  readonly returnPhoneRecordingSrc?: string;
  readonly returnMacRecordingSrc?: string;
  readonly heroCapture?: HeroCapture;
  readonly decisionCalloutSrc?: string;
};

export const AnchorPromo: React.FC<AnchorPromoProps> = ({
  productName,
  tagline,
  recordingSrc,
  anchorRecordingSrc,
  decisionRecordingSrc,
  returnPhoneRecordingSrc,
  returnMacRecordingSrc,
  heroCapture,
  decisionCalloutSrc,
}) => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence
          durationInFrames={anchorStoryboard[0].durationInFrames}
          name="ColdOpen"
        >
          <HeroCardScene capture={heroCapture} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          durationInFrames={anchorStoryboard[1].durationInFrames}
          name="Anchor"
        >
          <AnchorScene recordingSrc={anchorRecordingSrc ?? recordingSrc} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          durationInFrames={anchorStoryboard[2].durationInFrames}
          name="Decision"
        >
          <DecisionScene recordingSrc={decisionRecordingSrc ?? recordingSrc} capturedCalloutSrc={decisionCalloutSrc} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          durationInFrames={anchorStoryboard[3].durationInFrames}
          name="Return"
        >
          <ReturnScene
            recordingSrc={returnPhoneRecordingSrc ?? recordingSrc}
            macRecordingSrc={returnMacRecordingSrc ?? recordingSrc}
            productName={productName}
            tagline={tagline}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export const anchorPromoMetadata = {
  durationInFrames: ANCHOR_PROMO_DURATION_IN_FRAMES,
  fps: FPS,
  width: VIDEO_SIZE.width,
  height: VIDEO_SIZE.height,
} as const;
