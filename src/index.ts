import {Application, Container, Rectangle, Sprite, settings, SCALE_MODES} from 'pixi.js';
import {loadTextures} from './textures';
import Room from './rooms/Room';
import Tile from './tiles/Tile';
import {getOutsideUnclesHouse} from './rooms/light-world/OutsideUnclesHouse';
import {Link, getLink} from './entities/Link/Link';

// Set margin and remove padding from document body
const BODY_MARGIN = 8;
document.body.style.setProperty('margin', `${BODY_MARGIN}px`);
document.body.style.setProperty('padding', '0');
document.body.style.setProperty('height', 'calc(100vh - 16px)');

// Disable interpolation when scaling
settings.SCALE_MODE = SCALE_MODES.NEAREST;

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 224;
const HALF_SCREEN_WIDTH = SCREEN_WIDTH / 2;
const HALF_SCREEN_HEIGHT = SCREEN_HEIGHT / 2;

//Create a Pixi Application
const app = new Application({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  antialias: true,
  transparent: false,
});

const SCALE = Math.floor(Math.min((window.innerHeight - 2 * BODY_MARGIN) / SCREEN_HEIGHT, (window.innerWidth - 2 * BODY_MARGIN) / SCREEN_WIDTH));
app.renderer.resize(SCALE * SCREEN_WIDTH, SCALE * SCREEN_HEIGHT);
app.stage.scale.set(SCALE);

interface Input {
  pressed: boolean;
  toggled: boolean;
}

type KeyDirection = 'up' | 'down' | 'left' | 'right';

export interface Keyboard {
  left: Input;
  up: Input;
  right: Input;
  down: Input;
  directionChange: boolean;
}

//Define variables that might be used in more
//than one function
let state: (delta: number) => void,
    link: Link,
    keyboard: Keyboard,
    gameScene: Container,
    background: Container,
    gameOverScene: Container;

function resetKeyboardToggles(keyboard: Keyboard): void {
  keyboard.directionChange = false;
  keyboard.left.toggled = false;
  keyboard.up.toggled = false;
  keyboard.right.toggled = false;
  keyboard.down.toggled = false;
}

function gameLoop(delta: number): void {
  //Update the current game state:
  state(delta);

  resetKeyboardToggles(keyboard);
}

function updateGameScenePosition(): void {
  if (link.x < HALF_SCREEN_WIDTH) {
    gameScene.x = 0;
  } else if (link.x > gameScene.width - HALF_SCREEN_WIDTH) {
    gameScene.x = -(gameScene.width - SCREEN_WIDTH);
  } else {
    gameScene.x = -(link.x - HALF_SCREEN_WIDTH);
  }

  if (link.y < HALF_SCREEN_HEIGHT) {
    gameScene.y = 0;
  } else if (link.y > gameScene.height - HALF_SCREEN_HEIGHT) {
    gameScene.y = -(gameScene.height - SCREEN_HEIGHT);
  } else {
    gameScene.y = -(link.y - HALF_SCREEN_HEIGHT);
  }
}

// delta unused but may be useful later
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function play(delta: number): void {
  link.updateSprite(keyboard, background);
  updateGameScenePosition();
}

function createKeyboard(): Keyboard {
  const inputs: Keyboard = {
    left: {
      pressed: false,
      toggled: false
    },
    up: {
      pressed: false,
      toggled: false
    },
    right: {
      pressed: false,
      toggled: false
    },
    down: {
      pressed: false,
      toggled: false
    },
    directionChange: false
  };
  const keycodes: { readonly [key: number]: KeyDirection } = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  function downHandler(event: KeyboardEvent): void {
    const directionPressed: KeyDirection = keycodes[event.keyCode];
    const key: Input = inputs[directionPressed];
    if (key && !key.pressed) {
      key.toggled = inputs.directionChange = true;
      key.pressed = true;
      event.preventDefault();
    }
  }

  function upHandler(event: KeyboardEvent): void {
    const key = inputs[keycodes[event.keyCode]];
    if (key && key.pressed) {
      key.toggled = inputs.directionChange = true;
      key.pressed = false;
      event.preventDefault();
    }
  }

  window.addEventListener('keydown', downHandler, false);
  window.addEventListener('keyup', upHandler, false);

  return inputs;
}

function renderRoom(room: Room, gameScene: Container): void {
  room.tileMap.forEach((row: Tile[], rowIndex: number) => {
    const y = rowIndex * 16;
    row.forEach((tile: Tile, tileIndex: number) => {
      if (tile) {
        const x = tileIndex * 16;
        tile.setTransform(x, y);
        gameScene.addChild(tile);
      }
    });
  });
}

function setup(): void {
  //Make the game scene and add it to the stage
  gameScene = new Container();
  background = new Container();
  app.stage.addChild(gameScene);

  renderRoom(getOutsideUnclesHouse(), background);
  link = getLink();
  link.x = SCREEN_WIDTH / 2;
  link.y = SCREEN_HEIGHT / 2;
  gameScene.addChild(background, link);

  //Make the sprites and add them to the `gameScene`
  //Create an alias for the texture atlas frame ids
  /* Example
  id = resources['images/treasureHunter.json'].textures;
  //Dungeon
  dungeon = new Sprite(id['dungeon.png']);
  gameScene.addChild(dungeon);
  */

  //Create the `gameOver` scene
  gameOverScene = new Container();
  app.stage.addChild(gameOverScene);

  //Make the `gameOver` scene invisible when the game first starts
  gameOverScene.visible = false;

  keyboard = createKeyboard();
  state = play;

  app.ticker.add((delta: number) => gameLoop(delta));
}

/* Helper functions */
export function contain(sprite: Sprite, container: Container): string | undefined {
  const localBounds = sprite.getLocalBounds();
  const x = sprite.x + localBounds.x;
  const y = sprite.y + localBounds.y;
  let collision = undefined;
  //Left
  if (x < container.x) {
    sprite.x = container.x + sprite.anchor.x * sprite.width;
    collision = 'left';
  }
  //Top
  if (y < container.y) {
    sprite.y = container.y + sprite.anchor.y * sprite.height;
    collision = 'top';
  }
  //Right
  if (x + sprite.width > container.width) {
    sprite.x = container.x + container.width - sprite.width + sprite.anchor.x * sprite.width;
    collision = 'right';
  }
  //Bottom
  if (y + sprite.height > container.height) {
    sprite.y = container.y + container.height - sprite.height + sprite.anchor.y * sprite.height;
    collision = 'bottom';
  }
  //Return the `collision` value
  return collision;
}

export function hitTestRectangle(r1: Rectangle, r2: Rectangle): boolean {
  //hit will determine whether there's a collision
  let hit = false;
  //Find the center points of each sprite
  const r1centerX = r1.x + r1.width / 2;
  const r1centerY = r1.y + r1.height / 2;
  const r2centerX = r2.x + r2.width / 2;
  const r2centerY = r2.y + r2.height / 2;
  //Find the half-widths and half-heights of each sprite
  const r1halfWidth = r1.width / 2;
  const r1halfHeight = r1.height / 2;
  const r2halfWidth = r2.width / 2;
  const r2halfHeight = r2.height / 2;
  //Calculate the distance vector between the sprites
  const vx = r1centerX - r2centerX;
  const vy = r1centerY - r2centerY;
  //Figure out the combined half-widths and half-heights
  const combinedHalfWidths = r1halfWidth + r2halfWidth;
  const combinedHalfHeights = r1halfHeight + r2halfHeight;
  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }
  //`hit` will be either `true` or `false`
  return hit;
}

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

loadTextures(setup);
