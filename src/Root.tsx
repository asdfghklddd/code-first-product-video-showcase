import "./index.css";
import { Folder, Still } from "remotion";
import { AnchorPromoComposition } from "./Composition";
import { HeroCardScene } from "./scenes/HeroCardScene";

export const RemotionRoot: React.FC = () => (
  <Folder name="Code-First-Product-Video">
    <AnchorPromoComposition />
    <Still id="AnchorPromo-Poster" component={HeroCardScene} width={1920} height={1080} />
  </Folder>
);
