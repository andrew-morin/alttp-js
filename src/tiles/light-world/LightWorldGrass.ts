import {Loader} from 'pixi.js';
import Tile from '../Tile';
import lightWorldGrassImage from '../../assets/textures/light-world/grass.png';

export default function LightWorldGrass(): Tile {
  return new Tile(Loader.shared.resources[lightWorldGrassImage].texture, 1.25, 0.8125);
}
