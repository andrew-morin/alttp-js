import {Container, AnimatedSprite, Loader, Spritesheet} from 'pixi.js';
import Tile from '../../tiles/Tile';
import {Keyboard} from '../../index';

enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

enum Action {
  STAND = 'stand',
  WALK = 'walk'
}

interface LinkState {
  action: Action;
  direction: Direction;
}

export class Link extends AnimatedSprite {
  xSub: number;
  ySub: number;
  spritesheet: Spritesheet | undefined;
  state: LinkState;

  constructor() {
    const linkMovementSheet = Loader.shared.resources['assets/textures/link/LinkMovement.json'].spritesheet;
    const standDownTexture = linkMovementSheet?.textures[`${Action.STAND}_${Direction.DOWN}.png`];
    super([standDownTexture]);
    // AnimatedSprite fields
    this.animationSpeed = 1/2;
    this.updateAnchor = true;

    // Link fields
    this.xSub = 0;
    this.ySub = 0;
    this.spritesheet = linkMovementSheet;
    this.state = {
      action: Action.STAND,
      direction: Direction.DOWN
    };
  }

  updateSprite(keyboard: Keyboard, background: Container): void {
    const { left, right, up, down, directionChange } = keyboard;
    const { direction } = this.state;
    const vx = right.pressed ? 1 : left.pressed ? -1 : 0;
    const vy = down.pressed ? 1 : up.pressed ? -1 : 0;
    const moving = vx !== 0 || vy !== 0;
    const newAction = moving ? Action.WALK : Action.STAND;
    const newDirection = this.getNewDirection(directionChange, vx, vy, direction);
    const newState = {
      action: newAction,
      direction: newDirection
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
        this.textures = this.spritesheet?.animations[`${Action.WALK}_${newDirection}`];
        this.play();
      } else if (newAction === Action.STAND) {
        this.textures = [this.spritesheet?.textures[`${Action.STAND}_${newDirection}.png`]];
      }
    }

    // Only update link if he's moving
    if (moving) {
      let cardinal = 0;
      let diagonal = 0;
      const standingTile = background.children.find(tile => {
        if (tile instanceof Tile) {
          return tile.containsPoint(this.getGlobalPosition());
        }
        return false;
      });
      if (standingTile instanceof Tile) {
        ({cardinal, diagonal} = standingTile.linkMovement);
      }
      const movement = vx === 0 || vy === 0 ? cardinal : diagonal;

      this.updatePosition(movement, vx, vy, background);
      this.contain(background);
    }
  }

  hasLinkStateChanged(oldState: LinkState, newState: LinkState): boolean {
    return oldState.action !== newState.action || oldState.direction !== newState.direction;
  }

  shouldUpdateHorizDirection(vy: number, direction: Direction): boolean {
    return vy === 0 || vy === 1 && Direction.DOWN !== direction || vy === -1 && Direction.UP !== direction;
  }

  getNewDirection(directionChange: boolean, vx: number, vy: number, direction: Direction): Direction {
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

  updateVelocityAndSubpixel(subpixel: number, subpixelChange: number, velocity: number): [number, number] {
    let newSubpixel = subpixel + subpixelChange;
    const update = Math.floor(newSubpixel);
    if (update !== 0) {
      newSubpixel = subpixel - update;
      return [velocity + update, newSubpixel];
    }
    return [velocity, newSubpixel];
  }

  updatePosition(movement: number, vx: number, vy: number, background: Container): void {
    const speed = Math.floor(movement);
    const subpixel = movement % 1;
    const [finalVx, xSub] = this.updateVelocityAndSubpixel(this.xSub, subpixel * vx, speed * vx);
    const [finalVy, ySub] = this.updateVelocityAndSubpixel(this.ySub, subpixel * vy, speed * vy);
    const [newX, newY] = this.detectCollisions(finalVx, finalVy, background);
    this.x = newX;
    this.xSub = xSub;
    this.y = newY;
    this.ySub = ySub;
  }

  detectCollisions(vx: number, vy: number, background: Container): [number, number] {
    let newX = this.x + vx, newY = this.y + vy;
    let xPointsToCheck: [number, number][] | undefined;
    if (vx > 0) {
      xPointsToCheck = [[newX + 8, this.y + 8], [newX + 8, this.y], [newX + 8, this.y - 8]];
    } else if (vx < 0) {
      xPointsToCheck = [[newX - 8, this.y + 8], [newX - 8, this.y], [newX - 8, this.y - 8]];
    }
    if (xPointsToCheck) {
      const collidedTile = this.detectCollisionHelper(xPointsToCheck, background);
      if (collidedTile) {
        const unitVelocity = vx / Math.abs(vx);
        const centerOfTile = collidedTile.x + 8;
        newX = centerOfTile + (-unitVelocity * 16);
      }
    }
    let yPointsToCheck: [number, number][] | undefined;
    if (vy > 0) {
      yPointsToCheck = [[this.x + 8, newY + 8], [this.x, newY + 8], [this.x - 8, newY + 8]];
    } else if (vy < 0) {
      yPointsToCheck = [[this.x + 8, newY - 8], [this.x, newY - 8], [this.x - 8, newY - 8]];
    }
    if (yPointsToCheck) {
      const collidedTile = this.detectCollisionHelper(yPointsToCheck, background);
      if (collidedTile) {
        const unitVelocity = vy / Math.abs(vy);
        const centerOfTile = collidedTile.y + 8;
        newY = centerOfTile + (-unitVelocity * 16);
      }
    }

    return [newX, newY];
  }

  detectCollisionHelper(pointsToCheck: [number, number][], background: Container): Tile | undefined {
    return background.children.find(child => {
      const tile = child as Tile;
      return pointsToCheck.some(point => tile.collidesWithPoint(...point));
    }) as Tile;
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
export function getLink(): Link {
  if (link) {
    return link;
  }
  link = new Link();
  link.play();

  return link;
}
