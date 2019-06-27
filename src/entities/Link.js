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
  link.animationSpeed = 1/4;
  link.play();

  link.xSub = 0;
  link.ySub = 0;
  link.update = updateLink;

  link.spritesheet = linkMovementSheet;
  link.direction = 'Down';

  return link;
}

function updateLink(keyboard, window, background) {
  const vx = keyboard.left.pressed ? -1 : keyboard.right.pressed ? 1 : 0;
  const vy = keyboard.up.pressed ? -1 : keyboard.down.pressed ? 1 : 0;
  // Reset subpixels when input has changed
  if (keyboard.directionChange) {
    link.xSub = 0;
    link.ySub = 0;
    if (vy === 0) {
      if (vx === 0) {
        link.textures = [link.spritesheet.textures['stand' + link.direction + '.png']];
      }
      if (vx === 1) {
        link.textures = link.spritesheet.animations.walkRight;
        link.direction = 'Right';
      } else if (vx === -1) {
        link.textures = link.spritesheet.animations.walkLeft;
        link.direction = 'Left';
      }
    } else if (vy === 1) {
      if (vx === 0 || (vx === -1 && link.direction !== 'Left') || (vx === 1 && link.direction !== 'Right')) {
        link.textures = link.spritesheet.animations.walkDown;
        link.direction = 'Down'
      }
    } else if (vy === -1) {
      if (vx === 0 || (vx === -1 && link.direction !== 'Left') || (vx === 1 && link.direction !== 'Right')) {
        link.textures = link.spritesheet.animations.walkUp;
        link.direction = 'Up'
      }
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
