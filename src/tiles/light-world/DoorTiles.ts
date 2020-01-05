import {Loader, Rectangle} from 'pixi.js';
import Tile from '../Tile';
import doorLeftImage from '../../assets/textures/house/door_left.png';
import doorLeftOpenImage from '../../assets/textures/house/door_left_open.png';
import doorAboveLeftImage from '../../assets/textures/house/door_above_left.png';
import doorRightImage from '../../assets/textures/house/door_right.png';
import doorRightOpenImage from '../../assets/textures/house/door_right_open.png';
import doorAboveRightImage from '../../assets/textures/house/door_above_right.png';

function doorTile(image: string, collisionRect: Rectangle): Tile {
  return new Tile(Loader.shared.resources[image].texture, 1.5, 1, collisionRect);
}

function aboveDoorTile(image: string): Tile {
  return new Tile(Loader.shared.resources[image].texture, true);
}

export default function doorTiles(): [Tile, Tile, Tile, Tile] {
  const doorLeftTile = doorTile(doorLeftImage, new Rectangle(0, 0, 8, 16));
  const doorRightTile = doorTile(doorRightImage, new Rectangle(8, 0, 8, 16));
  let open = false;
  const updateOnOverlap = function(): void {
    if (!open) {
      open = true;
      doorLeftTile.texture = Loader.shared.resources[doorLeftOpenImage].texture;
      doorRightTile.texture = Loader.shared.resources[doorRightOpenImage].texture;
    }
  };

  doorLeftTile.updateOnOverlap = updateOnOverlap;
  doorRightTile.updateOnOverlap = updateOnOverlap;

  const aboveDoorLeftTile = aboveDoorTile(doorAboveLeftImage);
  const aboveDoorRightTile = aboveDoorTile(doorAboveRightImage);

  return [doorLeftTile, doorRightTile, aboveDoorLeftTile, aboveDoorRightTile];
}
