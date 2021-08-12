import {Loader} from 'pixi.js';
import Tile from '../Tile';
import lightWorldGrassImage from '../../assets/textures/light-world/grass.png';

export default function LightWorldGrass(): Tile {
  return new Tile(Loader.shared.resources[lightWorldGrassImage].texture, { cardinalSpeed: 1.25, diagonalSpeed: 0.8125 });
}
