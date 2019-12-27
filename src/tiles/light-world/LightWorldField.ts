import {Loader} from 'pixi.js';
import Tile from '../Tile';
import lightWorldFieldSprite from '../../assets/textures/light-world/field.png';

export default function lightWorldField(): Tile {
  return new Tile(Loader.shared.resources[lightWorldFieldSprite].texture, 1.5, 1);
}
