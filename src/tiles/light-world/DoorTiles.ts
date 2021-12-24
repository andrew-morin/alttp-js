import { Rectangle, Texture } from "pixi.js";
import Tile from "../Tile";
import { RoomLoader } from "../../rooms/Room";
import { StartDoorTransitionFn } from "src";

export function crossTileDoorTiles(
  loadNextRoom: RoomLoader,
  doorTextures: Texture[]
): [Tile, Tile, Tile, Tile] {
  const [
    firstBackOfDoorTexture,
    secondBackOfDoorTexture,
    firstEnterDoorTexture,
    secondEnterDoorTexture,
    firstOpenDoorTexture,
    secondOpenDoorTexture,
  ] = doorTextures;
  const firstBackOfDoorTile = new Tile(firstBackOfDoorTexture, { solid: true });
  const seconeBackOfDoorTile = new Tile(secondBackOfDoorTexture, {
    solid: true,
  });
  const firstEnterDoorTile = new Tile(firstEnterDoorTexture, {
    collisionShape: new Rectangle(0, 0, 8, 16),
  });
  const secondEnterDoorTile = new Tile(secondEnterDoorTexture, {
    collisionShape: new Rectangle(8, 0, 8, 16),
  });
  if (firstOpenDoorTexture && secondOpenDoorTexture) {
    let open = false;
    const updateOnOverlap = function (
      this: Tile,
      globalX: number,
      globalY: number
    ): void {
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

  const updateOnCollision = function (startDoorTransition: Function): void {
    startDoorTransition(loadNextRoom);
  };

  firstBackOfDoorTile.updateOnCollision = updateOnCollision;
  seconeBackOfDoorTile.updateOnCollision = updateOnCollision;

  return [
    firstEnterDoorTile,
    secondEnterDoorTile,
    firstBackOfDoorTile,
    seconeBackOfDoorTile,
  ];
}

export function singleTileDoorTiles(
  loadNextRoom: RoomLoader,
  doorTextures: Texture[]
): [Tile, Tile] {
  const [backOfDoorTexture, enterDoorTexture, openDoorTexture] = doorTextures;
  const backOfDoorTile = new Tile(backOfDoorTexture, { solid: true });
  const enterDoorTile = new Tile(enterDoorTexture);
  if (openDoorTexture) {
    let open = false;
    const updateOnOverlap = function (
      this: Tile,
      globalX: number,
      globalY: number
    ): void {
      const localY = globalY - this.y;
      if (!open && localY > 0 && localY < 15) {
        open = true;
        enterDoorTile.texture = openDoorTexture;
      }
    };

    enterDoorTile.updateOnOverlap = updateOnOverlap;
  }

  const updateOnCollision = function (
    startDoorTransition: StartDoorTransitionFn
  ): void {
    startDoorTransition(loadNextRoom);
  };

  backOfDoorTile.updateOnCollision = updateOnCollision;

  return [enterDoorTile, backOfDoorTile];
}
