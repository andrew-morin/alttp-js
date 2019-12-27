import {Loader, LoaderResource} from 'pixi.js';
import lightWorldFieldSprite from './assets/textures/light-world/field.png';
import lightWorld from './assets/textures/light-world/light_world.png';
import outsideUnclesHouse from './assets/textures/uncle-house-outside/house.png';
import link from './assets/textures/link.gif';

export function loadTextures(cb: (loader: Loader, resources: Partial<Record<string, LoaderResource>>) => void): void {
  Loader.shared
    .add(lightWorld)
    .add(lightWorldFieldSprite)
    .add(outsideUnclesHouse)
    .add(link)
    .add('assets/textures/link/LinkMovement.json', { xhrType: LoaderResource.XHR_RESPONSE_TYPE.JSON })
    .load(cb);
}
