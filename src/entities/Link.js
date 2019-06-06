import {Loader, Rectangle, Texture, AnimatedSprite} from 'pixi.js';
import {contain} from '../index';
import linkTexture from '../textures/link.gif';
import linkMovementTexture from '../textures/link.gif';

const cardinal = {
  speed: 1,
  subpixel: 0.5
}

const diagonal = {
  speed: 1,
  subpixel: 0
}

const COLLISION_POINT = {x: 8, y: 20};

let link;
export function getLink() {
  if (link) {
    return link;
  }
  const linkMovementSheet = Loader.shared.resources['link/LinkMovement.json'];
  const standDownTexture = linkMovementSheet['standDown.png'];
  const downStandTexture = Loader.shared.resources[linkTexture].texture;
  const downStandRectangle = new Rectangle(90, 13, 16, 22);
  downStandTexture.frame = downStandRectangle;


  const down1Texture = new Texture(Loader.shared.resources[linkTexture].texture);
  const down1Rectangle = new Rectangle(122, 13, 16, 22);
  down1Texture.frame = down1Rectangle;

  link = new AnimatedSprite([standDownTexture]);
  link.animationSpeed = 1/4;
  link.play();
  link.xSub = 0;
  link.ySub = 0;
  link.update = updateLink;

  return link;
}

function updateLink(keyboard, window, background) {
  // Reset subpixels when input has changed
  if (keyboard.directionChange) {
    link.xSub = 0;
    link.ySub = 0;
  }

  const vx = keyboard.left.pressed ? -1 : keyboard.right.pressed ? 1 : 0;
  const vy = keyboard.up.pressed ? -1 : keyboard.down.pressed ? 1 : 0;

  // Only update link if he's moving
  if (vx !== 0 || vy !== 0) {
    const movement = vx === 0 || vy === 0 ? cardinal : diagonal;

    updatePosition(link, movement, vx, vy);
    contain(link, window);
  }
}

function updatePosition(link, movement, vx, vy) {
  const {speed, subpixel} = movement;
  link.x += speed * vx;
  link.y += speed * vy;
  link.xSub += subpixel * vx;
  link.ySub += subpixel * vy;
  updateSubpixel(link, 'x');
  updateSubpixel(link, 'y');
}

function updateSubpixel(link, coor) {
  const update = Math.floor(link[coor+'Sub']);
  if (update !== 0) {
    link[coor] += update;
    link[coor+'Sub'] -= update;
  }
}
