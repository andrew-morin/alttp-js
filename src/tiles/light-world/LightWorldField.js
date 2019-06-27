import {Loader, Sprite} from 'pixi.js';
import lightWorldFieldSprite from '../../assets/textures/light-world/field.png';

export default function lightWorldField() {
  return new Sprite(Loader.shared.resources[lightWorldFieldSprite].texture);
}