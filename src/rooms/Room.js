export default class Room {
  tileMap;
  backgroundColor;
  width;
  height;

  constructor(backgroundColor, tileMap) {
    this.backgroundColor = backgroundColor;
    this.tileMap = tileMap;
    this.width = tileMap[0].length;
    this.height = tileMap.length;
  }
}

export class RoomBuilder {
  tileMap;
  backgroundColor;
  width;
  height;

  constructor(backgroundColor, width, height, defaultTile) {
    this.backgroundColor = backgroundColor;
    this.tileMap = Array.from({length: height}, () => Array.from({length: width}, () => defaultTile ? new defaultTile() : null));
    this.width = width;
    this.height = height;
  }

  setTile(x, y, tile) {
    this.tileMap[y][x] = tile;
  }

  build() {
    return new Room(this.backgroundColor, this.tileMap);
  }
}
