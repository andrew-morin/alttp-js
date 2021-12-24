import { Loader } from 'pixi.js';
import Tile from '../Tile';
import lightWorldFieldImage from '../../assets/textures/light-world/field.png';
import invariant from 'invariant';

export default function lightWorldField(): Tile {
  const texture = Loader.shared.resources[lightWorldFieldImage].texture;
  invariant(texture, 'Missing LightWorldField texture');
  return new Tile(texture, { solid: false });
}
