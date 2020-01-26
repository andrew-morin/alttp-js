import {Texture} from 'pixi.js';
import Tile from './Tile';

export default function backgroundColorTile(color: number): Tile {
  const tile = new Tile(Texture.WHITE, true);
  tile.tint = color;
  return tile;
}
