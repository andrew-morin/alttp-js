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
  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  updateOnOverlap: (globalX: number, globalY: number) => void = () => {}
  updateOnCollision: (startDoorTransition: Function) => void = _ => {}
  /* eslint-enable @typescript-eslint/no-empty-function */

  constructor(texture: Texture, solid?: boolean)
  constructor(texture: Texture, collisionShape: Rectangle)
  constructor(texture: Texture, cardinalSpeed: number, diagonalSpeed: number)
  constructor(texture: Texture, solidOrCollisionShapeOrCardinalSpeed?: boolean | Rectangle | number, diagonalSpeed?: number) {
    super(texture);

    if (typeof solidOrCollisionShapeOrCardinalSpeed === 'boolean') {
      this.linkMovement = solidOrCollisionShapeOrCardinalSpeed ? SOLID_LINK_MOVEMENT : DEFAULT_LINK_MOVEMENT;
      this.collisionShape = solidOrCollisionShapeOrCardinalSpeed ? SOLID_COLLISION_SHAPE : undefined;
    } else if (typeof solidOrCollisionShapeOrCardinalSpeed === 'number') {
      this.linkMovement = solidOrCollisionShapeOrCardinalSpeed && diagonalSpeed ? {
        cardinal: solidOrCollisionShapeOrCardinalSpeed,
        diagonal: diagonalSpeed
      } : DEFAULT_LINK_MOVEMENT;
    } else {
      this.linkMovement = DEFAULT_LINK_MOVEMENT;
      this.collisionShape = solidOrCollisionShapeOrCardinalSpeed;
    }
  }

  collidesWithPoint(globalX: number, globalY: number): boolean {
    const localX = globalX - this.x;
    const localY = globalY - this.y;
    if (this.collisionShape) {
      return this.collisionShape.contains(localX, localY);
    }

    return false;
  }

  overlapsWithPoint(globalX: number, globalY: number): boolean {
    const localX = globalX - this.x;
    const localY = globalY - this.y;
    return localX < this.width && localX > 0 &&
      localY < this.height && localY > 0;
  }
}
