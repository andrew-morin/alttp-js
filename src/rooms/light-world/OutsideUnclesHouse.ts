import { Loader, Rectangle, Texture } from "pixi.js";
import invariant from "invariant";
import Room, { RoomBuilder, RoomLoader } from "../Room";
import Tile from "tiles/Tile";
import lightWorldField from "tiles/light-world/LightWorldField";
import { crossTileDoorTiles } from "tiles/light-world/DoorTiles";
import { getInsideUnclesHouse } from "./InsideUnclesHouse";
import houseSprite from "assets/textures/outside-uncles-house/house.png";
import doorLeftOpenImage from "assets/textures/outside-uncles-house/door_left_open.png";
import doorRightOpenImage from "assets/textures/outside-uncles-house/door_right_open.png";

let OutsideUnclesHouse: Room;

function newHouseSprite(x: number, y: number, solid = false): Tile {
  const houseTexture = Loader.shared.resources[houseSprite].texture;
  invariant(houseTexture, "Missing OutsideUnceHouse texture");
  const texture = houseTexture.clone();
  const rectangle = new Rectangle(16 * x, 16 * y, 16, 16);
  texture.frame = rectangle;

  return new Tile(texture, { solid });
}

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
    const builder = new RoomBuilder(20, 20, lightWorldField);
    const [
      leftEnterDoorTile,
      rightEnterDoorTile,
      leftBackOfDoorTile,
      rightBackOfDoorTile,
    ] = crossTileDoorTiles(getInsideUnclesHouse, getDoorTextures());
    for (let i = 0; i <= 6; i++) {
      for (let j = 0; j <= 5; j++) {
        let tile;
        // Door
        if (j === 5) {
          if (i === 2) {
            tile = leftEnterDoorTile;
          } else if (i === 3) {
            tile = rightEnterDoorTile;
          }
        } else if (j === 4) {
          if (i === 2) {
            tile = leftBackOfDoorTile;
          } else if (i === 3) {
            tile = rightBackOfDoorTile;
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
  link.x = 16 * 4;
  link.y = 16 * 6 + 8;
  return OutsideUnclesHouse;
};
