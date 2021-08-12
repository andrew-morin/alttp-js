import { Link } from '../entities/Link/Link';
import Tile from '../tiles/Tile';

export type RoomLoader = (link: Link) => Room;

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
    this.tileMap = Array.from({length: height}, () => Array.from({length: width}, () => defaultTile()));
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
