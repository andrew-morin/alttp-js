import invariant from "invariant";
import { Point, Rectangle, Sprite, Texture } from "pixi.js";
import { Link } from "../entities/Link/Link";

interface TileLinkMovement {
  cardinal: number;
  diagonal: number;
}

const SOLID_LINK_MOVEMENT = {
  cardinal: 0,
  diagonal: 0,
};

const DEFAULT_LINK_MOVEMENT = {
  cardinal: 1.5,
  diagonal: 1,
};

export type TileOpts = {
  solid?: boolean;
  collisionShape?: Rectangle;
  collisionShapes?: Rectangle[];
  cardinalSpeed?: number;
  diagonalSpeed?: number;
  halfHeight?: boolean;
  halfWidth?: boolean;
};

export default class Tile extends Sprite {
  linkMovement: TileLinkMovement;
  collisionShapes: Rectangle[] | undefined;
  foregroundTile: Tile | undefined;
  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  updateOnOverlap: (link: Link, globalX: number, globalY: number) => void =
    () => {};
  /* eslint-enable @typescript-eslint/no-empty-function */

  constructor(texture: Texture, opts: TileOpts = {}) {
    super(texture);

    const width = opts.halfWidth ? 8 : 16;
    const height = opts.halfHeight ? 8 : 16;
    invariant(
      width === texture.width,
      `Incorrect width for Tile. Expected: ${width}, but was: ${texture.width}`
    );
    invariant(
      height === texture.height,
      `Incorrect height for Tile. Expected: ${height}, but was: ${texture.height}`
    );

    if (opts.solid !== undefined) {
      this.linkMovement = opts.solid
        ? SOLID_LINK_MOVEMENT
        : DEFAULT_LINK_MOVEMENT;
      this.collisionShapes = opts.solid
        ? [new Rectangle(0, 0, width, height)]
        : undefined;
    } else {
      this.collisionShapes = opts.collisionShapes
        ? opts.collisionShapes
        : opts.collisionShape
        ? [opts.collisionShape]
        : [];
      if (opts.cardinalSpeed && opts.diagonalSpeed) {
        this.linkMovement = {
          cardinal: opts.cardinalSpeed,
          diagonal: opts.diagonalSpeed,
        };
      } else {
        this.linkMovement = DEFAULT_LINK_MOVEMENT;
      }
    }
  }

  collidesWithPoint(point: Point): Rectangle | undefined {
    const localX = point.x - this.x;
    const localY = point.y - this.y;
    if (this.collisionShapes) {
      return this.collisionShapes.find((shape) =>
        shape.contains(localX, localY)
      );
    }

    return undefined;
  }

  overlapsWithPoint(point: Point): boolean {
    const localX = point.x - this.x;
    const localY = point.y - this.y;
    return (
      localX < this.width && localX >= 0 && localY < this.height && localY >= 0
    );
  }
}
