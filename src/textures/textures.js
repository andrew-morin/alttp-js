import {Loader} from 'pixi.js';
import lightWorldFieldSprite from './light-world/field.png';
import lightWorld from './light-world/light_world.png';

export function loadTextures(cb) {
  Loader.shared
    .add(lightWorld)
    .add(lightWorldFieldSprite)
    .load(cb);
}