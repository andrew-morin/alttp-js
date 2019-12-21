import {Loader, Rectangle} from 'pixi.js';
import Tile from '../Tile.js';
import lightWorld from '../../assets/textures/light-world/light_world.png';

export default function lightWorldGrass() {
  const texture = Loader.shared.resources[lightWorld].texture;
  const rectangle = new Rectangle(270, 57, 16, 16);
  texture.frame = rectangle;

  // return new Sprite(Loader.shared.resources[lightWorldGrassSprite].texture);
  return new Tile(texture, 1.25, 0.8125);
}