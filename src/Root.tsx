import { BrandIntro } from "./BrandIntros";
import { HeroRebuild } from "./HeroRebuild";
import "./index.css";
import { Composition, Folder, Still, getStaticFiles } from "remotion";
import { AnchorPromoComposition } from "./Composition";
import { HeroCardScene } from "./scenes/HeroCardScene";
import { CurrentPromo, CurrentPromoClosing } from "./CurrentPromo";
import { OriginalMotionPromo } from "./OriginalMotionPromo";
import { anchorPromoMetadata } from "./AnchorPromo";
import { OpeningA, OpeningB, OpeningC, OpeningComparison, PremiumPromo } from "./PremiumMotion";

export const RemotionRoot: React.FC = () => {
  const names = new Set(getStaticFiles().map((file) => file.name));
  const hasCurrentMedia = ["app-icon.png", "iphone-home.png", "iphone-return.png", "mac-overview.png", "mac-decision.png", "mac-workflow.mp4"]
    .every((name) => names.has(`local-assets/2026-09-30/${name}`));
  const hasRealCapture = ["iphone-home.png", "mac-workflow.mp4", "page-header.png", "card-0.png", "card-1.png", "card-2.png", "card-3.png", "decision-callout.png"]
    .every((name) => names.has(`local-assets/2026-09-30/real/${name}`));
  const hasMotionMedia = hasRealCapture && ["mac-home.png", "mac-first.png", "mac-closing.png"]
    .every((name) => names.has(`local-assets/2026-09-30/real/${name}`));
  const hasHeroMedia = hasMotionMedia && ["hero-A.mp4", "hero-B.mp4", "hero-C.mp4", "hero-A-final.png"]
    .every((name) => names.has(`local-assets/2026-10-01/hero/${name}`));
  const hasHeroPreview = hasMotionMedia && ["draft-A.mp4", "draft-B.mp4", "draft-C.mp4", "draft-A-final.png"]
    .every((name) => names.has(`local-assets/2026-10-01/hero/${name}`));
  return (
    <>
      {(hasHeroMedia || hasHeroPreview) && <Folder name="Anchor-3D-Hero-Rebuild">
        {["A", "B", "C", "D"].map(variant => <Composition key={variant} id={`Anchor-Hero-20s-${variant}`} component={HeroRebuild} defaultProps={{variant}} durationInFrames={1200} fps={60} width={1920} height={1080} />)}
      </Folder>}
      {hasMotionMedia && <Folder name="Anchor-Motion-Options">
        {["A", "B", "C", "D"].map(variant => <Composition key={variant} id={`Anchor-Brand-20s-${variant}`} component={BrandIntro} defaultProps={{variant}} durationInFrames={1200} fps={60} width={1920} height={1080} />)}
        <Composition id="Anchor-Opening-A" component={OpeningA} durationInFrames={360} fps={60} width={1920} height={1080} />
        <Composition id="Anchor-Opening-B" component={OpeningB} durationInFrames={480} fps={60} width={1920} height={1080} />
        <Composition id="Anchor-Opening-C" component={OpeningC} durationInFrames={600} fps={60} width={1920} height={1080} />
        <Composition id="Anchor-Opening-Comparison" component={OpeningComparison} durationInFrames={1710} fps={60} width={1920} height={1080} />
        <Composition id="Anchor-Premium-Promo" component={PremiumPromo} durationInFrames={1560} fps={60} width={1920} height={1080} />
      </Folder>}
      {(hasCurrentMedia || hasRealCapture) && (
        <Folder name="Current-Anchor">
          {hasRealCapture && <Composition id="AnchorPromo-OriginalMotion-20260930" component={OriginalMotionPromo} durationInFrames={anchorPromoMetadata.durationInFrames} fps={anchorPromoMetadata.fps} width={anchorPromoMetadata.width} height={anchorPromoMetadata.height} />}
          {hasCurrentMedia && <>
          <Composition id="AnchorPromo-20260930" component={CurrentPromo} durationInFrames={900} fps={30} width={1920} height={1080} />
          <Still id="AnchorPromo-20260930-Brand" component={CurrentPromoClosing} width={1920} height={1080} />
          </>}
        </Folder>
      )}
      <Folder name="Code-First-Product-Video">
        <AnchorPromoComposition />
        <Still id="AnchorPromo-Poster" component={HeroCardScene} width={1920} height={1080} />
      </Folder>
    </>
  );
};
