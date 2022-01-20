import { Loader } from "pixi.js";
import invariant from "invariant";
import Tile from "../Tile";
import lightWorldFieldImage from "assets/textures/light-world/field.png";

export default function lightWorldField(): Tile {
  const texture = Loader.shared.resources[lightWorldFieldImage].texture;
  invariant(texture, "Missing LightWorldField texture");
  return new Tile(texture);
}
