import {Application, Container} from 'pixi.js';
import {loadTextures} from './textures';
import {getOutsideUnclesHouse} from './rooms/light-world/OutsideUnclesHouse';
import {getLink} from './entities/Link/Link';

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

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

loadTextures(setup);

//Define variables that might be used in more
//than one function
let state, link, keyboard, gameScene, background, gameOverScene;

function setup() {
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
  id = resources["images/treasureHunter.json"].textures;
  //Dungeon
  dungeon = new Sprite(id["dungeon.png"]);
  gameScene.addChild(dungeon);
  */

  //Create the `gameOver` scene
  gameOverScene = new Container();
  app.stage.addChild(gameOverScene);

  //Make the `gameOver` scene invisible when the game first starts
  gameOverScene.visible = false;

  keyboard = createKeyboard();
  state = play;

  app.ticker.add(delta => gameLoop(delta));
}

function renderRoom(room, gameScene) {
  gameScene.backgroundColor = room.backgroundColor;
  room.tileMap.forEach((row, rowIndex) => {
    const y = rowIndex * 16;
    row.forEach((tile, tileIndex) => {
      if (tile) {
        const x = tileIndex * 16;
        tile.setTransform(x, y);
        gameScene.addChild(tile);
      }
    });
  });
}

function gameLoop(delta){
  //Update the current game state:
  state(delta);

  resetKeyboardToggles(keyboard);
}

// delta unused but may be useful later
// eslint-disable-next-line no-unused-vars
function play(delta) {
  link.updateSprite(keyboard, background);
  updateGameScenePosition();
}

function updateGameScenePosition() {
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

/* Helper functions */
export function contain(sprite, container) {
  const localBounds = sprite.getLocalBounds();
  const x = sprite.x + localBounds.x;
  const y = sprite.y + localBounds.y;
  let collision = undefined;
  //Left
  if (x < container.x) {
    sprite.x = container.x + sprite.anchor.x * sprite.width;
    collision = "left";
  }
  //Top
  if (y < container.y) {
    sprite.y = container.y + sprite.anchor.y * sprite.height;
    collision = "top";
  }
  //Right
  if (x + sprite.width > container.width) {
    sprite.x = container.x + container.width - sprite.width + sprite.anchor.x * sprite.width;
    collision = "right";
  }
  //Bottom
  if (y + sprite.height > container.height) {
    sprite.y = container.y + container.height - sprite.height + sprite.anchor.y * sprite.height;
    collision = "bottom";
  }
  //Return the `collision` value
  return collision;
}

//The `hitTestRectangle` function, unused but may be useful later
// eslint-disable-next-line no-unused-vars
function hitTestRectangle(r1, r2) {
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  //hit will determine whether there's a collision
  hit = false;
  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;
  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;
  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;
  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
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

function createKeyboard() {
  const inputs = {
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
  const keycodes = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  function downHandler(event) {
    const key = inputs[keycodes[event.keyCode]];
    if (key && !key.pressed) {
      key.toggled = inputs.directionChange = true;
      key.pressed = true;
      event.preventDefault();
    }
  }

  function upHandler(event) {
    const key = inputs[keycodes[event.keyCode]];
    if (key && key.pressed) {
      key.toggled = inputs.directionChange = true;
      key.pressed = false;
      event.preventDefault();
    }
  }

  window.addEventListener("keydown", downHandler, false);
  window.addEventListener("keyup", upHandler, false);

  return inputs;
}

function resetKeyboardToggles(keyboard) {
  keyboard.directionChange = false;
  keyboard.left.toggled = false;
  keyboard.up.toggled = false;
  keyboard.right.toggled = false;
  keyboard.down.toggled = false;
}
