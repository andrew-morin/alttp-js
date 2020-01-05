import {Loader, Rectangle} from 'pixi.js';
import Tile from '../Tile';
import doorLeftImage from '../../assets/textures/house/door_left.png';
import doorRightImage from '../../assets/textures/house/door_right.png';

export function doorLeftSide(): Tile {
  return new Tile(Loader.shared.resources[doorLeftImage].texture, 1.5, 1, new Rectangle(0, 0, 8, 16));
}

export function doorRightSide(): Tile {
  return new Tile(Loader.shared.resources[doorRightImage].texture, 1.5, 1, new Rectangle(8, 0, 8, 16));
}
