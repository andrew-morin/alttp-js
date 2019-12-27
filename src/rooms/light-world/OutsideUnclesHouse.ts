import {Loader, Rectangle} from 'pixi.js';
import Room, { RoomBuilder } from '../Room';
import Tile from '../../tiles/Tile';
import lightWorldField from '../../tiles/light-world/LightWorldField';
import houseSprite from '../../assets/textures/uncle-house-outside/house.png';

let OutsideUnclesHouse: Room;

function newHouseSprite(x: number, y: number): Tile {
  const texture = Loader.shared.resources[houseSprite].texture.clone();
  const rectangle = new Rectangle(16 * x, 16 * y, 16, 16);
  texture.frame = rectangle;

  return new Tile(texture, 1.25, 0.8125);
}

export function getOutsideUnclesHouse(): Room {
  if (!OutsideUnclesHouse) {
    const builder = new RoomBuilder(20, 20, lightWorldField);
    for (let i = 0; i <= 5; i++) {
      for (let j = 0; j <= 5; j++) {
        builder.setTile(i + 1, j + 1, newHouseSprite(i, j));
      }
    }
    builder.setTile(3, 7, newHouseSprite(2, 6));
    builder.setTile(4, 7, newHouseSprite(3, 6));
    OutsideUnclesHouse = builder.build();
  }
  return OutsideUnclesHouse;
}
