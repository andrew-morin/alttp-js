import invariant from "invariant";
import { Loader, Rectangle } from "pixi.js";
import { Link } from "../entities/Link/Link";
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
  const { doorTileMap } = roomOpts;
  switch (id) {
    case 0:
      return newTileFn({ solid: true });
    case 1:
      return newTileFn();
    case 2: // solid on bottom half
      return newTileFn({ collisionShape: new Rectangle(0, 8, 16, 8) });
    case 3: // solid on top half
      return newTileFn({ collisionShape: new Rectangle(0, 0, 16, 8) });
    case 4: // solid on left half
      return newTileFn({ collisionShape: new Rectangle(0, 0, 8, 16) });
    case 5: // solid on right half
      return newTileFn({ collisionShape: new Rectangle(8, 0, 8, 16) });
    case 6: // solid on bottom and left half (|_ shape)
      return newTileFn({
        collisionShapes: [
          new Rectangle(0, 8, 16, 8),
          new Rectangle(0, 0, 8, 16),
        ],
      });
    case 7: // solid on bottom and right half (_| shape)
      return newTileFn({
        collisionShapes: [
          new Rectangle(0, 8, 16, 8),
          new Rectangle(8, 0, 8, 16),
        ],
      });
    case 8: // solid on top and left half (|‾ shape)
      return newTileFn({
        collisionShapes: [
          new Rectangle(0, 0, 16, 8),
          new Rectangle(0, 0, 8, 16),
        ],
      });
    case 9: // solid on top and right half (‾| shape)
      return newTileFn({
        collisionShapes: [
          new Rectangle(0, 0, 16, 8),
          new Rectangle(8, 0, 8, 16),
        ],
      });
    case 0x10: // solid on top-left corner only
      return newTileFn({
        collisionShape: new Rectangle(0, 0, 8, 8),
      });
    case 0xa0: // half width, solid
      return newTileFn({ solid: true, halfWidth: true });
    case 0xa1: // half width, open
      return newTileFn({ halfWidth: true });
    case 0xa2: // half height, solid
      return newTileFn({ solid: true, halfHeight: true });
    case 0xa3: // half height, open
      return newTileFn({ halfHeight: true });
    case 0xa4: // half height and width, solid
      return newTileFn({ solid: true, halfHeight: true, halfWidth: true });
    case 0xa5: // half height and width, open
      return newTileFn({ halfHeight: true, halfWidth: true });
    // case 0x11: // background, half height
    //   return backgroundColorTile(backgroundColor, { halfHeight: true });
    // case 10:
    //   return backgroundColorTile(backgroundColor);
    case 11:
      return lightWorldField();
    case 100: // Eventually becomes a pot
      return newTileFn({ solid: true });
    case 101: // Eventually becomes a bush
      return newTileFn({ solid: true });
    case 1000: // Eventually becomes a chest
      return newTileFn({ solid: true });
  }
  if (doorTileMap != null && id < 0 && doorTileMap[id] != null) {
    return doorTileMap[id];
  }
  throw "Invalid tile type: " + id;
}

function getCurriedNewTileFn(
  roomSprite: string
): (x: number) => (opts?: TileOpts) => Tile {
  let textureStartX: number,
    previousHeight: number,
    previousWidth: number,
    accumulatedHeight = 0,
    accumulatedWidth = 0;
  return (x: number): ((opts?: TileOpts) => Tile) => {
    if (textureStartX != null) {
      if (x === textureStartX) {
        accumulatedWidth = 0;
        accumulatedHeight += previousHeight;
      } else {
        accumulatedWidth += previousWidth;
      }
    }
    return (opts?: TileOpts): Tile => {
      if (textureStartX == null) {
        textureStartX = x;
      }
      const width = opts?.halfWidth ? 8 : 16;
      const height = opts?.halfHeight ? 8 : 16;
      previousHeight = height;
      previousWidth = width;
      const frame = new Rectangle(
        accumulatedWidth,
        accumulatedHeight,
        width,
        height
      );
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
  const tileMap = tileIdMap.map((row) => {
    return row.map((id, x) => {
      return getTileFromId(id, roomOpts, curriedNewTileFn(x));
    });
  });

  return new Room(tileMap);
}
