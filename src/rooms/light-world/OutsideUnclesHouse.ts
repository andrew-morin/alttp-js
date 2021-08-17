import { Loader, Rectangle, Texture } from "pixi.js";
import invariant from "invariant";
import Room, { buildRoom, RoomLoader, TileMap } from "../Room";
import { crossTileDoorTiles } from "tiles/light-world/DoorTiles";
import { getInsideUnclesHouse } from "./InsideUnclesHouse";
import houseSprite from "assets/textures/outside-uncles-house/house.png";
import doorLeftOpenImage from "assets/textures/outside-uncles-house/door_left_open.png";
import doorRightOpenImage from "assets/textures/outside-uncles-house/door_right_open.png";

let OutsideUnclesHouse: Room;

const tileMap: TileMap = [
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,   0,   0,   0,   0,   0,   0,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,   0,   0,   0,   0,   0,   0,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,   0,   0,   0,   0,   0,   0,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,   0,   0,   0,   0,   0,   0,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,   0,   0,  -1,  -2,   0,   0,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,   0,   0,  -3,  -4,   0,   0,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11, 101,   1,   1,   1,   1, 101,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11],
  [11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11,  11]
];

function getDoorTextures(): Texture[] {
  const doorPoints = [
    [2, 4],
    [3, 4],
    [2, 5],
    [3, 5],
  ];
  const doorTextures = doorPoints.map(([x, y]) => {
    const houseTexture = Loader.shared.resources[houseSprite].texture;
    invariant(houseTexture, "Missing House Texture");
    const texture = houseTexture.clone();
    const rectangle = new Rectangle(16 * x, 16 * y, 16, 16);
    texture.frame = rectangle;
    return texture;
  });
  const openDoorTextures = [doorLeftOpenImage, doorRightOpenImage].map(
    (image) => {
      const openDoorTexture = Loader.shared.resources[image].texture;
      invariant(openDoorTexture, "Missing Open Door Texture");
      return openDoorTexture.clone();
    }
  );
  return doorTextures.concat(openDoorTextures);
}

export const getOutsideUnclesHouse: RoomLoader = (link) => {
  if (!OutsideUnclesHouse) {
    // const builder = new RoomBuilder(20, 20, lightWorldField);
    const [leftEnterDoorTile, rightEnterDoorTile, leftBackOfDoorTile, rightBackOfDoorTile] = crossTileDoorTiles(
      getInsideUnclesHouse,
      getDoorTextures()
    );
    const doorTileMap = {
      '-1': leftBackOfDoorTile,
      '-2': rightBackOfDoorTile,
      '-3': leftEnterDoorTile,
      '-4': rightEnterDoorTile
    };
    OutsideUnclesHouse = buildRoom(houseSprite, tileMap, { doorTileMap });
  }
  link.x = 16 * 4;
  link.y = 16 * 6 + 8;
  return OutsideUnclesHouse;
};
