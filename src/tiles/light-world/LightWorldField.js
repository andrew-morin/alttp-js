import {Loader} from 'pixi.js';
import Tile from '../Tile.js';
import lightWorldFieldSprite from '../../assets/textures/light-world/field.png';

export default function lightWorldField() {
  return new Tile(Loader.shared.resources[lightWorldFieldSprite].texture, 1.5, 1);
}