import {Loader, Rectangle} from 'pixi.js';
import Room, { RoomBuilder, RoomLoader } from '../Room';
import Tile from '../../tiles/Tile';
import lightWorldField from '../../tiles/light-world/LightWorldField';
import houseSprite from '../../assets/textures/uncle-house-outside/house.png';
import doorTiles from '../../tiles/light-world/DoorTiles';
import { getInsideUnclesHouse } from './InsideUnclesHouse';
import doorBottomLeftImage from '../../assets/textures/house/door_left.png';
import doorLeftOpenImage from '../../assets/textures/house/door_left_open.png';
import doorAboveLeftImage from '../../assets/textures/house/door_above_left.png';
import doorBottomRightImage from '../../assets/textures/house/door_right.png';
import doorRightOpenImage from '../../assets/textures/house/door_right_open.png';
import doorAboveRightImage from '../../assets/textures/house/door_above_right.png';

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

export const getOutsideUnclesHouse: RoomLoader = () => {
  if (!OutsideUnclesHouse) {
    const builder = new RoomBuilder(20, 20, lightWorldField);
    const [doorLeftTile, doorRightTile, aboveDoorLeftTile, aboveDoorRightTile] = doorTiles(
      getInsideUnclesHouse,
      [doorAboveLeftImage, doorAboveRightImage],
      [doorBottomLeftImage, doorBottomRightImage],
      [doorLeftOpenImage, doorRightOpenImage]
    );
    for (let i = 0; i <= 6; i++) {
      for (let j = 0; j <= 5; j++) {
        let tile;
        // Door
        if (j === 5) {
          if (i === 2) {
            tile = doorLeftTile;
          } else if (i === 3) {
            tile = doorRightTile;
          }
        } else if (j === 4) {
          if (i === 2) {
            tile = aboveDoorLeftTile;
          } else if (i === 3) {
            tile = aboveDoorRightTile;
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
};
