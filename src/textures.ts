import {Loader, LoaderResource} from 'pixi.js';
import lightWorldFieldImage from './assets/textures/light-world/field.png';
import lightWorldGrassImage from './assets/textures/light-world/grass.png';
import doorLeftOpenImage from './assets/textures/outside-uncles-house/door_left_open.png';
import doorRightOpenImage from './assets/textures/outside-uncles-house/door_right_open.png';
import outsideUnclesHouse from './assets/textures/outside-uncles-house/house.png';
import insideHouseSprite from './assets/textures/uncles-house/house.png';
import link from './assets/textures/link.gif';

export function loadTextures(cb: (loader: Loader, resources: Partial<Record<string, LoaderResource>>) => void): void {
  Loader.shared
    .add(lightWorldFieldImage)
    .add(lightWorldGrassImage)
    .add(doorLeftOpenImage)
    .add(doorRightOpenImage)
    .add(outsideUnclesHouse)
    .add(insideHouseSprite)
    .add(link)
    .add('assets/textures/link/LinkMovement.json', { xhrType: LoaderResource.XHR_RESPONSE_TYPE.JSON })
    .load(cb);
}
