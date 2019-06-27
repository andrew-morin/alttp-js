import {Application, Container} from 'pixi.js';
import {loadTextures} from './textures';
import {getStartingHouse} from './rooms/light-world/StartingHouse';
import {getLink} from './entities/Link';

const WIDTH = 256;
const HEIGHT = 224;

//Create a Pixi Application
const app = new Application({
  width: WIDTH,
  height: HEIGHT,
  antialiasing: true,
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
  app.stage.addChild(background, gameScene);

  renderRoom(getStartingHouse(), background);
  link = getLink();
  link.x = background.width / 2;
  link.y = background.height / 2;
  gameScene.addChild(link);

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
    })
  });
}

function gameLoop(delta){
  //Update the current game state:
  state(delta);

  resetKeyboardToggles(keyboard);
}

function play(delta) {
  link.update(keyboard, {x: 0, y: 0, width: WIDTH, height: HEIGHT}, background);
}

/* Helper functions */
export function contain(sprite, container) {
  const bounds = sprite.getBounds()
  let collision = undefined;
  //Left
  if (bounds.x < container.x) {
    sprite.x = container.x + sprite.anchor.x * bounds.width;
    collision = "left";
  }
  //Top
  if (bounds.y < container.y) {
    sprite.y = container.y + sprite.anchor.y * bounds.height;
    collision = "top";
  }
  //Right
  if (bounds.x + bounds.width > container.width) {
    sprite.x = container.x + container.width - bounds.width + sprite.anchor.x * bounds.width;
    collision = "right";
  }
  //Bottom
  if (bounds.y + bounds.height > container.height) {
    sprite.y = container.y + container.height - bounds.height + sprite.anchor.y * bounds.height;
    collision = "bottom";
  }
  //Return the `collision` value
  if (collision) {
    console.log(collision);
  }
  return collision;
}

//The `hitTestRectangle` function
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
  }

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
