import {Loader, LoaderResource} from 'pixi.js';
import lightWorldFieldImage from './assets/textures/light-world/field.png';
import lightWorldGrassImage from './assets/textures/light-world/grass.png';
import doorLeftImage from './assets/textures/house/door_left.png';
import doorRightImage from './assets/textures/house/door_right.png';
import outsideUnclesHouse from './assets/textures/uncle-house-outside/house.png';
import link from './assets/textures/link.gif';

export function loadTextures(cb: (loader: Loader, resources: Partial<Record<string, LoaderResource>>) => void): void {
  Loader.shared
    .add(lightWorldFieldImage)
    .add(lightWorldGrassImage)
    .add(doorLeftImage)
    .add(doorRightImage)
    .add(outsideUnclesHouse)
    .add(link)
    .add('assets/textures/link/LinkMovement.json', { xhrType: LoaderResource.XHR_RESPONSE_TYPE.JSON })
    .load(cb);
}
