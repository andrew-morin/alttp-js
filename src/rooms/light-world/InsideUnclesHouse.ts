import {Loader, Rectangle} from 'pixi.js';
import Room, { RoomBuilder } from '../Room';
import Tile from '../../tiles/Tile';
import houseSprite from '../../assets/textures/inside_uncles_house.png';
import backgroundColorTile from '../../tiles/BackgroundColorTile';

let OutsideUnclesHouse: Room;

function newHouseSprite(x: number, y: number, solid = false): Tile {
  const texture = Loader.shared.resources[houseSprite].texture.clone();
  const rectangle = new Rectangle(16 * x, 16 * y, 16, 16);
  texture.frame = rectangle;

  if (solid) {
    return new Tile(texture, true);
  }
  return new Tile(texture, 1.5, 1);
}

export function getInsideUnclesHouse(): Room {
  if (!OutsideUnclesHouse) {
    const builder = new RoomBuilder(20, 20, () => backgroundColorTile(0x3D2829));
    for (let i = 0; i <= 14; i++) {
      for (let j = 0; j <= 11; j++) {
        const tile = newHouseSprite(i, j, i <= 1 || j <= 1 || i >= 13 || j >= 10);
        builder.setTile(i + 1, j + 1, tile);
      }
    }
    OutsideUnclesHouse = builder.build();
  }
  return OutsideUnclesHouse;
}
