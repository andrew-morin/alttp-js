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
import { detectCollisions } from "./collisionDetection";

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
      const linkPosition = this.position;
      const standingTile = background.children.find((tile) => {
        if (tile instanceof Tile) {
          return tile.overlapsWithPoint(linkPosition);
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
    const [newX, newY] = detectCollisions(this, finalVx, finalVy, background);
    this.x = newX;
    this.xSub = xSub;
    this.y = newY;
    this.ySub = ySub;
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
