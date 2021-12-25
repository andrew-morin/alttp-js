import {
  AnimatedSprite,
  Container,
  DisplayObject,
  Loader,
  Point,
  Rectangle,
  Spritesheet,
} from "pixi.js";
import invariant from "invariant";
import Tile from "tiles/Tile";
import { Keyboard, StartDoorTransitionFn } from "../../index";

enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

enum Action {
  STAND = "stand",
  WALK = "walk",
}

interface LinkState {
  action: Action;
  direction: Direction;
}

export class Link extends AnimatedSprite {
  startDoorTransition: StartDoorTransitionFn;
  xSub: number;
  ySub: number;
  spritesheet: Spritesheet | undefined;
  state: LinkState;

  constructor(startDoorTransition: StartDoorTransitionFn) {
    const linkMovementSheet =
      Loader.shared.resources["assets/textures/link/LinkMovement.json"]
        .spritesheet;
    const standDownTexture =
      linkMovementSheet?.textures[`${Action.STAND}_${Direction.DOWN}.png`];
    invariant(standDownTexture, "Missing Link Texture");
    super([standDownTexture]);
    this.startDoorTransition = startDoorTransition;

    // AnimatedSprite fields
    this.animationSpeed = 1 / 2;
    this.updateAnchor = true;

    // Link fields
    this.xSub = 0;
    this.ySub = 0;
    this.spritesheet = linkMovementSheet;
    this.state = {
      action: Action.STAND,
      direction: Direction.DOWN,
    };
  }

  updateSprite(keyboard: Keyboard, background: Container): void {
    const { left, right, up, down, directionChange } = keyboard;
    const { direction } = this.state;
    const vx = right.pressed ? 1 : left.pressed ? -1 : 0;
    const vy = down.pressed ? 1 : up.pressed ? -1 : 0;
    const moving = vx !== 0 || vy !== 0;
    const newAction = moving ? Action.WALK : Action.STAND;
    const newDirection = this.getNewDirection(
      directionChange,
      vx,
      vy,
      direction
    );
    const newState = {
      action: newAction,
      direction: newDirection,
    };

    // Reset subpixels when direction has changed
    if (directionChange) {
      this.xSub = 0;
      this.ySub = 0;
    }

    // Update textures if Link has changed direction or action
    if (this.hasLinkStateChanged(this.state, newState)) {
      this.state = newState;
      if (newAction === Action.WALK) {
        const walkTexture =
          this.spritesheet?.animations[`${Action.WALK}_${newDirection}`];
        invariant(walkTexture, "Missing Link Texture");
        this.textures = walkTexture;
        this.play();
      } else if (newAction === Action.STAND) {
        const standTexture =
          this.spritesheet?.textures[`${Action.STAND}_${newDirection}.png`];
        invariant(standTexture, "Missing Link Texture");
        this.textures = [standTexture];
      }
    }

    // Only update link if he's moving
    if (moving) {
      let cardinal = 0;
      let diagonal = 0;
      const standingTile = background.children.find((tile) => {
        if (tile instanceof Tile) {
          return tile.overlapsWithPoint(this.getGlobalPosition());
        }
        return false;
      });
      if (standingTile instanceof Tile) {
        ({ cardinal, diagonal } = standingTile.linkMovement);
      }
      const movement = vx === 0 || vy === 0 ? cardinal : diagonal;

      this.updatePosition(movement, vx, vy, background);
      this.contain(background);
    }
  }

  hasLinkStateChanged(oldState: LinkState, newState: LinkState): boolean {
    return (
      oldState.action !== newState.action ||
      oldState.direction !== newState.direction
    );
  }

  shouldUpdateHorizDirection(vy: number, direction: Direction): boolean {
    return (
      vy === 0 ||
      (vy === 1 && Direction.DOWN !== direction) ||
      (vy === -1 && Direction.UP !== direction)
    );
  }

  getNewDirection(
    directionChange: boolean,
    vx: number,
    vy: number,
    direction: Direction
  ): Direction {
    if (directionChange && (vx !== 0 || vy !== 0)) {
      switch (vx) {
        case 0:
          return vy === 1 ? Direction.DOWN : Direction.UP;
        case 1:
          if (this.shouldUpdateHorizDirection(vy, direction)) {
            return Direction.RIGHT;
          }
          break;
        case -1:
          if (this.shouldUpdateHorizDirection(vy, direction)) {
            return Direction.LEFT;
          }
          break;
      }
    }

    return direction;
  }

  updateVelocityAndSubpixel(
    subpixel: number,
    subpixelChange: number,
    velocity: number
  ): [number, number] {
    let newSubpixel = subpixel + subpixelChange;
    const update = Math.floor(newSubpixel);
    if (update !== 0) {
      newSubpixel = subpixel - update;
      return [velocity + update, newSubpixel];
    }
    return [velocity, newSubpixel];
  }

  updatePosition(
    movement: number,
    vx: number,
    vy: number,
    background: Container
  ): void {
    const speed = Math.floor(movement);
    const subpixel = movement % 1;
    const [finalVx, xSub] = this.updateVelocityAndSubpixel(
      this.xSub,
      subpixel * vx,
      speed * vx
    );
    const [finalVy, ySub] = this.updateVelocityAndSubpixel(
      this.ySub,
      subpixel * vy,
      speed * vy
    );
    const [newX, newY] = this.detectCollisions(finalVx, finalVy, background);
    this.x = newX;
    this.xSub = xSub;
    this.y = newY;
    this.ySub = ySub;
  }

  detectCollisions(
    vx: number,
    vy: number,
    background: Container
  ): [number, number] {
    const linkRow = Math.floor(this.y / 16);
    const rowsToCheck = [linkRow - 1, linkRow, linkRow + 1];
    const linkCol = Math.floor(this.x / 16);
    const colsToCheck = [linkCol - 1, linkCol, linkCol + 1];
    const tilesPerRow = Math.floor(background.width / 16);
    const tilesToCheck: DisplayObject[] = [];
    rowsToCheck.forEach((row) => {
      colsToCheck.forEach((col) => {
        const index = row * tilesPerRow + col;
        if (index >= 0 && index < background.children.length) {
          tilesToCheck.push(background.getChildAt(index));
        }
      });
    });
    let newX = this.x + vx,
      newY = this.y + vy;
    let xPointsToCheck: Point[] | undefined;
    if (vx > 0) {
      xPointsToCheck = [
        new Point(newX + 8, this.y + 7),
        new Point(newX + 8, this.y),
        new Point(newX + 8, this.y - 8),
      ];
    } else if (vx < 0) {
      xPointsToCheck = [
        new Point(newX - 8, this.y + 7),
        new Point(newX - 8, this.y),
        new Point(newX - 8, this.y - 8),
      ];
    }
    if (xPointsToCheck) {
      const [collidedTile, collidedPoints] = this.detectCollisionHelper(
        xPointsToCheck,
        tilesToCheck
      );
      if (collidedTile) {
        const unitVelocity = vx / Math.abs(vx);
        const collisionShape = collidedTile.collisionShape as Rectangle;
        const halfWidth = collisionShape.width / 2;
        const centerOfTile = collidedTile.x + collisionShape.x + halfWidth;
        newX = centerOfTile + -unitVelocity * (halfWidth + 8);
      }

      if (vy === 0 && !collidedPoints[1]) {
        if (collidedPoints[0]) {
          newY -= 1;
        } else if (collidedPoints[2]) {
          newY += 1;
        }
      }
    }
    let yPointsToCheck: Point[] | undefined;
    if (vy > 0) {
      yPointsToCheck = [
        new Point(newX + 7, newY + 8),
        new Point(newX, newY + 8),
        new Point(newX - 8, newY + 8),
      ];
    } else if (vy < 0) {
      yPointsToCheck = [
        new Point(newX + 7, newY - 8),
        new Point(newX, newY - 8),
        new Point(newX - 8, newY - 8),
      ];
    }
    if (yPointsToCheck) {
      const [collidedTile, collidedPoints] = this.detectCollisionHelper(
        yPointsToCheck,
        tilesToCheck
      );
      if (collidedTile) {
        const unitVelocity = vy / Math.abs(vy);
        const collisionShape = collidedTile.collisionShape as Rectangle;
        const halfHeight = collisionShape.height / 2;
        const centerOfTile = collidedTile.y + collisionShape.y + halfHeight;
        newY = centerOfTile + -unitVelocity * (halfHeight + 8);

        if (vx === 0 && !collidedPoints[1]) {
          if (collidedPoints[0]) {
            newX -= 1;
          } else if (collidedPoints[2]) {
            newX += 1;
          }
        }
      }
    }

    return [newX, newY];
  }

  detectCollisionHelper(
    pointsToCheck: Point[],
    tilesToCheck: DisplayObject[]
  ): [Tile | undefined, boolean[]] {
    const collidedPoints = new Array(pointsToCheck.length).fill(false);
    let collidedTile;
    tilesToCheck.forEach((child) => {
      const tile = child as Tile;
      if (
        tile.x > this.x + 9 ||
        tile.x < this.x - 25 ||
        tile.y > this.y + 9 ||
        tile.y < this.y - 25
      ) {
        return;
      }
      pointsToCheck.forEach((point, index) => {
        if (tile.collidesWithPoint(point)) {
          tile.updateOnCollision(this.startDoorTransition);
          collidedPoints[index] = true;
          collidedTile = tile;
        } else if (tile.overlapsWithPoint(point)) {
          tile.updateOnOverlap(point);
        }
      });
    });
    return [collidedTile, collidedPoints];
  }

  contain(background: Container): void {
    if (this.x < 8) {
      this.x = 8;
    }
    if (this.y < 8) {
      this.y = 8;
    }
    if (this.x > background.width - 9) {
      this.x = background.width - 9;
    }
    if (this.y > background.height - 9) {
      this.y = background.height - 9;
    }
  }
}

let link: Link;
export function getLink(startDoorTransition: StartDoorTransitionFn): Link {
  if (link) {
    return link;
  }
  link = new Link(startDoorTransition);
  link.play();

  return link;
}
