import {Loader} from 'pixi.js';
import Tile from '../Tile';
import lightWorldFieldImage from '../../assets/textures/light-world/field.png';

export default function lightWorldField(): Tile {
  return new Tile(Loader.shared.resources[lightWorldFieldImage].texture, { solid: false });
}
