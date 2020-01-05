import {Rectangle, Sprite, Texture} from 'pixi.js';

interface TileLinkMovement {
  cardinal: number;
  diagonal: number;
}

const SOLID_LINK_MOVEMENT = {
  cardinal: 0,
  diagonal: 0
};

const DEFAULT_LINK_MOVEMENT = {
  cardinal: 1.5,
  diagonal: 1
};

const SOLID_COLLISION_SHAPE = new Rectangle(0, 0, 16, 16);

export default class Tile extends Sprite {
  linkMovement: TileLinkMovement;
  collisionShape: Rectangle | undefined;

  constructor(texture: Texture, solid: boolean)
  constructor(texture: Texture, cardinalSpeed: number, diagonalSpeed: number, collisionShape?: Rectangle)
  constructor(texture: Texture, cardinalSpeedOrSolid: number | boolean, diagonalSpeed = 0, collisionShape?: Rectangle) {
    super(texture);

    if (typeof cardinalSpeedOrSolid === 'boolean') {
      this.linkMovement = cardinalSpeedOrSolid ? SOLID_LINK_MOVEMENT : DEFAULT_LINK_MOVEMENT;
      this.collisionShape = cardinalSpeedOrSolid ? SOLID_COLLISION_SHAPE : undefined;
    } else {
      this.linkMovement = {
        cardinal: cardinalSpeedOrSolid,
        diagonal: diagonalSpeed
      };
      this.collisionShape = collisionShape;
    }
  }

  collidesWithPoint(x: number, y: number): boolean {
    if (this.collisionShape) {
      const localX = x - this.x;
      const localY = y - this.y;
      if (this.collisionShape) {
        return this.collisionShape.contains(localX, localY);
      }
    }

    return false;
  }

  updateOnOverlap(): void {}
  updateOnCollision(): void {}
}
