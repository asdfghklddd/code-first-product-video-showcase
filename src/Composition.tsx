import { Composition } from "remotion";
import { AnchorPromo, anchorPromoMetadata } from "./AnchorPromo";

export const AnchorPromoComposition: React.FC = () => (
  <Composition
    id="AnchorPromo"
    component={AnchorPromo}
    durationInFrames={anchorPromoMetadata.durationInFrames}
    fps={anchorPromoMetadata.fps}
    width={anchorPromoMetadata.width}
    height={anchorPromoMetadata.height}
    defaultProps={{
      productName: "Anchor",
      tagline: "HOLD THE CONTEXT",
    }}
  />
);
