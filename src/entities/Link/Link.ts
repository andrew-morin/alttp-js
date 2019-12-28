import {Container, AnimatedSprite, Loader, Spritesheet} from 'pixi.js';
import {contain, Keyboard} from '../../index';

const cardinal = 1.5;
const diagonal = 1.0;

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
  animationSpeed: number;
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
      const movement = vx === 0 || vy === 0 ? cardinal : diagonal;

      this.updatePosition(movement, vx, vy);
      contain(this, background);
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

  updatePosition(movement: number, vx: number, vy: number): void {
    const speed = Math.floor(movement);
    const subpixel = movement % 1;
    const [finalVx, xSub] = this.updateVelocityAndSubpixel(this.xSub, subpixel * vx, speed * vx);
    const [finalVy, ySub] = this.updateVelocityAndSubpixel(this.ySub, subpixel * vy, speed * vy);
    this.x += finalVx;
    this.xSub = xSub;
    this.y += finalVy;
    this.ySub = ySub;
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
