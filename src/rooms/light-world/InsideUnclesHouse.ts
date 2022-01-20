import { Loader, Rectangle, Texture } from "pixi.js";
import invariant from "invariant";
import Room, { RoomBuilder, RoomLoader, TileMap } from "../Room";
import Tile, { TileOpts } from "tiles/Tile";
import backgroundColorTile from "tiles/BackgroundColorTile";
import { singleTileDoorTiles } from "tiles/light-world/DoorTiles";
import { getOutsideUnclesHouse } from "./OutsideUnclesHouse";
import houseSprite from "assets/textures/uncles-house/house.png";

let InsideUnclesHouse: Room, backOfDoorTile: Tile, enterDoorTile: Tile;

const tileMap: TileMap = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 10, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 10, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 101, 0, 0, 0, 0, 0, 0],
];

function newHouseSprite(x: number, y: number, opts?: TileOpts): Tile {
  const houseTexture = Loader.shared.resources[houseSprite].texture;
  invariant(houseTexture, "Missing InsideUncleHouse texture");
  const clonedTexture = houseTexture.clone();
  const rectangle = new Rectangle(16 * x, 16 * y, 16, 16);
  clonedTexture.frame = rectangle;

  return new Tile(clonedTexture, opts);
}

function getDoorTextures(): Texture[] {
  const doorPoints = [
    [7, 11],
    [7, 10],
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

function getTileFromType(tileType: number, x: number, y: number): Tile {
  switch (tileType) {
    case 0:
      return newHouseSprite(x, y, { solid: true });
    case 1:
      return newHouseSprite(x, y);
    case 2:
      return newHouseSprite(x, y, {
        collisionShape: new Rectangle(0, 8, 16, 8),
      }); // solid on bottom half
    case 10:
      return newHouseSprite(x, y, { solid: true }); // Eventually becomes a pot
    case 100:
      return enterDoorTile;
    case 101:
      return backOfDoorTile;
  }
  throw "Invalid tile type";
}

export const getInsideUnclesHouse: RoomLoader = (link) => {
  if (!InsideUnclesHouse) {
    [enterDoorTile, backOfDoorTile] = singleTileDoorTiles(
      getOutsideUnclesHouse,
      getDoorTextures()
    );
    const builder = new RoomBuilder(20, 20, () =>
      backgroundColorTile(0x3d2829)
    );
    tileMap.forEach((row, y) => {
      row.forEach((tileType, x) => {
        builder.setTile(x + 1, y + 1, getTileFromType(tileType, x, y));
      });
    });
    InsideUnclesHouse = builder.build();
  }
  link.x = 16 * 8 + 8;
  link.y = 16 * 11;
  return InsideUnclesHouse;
};
