import invariant from "invariant";
import { Loader, Rectangle } from "pixi.js";
import { Link } from "../entities/Link/Link";
import backgroundColorTile from "../tiles/BackgroundColorTile";
import lightWorldField from "../tiles/light-world/LightWorldField";
import Tile, { TileOpts } from "../tiles/Tile";

export type RoomLoader = (link: Link) => Room;
export type TileMap = number[][];

export type RoomOpts = {
  doorTileMap?: { [id: number]: Tile };
  backgroundColor?: number;
};

export default class Room {
  tileMap: Tile[][];
  width: number;
  height: number;

  constructor(tileMap: Tile[][]) {
    this.tileMap = tileMap;
    this.width = tileMap[0].length;
    this.height = tileMap.length;
  }
}

export class RoomBuilder {
  tileMap: Tile[][];
  width: number;
  height: number;

  constructor(width: number, height: number, defaultTile: () => Tile) {
    this.tileMap = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => defaultTile())
    );
    this.width = width;
    this.height = height;
  }

  setTile(x: number, y: number, tile: Tile): void {
    this.tileMap[y][x] = tile;
  }

  build(): Room {
    return new Room(this.tileMap);
  }
}

function newHouseSprite(
  frame: Rectangle,
  roomSprite: string,
  opts?: TileOpts
): Tile {
  const loadedTexture = Loader.shared.resources[roomSprite].texture;
  invariant(loadedTexture, "Failed to laod sprite: " + roomSprite);
  const texture = loadedTexture.clone();
  texture.frame = frame;
  return new Tile(texture, opts);
}

function getTileFromId(
  id: number,
  roomOpts: RoomOpts,
  newTileFn: (opts?: TileOpts) => Tile
): Tile {
  const { backgroundColor, doorTileMap } = roomOpts;
  switch (id) {
    case 0:
      return newTileFn({ solid: true });
    case 1:
      return newTileFn();
    case 2:
      return newTileFn({ collisionShape: new Rectangle(0, 8, 16, 8) }); // solid on bottom half
    case 10:
      return backgroundColorTile(backgroundColor);
    case 11:
      return lightWorldField();
    case 100:
      return newTileFn({ solid: true }); // Eventually becomes a pot
    case 101:
      return newTileFn({ solid: true }); // Eventually becomes a bush
  }
  if (doorTileMap != null && id < 0 && doorTileMap[id] != null) {
    return doorTileMap[id];
  }
  throw "Invalid tile type: " + id;
}

function getCurriedNewTileFn(
  roomSprite: string
): (x: number, y: number) => (opts?: TileOpts) => Tile {
  let textureStartX: number, textureStartY: number;
  return (x: number, y: number): ((opts?: TileOpts) => Tile) => {
    return (opts?: TileOpts): Tile => {
      if (textureStartX == null) {
        textureStartX = x;
        textureStartY = y;
      }
      const frameX = x - textureStartX;
      const frameY = y - textureStartY;
      const frame = new Rectangle(16 * frameX, 16 * frameY, 16, 16);
      return newHouseSprite(frame, roomSprite, opts);
    };
  };
}

export function buildRoom(
  roomSprite: string,
  tileIdMap: number[][],
  roomOpts: RoomOpts = {}
): Room {
  const curriedNewTileFn = getCurriedNewTileFn(roomSprite);
  const tileMap = tileIdMap.map((row, y) => {
    return row.map((id, x) => {
      return getTileFromId(id, roomOpts, curriedNewTileFn(x, y));
    });
  });

  return new Room(tileMap);
}
