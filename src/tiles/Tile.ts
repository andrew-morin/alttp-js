import {Point, Rectangle, Sprite, Texture} from 'pixi.js';
import { Link } from '../entities/Link/Link';

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

const SOLID_COLLISION_SHAPE = new Rectangle(0, 0, 16, 16);

export type TileOpts = {
  solid?: boolean;
  collisionShape?: Rectangle;
  cardinalSpeed?: number;
  diagonalSpeed?: number;
};

export default class Tile extends Sprite {
  linkMovement: TileLinkMovement;
  collisionShape: Rectangle | undefined;
  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  updateOnOverlap: (link: Link, globalX: number, globalY: number) => void = () => {}
  /* eslint-enable @typescript-eslint/no-empty-function */

  constructor(texture: Texture, opts: TileOpts = {}) {
    super(texture);

    if (opts.solid !== undefined) {
      this.linkMovement = opts.solid
        ? SOLID_LINK_MOVEMENT
        : DEFAULT_LINK_MOVEMENT;
      this.collisionShape = opts.solid ? SOLID_COLLISION_SHAPE : undefined;
    } else if (opts.cardinalSpeed && opts.diagonalSpeed) {
      this.linkMovement = {
        cardinal: opts.cardinalSpeed,
        diagonal: opts.diagonalSpeed,
      };
      this.collisionShape = opts.collisionShape;
    } else {
      this.linkMovement = DEFAULT_LINK_MOVEMENT;
      this.collisionShape = opts.collisionShape;
    }
  }

  collidesWithPoint(point: Point): boolean {
    const localX = point.x - this.x;
    const localY = point.y - this.y;
    if (this.collisionShape) {
      return this.collisionShape.contains(localX, localY);
    }

    return false;
  }

  overlapsWithPoint(point: Point): boolean {
    const localX = point.x - this.x;
    const localY = point.y - this.y;
    return (
      localX < this.width && localX >= 0 && localY < this.height && localY >= 0
    );
  }
}
