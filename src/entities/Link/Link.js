import {Loader, AnimatedSprite} from 'pixi.js';
import {contain} from '../../index';

const cardinal = {
  speed: 1,
  subpixel: 0.5
};
const diagonal = {
  speed: 1,
  subpixel: 0
};

const Directions = Object.freeze({
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
});
const Actions = Object.freeze({
  STAND: 'stand',
  WALK: 'walk'
});

class Link extends AnimatedSprite {
  constructor() {
    const linkMovementSheet = Loader.shared.resources['assets/textures/link/LinkMovement.json'].spritesheet;
    const standDownTexture = linkMovementSheet.textures[`${Actions.STAND}_${Directions.DOWN}.png`];
    super([standDownTexture]);
    // AnimatedSprite fields
    this.animationSpeed = 1/2;

    // Link fields
    this.xSub = 0;
    this.ySub = 0;
    this.spritesheet = linkMovementSheet;
    this.state = {
      action: Actions.STAND,
      direction: Directions.DOWN
    };
  }

  updateSprite(keyboard, background) {
    const { left, right, up, down, directionChange } = keyboard;
    const { state } = link;
    const vx = right.pressed ? 1 : left.pressed ? -1 : 0;
    const vy = down.pressed ? 1 : up.pressed ? -1 : 0;
    const moving = vx !== 0 || vy !== 0;
    const newAction = moving ? Actions.WALK : Actions.STAND;
    const newDirection = getNewDirection(directionChange, vx, vy, state.direction);
    const newState = {
      action: newAction,
      direction: newDirection
    };

    // Reset subpixels when direction has changed
    if (directionChange) {
      link.xSub = 0;
      link.ySub = 0;
    }

    // Update textures if Link has changed direction or action
    if (hasLinkStateChanged(state, newState)) {
      link.state = newState;
      if (newAction === Actions.WALK) {
        link.textures = link.spritesheet.animations[`${Actions.WALK}_${newDirection}`];
        link.play();
      } else if (newAction === Actions.STAND) {
        link.textures = [link.spritesheet.textures[`${Actions.STAND}_${newDirection}.png`]];
      }
    }

    // Only update link if he's moving
    if (moving) {
      const movement = vx === 0 || vy === 0 ? cardinal : diagonal;

      updatePosition(link, movement, vx, vy);
      contain(link, background);
    }
  }
}

let link;
export function getLink() {
  if (link) {
    return link;
  }
  link = new Link();
  link.play();

  return link;
}

function hasLinkStateChanged(oldState, newState) {
  return oldState.action !== newState.action || oldState.direction !== newState.direction;
}

function getNewDirection(directionChange, vx, vy, direction) {
  if (directionChange && (vx !== 0 || vy !== 0)) {
    switch (vx) {
      case 0:
        return vy === 1 ? Directions.DOWN : Directions.UP;
      case 1:
        if (shouldUpdateHorizDirection(vy, direction)) {
          return Directions.RIGHT;
        }
        break;
      case -1:
        if (shouldUpdateHorizDirection(vy, direction)) {
          return Directions.LEFT;
        }
        break;
    }
  }

  return direction;
}

function shouldUpdateHorizDirection(vy, direction) {
  return vy === 0 || vy === 1 && Directions.DOWN !== direction || vy === -1 && Directions.UP !== direction;
}

function updatePosition(link, movement, vx, vy) {
  const {speed, subpixel} = movement;
  link.xSub += subpixel * vx;
  link.ySub += subpixel * vy;
  const finalVx = updateSubpixel(link, 'x', speed * vx);
  const finalVy = updateSubpixel(link, 'y', speed * vy);
  link.x += finalVx;
  link.y += finalVy;
}

function updateSubpixel(link, coor, vel) {
  const update = Math.floor(link[coor+'Sub']);
  if (update !== 0) {
    link[coor+'Sub'] -= update;
    return vel + update;
  }
  return vel;
}
