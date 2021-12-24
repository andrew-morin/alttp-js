import { Loader } from 'pixi.js';
import Tile from '../Tile';
import lightWorldGrassImage from '../../assets/textures/light-world/grass.png';
import invariant from 'invariant';

export default function LightWorldGrass(): Tile {
  const texture = Loader.shared.resources[lightWorldGrassImage].texture;
  invariant(texture, 'Missing LightWorldGrass texture');
  return new Tile(texture, { cardinalSpeed: 1.25, diagonalSpeed: 0.8125 });
}
