import {Loader, Rectangle, Sprite} from 'pixi.js';
import lightWorld from '../../assets/textures/light-world/light_world.png';

export default function lightWorldGrass() {
  const texture = Loader.shared.resources[lightWorld].texture;
  const rectangle = new Rectangle(270, 57, 16, 16);
  texture.frame = rectangle;

  // return new Sprite(Loader.shared.resources[lightWorldGrassSprite].texture);
  return new Sprite(texture);
}