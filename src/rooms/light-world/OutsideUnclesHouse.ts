import {Loader, Rectangle} from 'pixi.js';
import Room, { RoomBuilder } from '../Room';
import Tile from '../../tiles/Tile';
import lightWorldField from '../../tiles/light-world/LightWorldField';
import houseSprite from '../../assets/textures/uncle-house-outside/house.png';
import { doorLeftSide, doorRightSide } from '../../tiles/light-world/DoorTiles';

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

export function getOutsideUnclesHouse(): Room {
  if (!OutsideUnclesHouse) {
    const builder = new RoomBuilder(20, 20, lightWorldField);
    for (let i = 0; i <= 6; i++) {
      for (let j = 0; j <= 5; j++) {
        let tile;
        // Door
        if (j === 5) {
          if (i === 2) {
            tile = doorLeftSide();
          } else if (i === 3) {
            tile = doorRightSide();
          }
        }
        tile = tile || newHouseSprite(i, j, i !== 6);
        builder.setTile(i + 1, j + 1, tile);
      }
    }
    builder.setTile(3, 7, newHouseSprite(2, 6));
    builder.setTile(4, 7, newHouseSprite(3, 6));
    OutsideUnclesHouse = builder.build();
  }
  return OutsideUnclesHouse;
}
