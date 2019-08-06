import {Loader, Rectangle, Texture, AnimatedSprite} from 'pixi.js';
import {contain} from '../index';
import linkTexture from '../assets/textures/link.gif';
import linkMovementTexture from '../assets/textures/link.gif';

const cardinal = {
  speed: 1,
  subpixel: 0.5
}
const diagonal = {
  speed: 1,
  subpixel: 0
}

let link;
export function getLink() {
  if (link) {
    return link;
  }
  const linkMovementSheet = Loader.shared.resources['assets/textures/link/LinkMovement.json'].spritesheet;
  const standDownTexture = linkMovementSheet.textures['standDown.png'];

  link = new AnimatedSprite([standDownTexture]);
  link.animationSpeed = 1/2;
  link.play();

  link.xSub = 0;
  link.ySub = 0;
  link.update = updateLink;

  link.spritesheet = linkMovementSheet;
  // TODO: Move action and direction to enums
  link.state = {
    action: 'stand',
    direction: 'Down'
  };

  return link;
}

function updateLink(keyboard, window, background) {
  const { left, right, up, down, directionChange } = keyboard;
  const { state: { action, direction }} = link;
  const vx = left.pressed ? -1 : right.pressed ? 1 : 0;
  const vy = up.pressed ? -1 : down.pressed ? 1 : 0;
  let newAction = vx !== 0 || vy !== 0 ? 'walk' : 'stand';
  let newDirection = direction;

  if (directionChange && newAction === 'walk') {
    switch (vx) {
      case 0:
        newDirection = vy === 1 ? 'Down' : 'Up';
        break;
      case 1:
        if (vy === 0 || direction === 'Right') {
          newDirection = 'Right'
        }
        if (vy === 1 && 'Down' !== direction || vy === -1 && 'Up' !== direction) {
          newDirection = 'Right'
        }
        break;
      case -1:
        if (vy === 0 || direction === 'Left') {
          newDirection = 'Left'
        }
        if (vy === 1 && 'Down' !== direction || vy === -1 && 'Up' !== direction) {
          newDirection = 'Left'
        }
        break;
    }
  }

  // Reset subpixels and set new textures when direction has changed or action changed
  if (newDirection !== direction || newAction !== action) {
    link.xSub = 0;
    link.ySub = 0;
    link.state = {
      action: newAction,
      direction: newDirection
    };
    if (newAction === 'walk') {
      // TODO: rename textures to snake case, e.g. walk_right
      link.textures = link.spritesheet.animations['walk' + newDirection];
    } else if (newAction === 'stand') {
      link.textures = [link.spritesheet.textures['stand' + newDirection + '.png']];
    }
  }

  // Only update link if he's moving
  if (vx !== 0 || vy !== 0) {
    const movement = vx === 0 || vy === 0 ? cardinal : diagonal;

    updatePosition(link, movement, vx, vy);
    contain(link, window);
  }
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
