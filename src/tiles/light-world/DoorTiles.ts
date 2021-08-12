import {Loader, Rectangle} from 'pixi.js';
import Tile from '../Tile';
import { RoomLoader } from '../../rooms/Room';

function doorTile(image: string, collisionRect?: Rectangle): Tile {
  if (collisionRect === undefined) {
    return new Tile(Loader.shared.resources[image].texture, true);
  }
  return new Tile(Loader.shared.resources[image].texture, 1.5, 1, collisionRect);
}

export default function doorTiles(
  loadNextRoom: RoomLoader,
  insideDoorImages: string[],
  startDoorImages: string[],
  openDoorImages?: string[]
): [Tile, Tile, Tile, Tile] {
  const firstInsideDoorTile = doorTile(insideDoorImages[0]);
  const seconeInsideDoorTile = doorTile(insideDoorImages[1]);
  const firstDoorTile = doorTile(startDoorImages[0], new Rectangle(0, 0, 8, 16));
  const secondDoorTile = doorTile(startDoorImages[1], new Rectangle(8, 0, 8, 16));
  if (openDoorImages) {
    let open = false;
    const updateOnOverlap = function(this: Tile, globalX: number, globalY: number): void {
      const localY = globalY - this.y;
      if (!open && localY > 0 && localY < 15) {
        open = true;
        firstDoorTile.texture = Loader.shared.resources[openDoorImages[0]].texture;
        secondDoorTile.texture = Loader.shared.resources[openDoorImages[1]].texture;
      }
    };

    firstDoorTile.updateOnOverlap = updateOnOverlap;
    secondDoorTile.updateOnOverlap = updateOnOverlap;
  }

  const updateOnCollision = function(startDoorTransition: Function): void {
    startDoorTransition(loadNextRoom);
  };

  firstInsideDoorTile.updateOnCollision = updateOnCollision;
  seconeInsideDoorTile.updateOnCollision = updateOnCollision;

  return [firstDoorTile, secondDoorTile, firstInsideDoorTile, seconeInsideDoorTile];
}
