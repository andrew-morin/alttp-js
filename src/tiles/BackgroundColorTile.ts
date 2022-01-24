import { Rectangle, Texture } from "pixi.js";
import Tile, { TileOpts } from "./Tile";

const HALF_HEIGHT_WHITE = Texture.WHITE.clone();
HALF_HEIGHT_WHITE.frame = new Rectangle(0, 0, 16, 8);

export default function backgroundColorTile(
  color?: number,
  opts: TileOpts = {}
): Tile {
  opts.solid = true;
  const texture = opts.halfHeight ? HALF_HEIGHT_WHITE : Texture.WHITE;
  const tile = new Tile(texture, opts);
  if (color) {
    tile.tint = color;
  }
  return tile;
}
