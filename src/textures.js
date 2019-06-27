import {Loader, LoaderResource} from 'pixi.js';
import lightWorldFieldSprite from './assets/textures/light-world/field.png';
import lightWorld from './assets/textures/light-world/light_world.png';
import link from './assets/textures/link.gif';

export function loadTextures(cb) {
  Loader.shared
    .add(lightWorld)
    .add(lightWorldFieldSprite)
    .add(link)
    .add('assets/textures/link/LinkMovement.json', { xhrType: LoaderResource.XHR_RESPONSE_TYPE.JSON })
    .load(cb);
}