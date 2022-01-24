import { Rectangle, Texture } from "pixi.js";
import Tile, { TileOpts } from "../Tile";
import { RoomLoader } from "../../rooms/Room";
import { Link } from "../../entities/Link/Link";

const FIRST_TILE_COLLISION = new Rectangle(0, 0, 8, 16);
const SECOND_TILE_COLLISION = new Rectangle(8, 0, 8, 16);
const FIRST_ENTER_TILE_COLLISION_SHORTER = new Rectangle(0, 0, 8, 8);
const SECOND_ENTER_TILE_COLLISION_SHORTER = new Rectangle(8, 0, 8, 8);
const FIRST_ENTER_TILE_COLLISION_SHORTER_DOWN_FACING = new Rectangle(
  0,
  8,
  8,
  8
);
const SECOND_ENTER_TILE_COLLISION_SHORTER_DOWN_FACING = new Rectangle(
  8,
  8,
  8,
  8
);

// Foreground tiles are not always 16x16 squares and need to be positioned by their frame
class ForegroundTile extends Tile {
  adjustment: { x: number; y: number };
  constructor(
    texture: Texture,
    adjustment: { x: number; y: number } = { x: 0, y: 0 },
    opts: TileOpts = {}
  ) {
    super(texture, opts);
    this.adjustment = adjustment;
  }

  setTransform(x: number, y: number): this {
    const newX = x + this.adjustment.x;
    const newY = y + this.adjustment.y;
    return super.setTransform(newX, newY);
  }
}

interface DoorOpts {
  downFacing?: boolean;
  shorterCollision?: boolean;
}

export function crossTileDoorTiles(
  loadNextRoom: RoomLoader,
  doorTextures: Texture[],
  opts: DoorOpts = {}
): [Tile, Tile, Tile, Tile] {
  const [
    firstBackOfDoorTexture,
    secondBackOfDoorTexture,
    firstEnterDoorTexture,
    secondEnterDoorTexture,
    firstOpenDoorTexture,
    secondOpenDoorTexture,
  ] = doorTextures;
  const firstBackOfDoorTile = new Tile(firstBackOfDoorTexture, {
    collisionShape: FIRST_TILE_COLLISION,
  });
  const secondBackOfDoorTile = new Tile(secondBackOfDoorTexture, {
    collisionShape: SECOND_TILE_COLLISION,
  });
  const firstEnterTileCollision = !opts.shorterCollision
    ? FIRST_TILE_COLLISION
    : opts.downFacing
    ? FIRST_ENTER_TILE_COLLISION_SHORTER_DOWN_FACING
    : FIRST_ENTER_TILE_COLLISION_SHORTER;
  const secondEnterTileCollision = !opts.shorterCollision
    ? SECOND_TILE_COLLISION
    : opts.downFacing
    ? SECOND_ENTER_TILE_COLLISION_SHORTER_DOWN_FACING
    : SECOND_ENTER_TILE_COLLISION_SHORTER;
  const firstEnterDoorTile = new Tile(firstEnterDoorTexture, {
    collisionShape: firstEnterTileCollision,
  });
  const secondEnterDoorTile = new Tile(secondEnterDoorTexture, {
    collisionShape: secondEnterTileCollision,
  });
  if (firstOpenDoorTexture && secondOpenDoorTexture) {
    let open = false;
    const updateOnOverlap = function (
      this: Tile,
      link: Link,
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

  const transition = function (
    this: Tile,
    link: Link,
    globalX: number,
    globalY: number
  ): void {
    // Down facing doors require Link to be at the bottom of the door
    if (opts.downFacing) {
      const localY = globalY - this.y;
      if (localY < 15) {
        return;
      }
    }
    link.startDoorTransition(loadNextRoom);
  };

  firstBackOfDoorTile.updateOnOverlap = transition;
  secondBackOfDoorTile.updateOnOverlap = transition;

  const firstBackOfDoorForegroundTexture = firstBackOfDoorTexture.clone();
  const secondBackOfDoorForegroundTexture = secondBackOfDoorTexture.clone();
  if (opts.downFacing) {
    [
      firstBackOfDoorForegroundTexture,
      secondBackOfDoorForegroundTexture,
    ].forEach((texture) => {
      texture.frame.height = 8;
      texture.frame.y += 8;
      texture.updateUvs();
    });
    firstBackOfDoorTile.foregroundTile = new ForegroundTile(
      firstBackOfDoorForegroundTexture,
      { x: 0, y: 8 },
      { halfHeight: true }
    );
    secondBackOfDoorTile.foregroundTile = new ForegroundTile(
      secondBackOfDoorForegroundTexture,
      { x: 0, y: 8 },
      { halfHeight: true }
    );
  } else {
    firstBackOfDoorTile.foregroundTile = new ForegroundTile(
      firstBackOfDoorForegroundTexture
    );
    secondBackOfDoorTile.foregroundTile = new ForegroundTile(
      secondBackOfDoorForegroundTexture
    );
  }

  return [
    firstEnterDoorTile,
    secondEnterDoorTile,
    firstBackOfDoorTile,
    secondBackOfDoorTile,
  ];
}
