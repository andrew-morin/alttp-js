import {Rectangle, Texture} from 'pixi.js';
import Tile from '../Tile';
import { RoomLoader } from '../../rooms/Room';
import { Link } from '../../entities/Link/Link';

const FIRST_TILE_COLLISION = new Rectangle(0, 0, 8, 16);
const SECOND_TILE_COLLISION = new Rectangle(8, 0, 8, 16);

export function crossTileDoorTiles(
  loadNextRoom: RoomLoader,
  doorTextures: Texture[],
  downFacing?: boolean
): [Tile, Tile, Tile, Tile] {
  const [firstBackOfDoorTexture, secondBackOfDoorTexture, firstEnterDoorTexture, secondEnterDoorTexture, firstOpenDoorTexture, secondOpenDoorTexture] = doorTextures;
  const firstBackOfDoorTile = new Tile(firstBackOfDoorTexture, { collisionShape: FIRST_TILE_COLLISION });
  const seconeBackOfDoorTile = new Tile(secondBackOfDoorTexture, { collisionShape: SECOND_TILE_COLLISION });
  const firstEnterDoorTile = new Tile(firstEnterDoorTexture, { collisionShape: FIRST_TILE_COLLISION });
  const secondEnterDoorTile = new Tile(secondEnterDoorTexture, { collisionShape: SECOND_TILE_COLLISION });
  if (firstOpenDoorTexture && secondOpenDoorTexture) {
    let open = false;
    const updateOnOverlap = function(this: Tile, link: Link, globalX: number, globalY: number): void {
      const localY = globalY - this.y;
      if (!open && localY > 0 && localY < 15) {
        open = true;
        firstEnterDoorTile.texture = firstOpenDoorTexture;
        secondEnterDoorTile.texture = secondOpenDoorTexture;
      }
    };

    firstEnterDoorTile.updateOnOverlap = updateOnOverlap;
    secondEnterDoorTile.updateOnOverlap = updateOnOverlap;
  }

  const transition = function(this: Tile, link: Link, globalX: number, globalY: number): void {
    // Down facing doors require Link to be at the bottom of the door
    if (downFacing) {
      const localY = globalY - this.y;
      if (localY < 15) {
        return;
      }
    }
    link.startDoorTransition(loadNextRoom);
  };

  firstBackOfDoorTile.updateOnOverlap = transition;
  seconeBackOfDoorTile.updateOnOverlap = transition;

  return [firstEnterDoorTile, secondEnterDoorTile, firstBackOfDoorTile, seconeBackOfDoorTile];
}
