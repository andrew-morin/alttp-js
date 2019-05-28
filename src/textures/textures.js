import {Loader} from 'pixi.js';
import lightWorldFieldSprite from './light-world/field.png';
import lightWorld from './light-world/light_world.png';
import link from './link.gif';

export function loadTextures(cb) {
  Loader.shared
    .add(lightWorld)
    .add(lightWorldFieldSprite)
    .add(link)
    .load(cb);
}