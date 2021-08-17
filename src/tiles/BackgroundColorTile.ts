import { Texture } from "pixi.js";
import Tile from "./Tile";

export default function backgroundColorTile(color?: number): Tile {
  const tile = new Tile(Texture.WHITE, { solid: true });
  if (color) {
    tile.tint = color;
  }
  return tile;
}
