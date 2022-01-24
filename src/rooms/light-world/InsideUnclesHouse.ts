import { Loader, Rectangle, Texture } from "pixi.js";
import invariant from "invariant";
import Room, { buildRoom, RoomLoader, TileMap } from "../Room";
import { getOutsideUnclesHouse } from "./OutsideUnclesHouse";
import houseSprite from "assets/textures/uncles-house/house.png";
import { crossTileDoorTiles } from "tiles/light-world/DoorTiles";

let InsideUnclesHouse: Room;

// prettier-ignore
const tileMap: TileMap = [
  [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
  [0x11, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0x11],
  [10, 0, 0xa0, 100, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0xa0, 0, 10],
  [10, 0, 0xa0, 100, 0, 0, 1, 1, 1, 1, 1, 2, 1, 1, 0xa0, 0, 10],
  [10, 0, 0xa0, 100, 3, 3, 1, 1, 1, 1, 2, 0, 2, 1, 0xa0, 0, 10],
  [0x11, 0xa2, 0xa4, 0xa3, 0xa3, 0xa3, 0xa3, 0xa3, 0xa3, 0xa3, 0xa3, 0xa3, 0xa3, 0xa3, 0xa4, 0xa2, 0x11],
  [10, 0, 0xa0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0xa0, 0, 10],
  [10, 0, 0xa0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0xa0, 0, 10],
  [10, 0, 0xa0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0xa1, 1000, 0, 0, 10],
  [10, 0, 0xa0, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 0xa0, 0, 10],
  [10, 0, 6, 2, 2, 2, 2, -1, -2, 2, 2, 2, 2, 7, 0, 10],
  [10, 0, 0, 0, 0, 0, 0, -3, -4, 0, 0, 0, 0, 0, 0, 10],
];

function getDoorTextures(): Texture[] {
  const doorPoints = [
    [6, 10],
    [7, 10],
    [6, 9],
    [7, 9],
  ];
  return doorPoints.map(([x, y]) => {
    const doorTexture = Loader.shared.resources[houseSprite].texture;
    invariant(doorTexture, "Missing Door Texture");
    const clonedTexture = doorTexture.clone();
    const rectangle = new Rectangle(16 * x, 16 * y, 16, 16);
    clonedTexture.frame = rectangle;
    return clonedTexture;
  });
}

export const getInsideUnclesHouse: RoomLoader = (link) => {
  if (!InsideUnclesHouse) {
    const [
      firstEnterDoorTile,
      secondEnterDoorTile,
      firstBackOfDoorTile,
      secondBackOfDoorTile,
    ] = crossTileDoorTiles(getOutsideUnclesHouse, getDoorTextures(), {
      downFacing: true,
      shorterCollision: true,
    });
    const doorTileMap = {
      "-1": firstEnterDoorTile,
      "-2": secondEnterDoorTile,
      "-3": firstBackOfDoorTile,
      "-4": secondBackOfDoorTile,
    };
    InsideUnclesHouse = buildRoom(houseSprite, tileMap, {
      backgroundColor: 0x3d2829,
      doorTileMap,
    });
  }
  link.x = 16 * 8;
  link.y = 16 * 14;
  return InsideUnclesHouse;
};
