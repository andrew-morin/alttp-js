import {
  Application,
  Container,
  Graphics,
  settings,
  SCALE_MODES,
} from "pixi.js";
import { loadTextures } from "./textures";
import Room, { RoomLoader } from "./rooms/Room";
import Tile from "./tiles/Tile";
import { getOutsideUnclesHouse } from "./rooms/light-world/OutsideUnclesHouse";
import { Link, getLink } from "./entities/Link/Link";

// Set margin and remove padding from document body
const BODY_MARGIN = 8;
document.body.style.setProperty("margin", `${BODY_MARGIN}px`);
document.body.style.setProperty("padding", "0");
document.body.style.setProperty("height", "calc(100vh - 16px)");

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
});

const SCALE = Math.floor(
  Math.min(
    (window.innerHeight - 2 * BODY_MARGIN) / SCREEN_HEIGHT,
    (window.innerWidth - 2 * BODY_MARGIN) / SCREEN_WIDTH
  )
);
app.renderer.resize(SCALE * SCREEN_WIDTH, SCALE * SCREEN_HEIGHT);
app.stage.scale.set(SCALE);

interface Input {
  pressed: boolean;
  toggled: boolean;
}

type KeyDirection = "up" | "down" | "left" | "right";

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
  foreground: Container,
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
      toggled: false,
    },
    up: {
      pressed: false,
      toggled: false,
    },
    right: {
      pressed: false,
      toggled: false,
    },
    down: {
      pressed: false,
      toggled: false,
    },
    directionChange: false,
  };
  const keycodes: { readonly [key: number]: KeyDirection } = {
    37: "left",
    38: "up",
    39: "right",
    40: "down",
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

  window.addEventListener("keydown", downHandler, false);
  window.addEventListener("keyup", upHandler, false);

  return inputs;
}

function renderRoom(room: Room): void {
  let accumulatedHeight = 0;
  room.tileMap.forEach((row: Tile[]) => {
    let accumulatedWidth = 0;
    row.forEach((tile: Tile) => {
      tile.setTransform(accumulatedWidth, accumulatedHeight);
      background.addChild(tile);
      if (tile.foregroundTile) {
        tile.foregroundTile.setTransform(accumulatedWidth, accumulatedHeight);
        foreground.addChild(tile.foregroundTile);
      }
      accumulatedWidth += tile.width;
    });
    accumulatedHeight += row[0].height;
  });
}

let transitionRoomLoader: RoomLoader;
let transitionCounter = 0;
const DOOR_TRANSITION_END = 45;
let transitionGraphics: Graphics;

// delta unused but may be useful later
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function doorTransitionEndState(delta: number): void {
  transitionGraphics.clear();

  if (transitionCounter >= DOOR_TRANSITION_END) {
    state = play;
    transitionCounter = 0;
    return;
  }

  transitionGraphics.beginFill(0x000000);
  transitionGraphics.drawRect(
    -SCREEN_WIDTH,
    -SCREEN_HEIGHT,
    3 * SCREEN_WIDTH,
    3 * SCREEN_HEIGHT
  );
  transitionGraphics.beginHole();
  const width = (SCREEN_WIDTH * transitionCounter) / DOOR_TRANSITION_END + 1;
  const height =
    ((1 / 2) * SCREEN_HEIGHT * transitionCounter) / DOOR_TRANSITION_END + 1;
  transitionGraphics.drawEllipse(link.x, link.y, width, height);
  transitionGraphics.endHole();
  transitionGraphics.endFill();

  transitionCounter++;
}

// delta unused but may be useful later
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function doorTransitionMidState(delta: number): void {
  if (transitionCounter > DOOR_TRANSITION_END) {
    state = doorTransitionEndState;
    transitionCounter = 0;
    background.removeChildren();
    foreground.removeChildren();
    renderRoom(transitionRoomLoader(link));
    updateGameScenePosition();
    return;
  }

  transitionCounter++;
}

// delta unused but may be useful later
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function doorTransitionStartState(delta: number): void {
  transitionGraphics.clear();
  transitionGraphics.beginFill(0x000000);
  transitionGraphics.drawRect(
    -SCREEN_WIDTH,
    -SCREEN_HEIGHT,
    3 * SCREEN_WIDTH,
    3 * SCREEN_HEIGHT
  );

  if (transitionCounter >= DOOR_TRANSITION_END) {
    transitionGraphics.endFill();
    state = doorTransitionMidState;
    transitionCounter = 0;
    return;
  }

  transitionGraphics.beginHole();
  const width =
    SCREEN_WIDTH - (SCREEN_WIDTH * transitionCounter) / DOOR_TRANSITION_END;
  const height =
    (1 / 2) * SCREEN_HEIGHT -
    ((1 / 2) * SCREEN_HEIGHT * transitionCounter) / DOOR_TRANSITION_END;
  transitionGraphics.drawEllipse(link.x, link.y, width, height);
  transitionGraphics.endHole();
  transitionGraphics.endFill();

  transitionCounter++;
}

export type StartDoorTransitionFn = (loadRoom: RoomLoader) => void;

function startDoorTransition(loadRoom: RoomLoader): void {
  transitionRoomLoader = loadRoom;
  state = doorTransitionStartState;
}

function setup(): void {
  //Make the game scene and add it to the stage
  gameScene = new Container();
  background = new Container();
  foreground = new Container();
  app.stage.addChild(gameScene);

  link = getLink(startDoorTransition);
  renderRoom(getOutsideUnclesHouse(link));
  link.x = SCREEN_WIDTH / 2;
  link.y = SCREEN_HEIGHT / 2;
  gameScene.addChild(background, link, foreground);

  //Create the `gameOver` scene
  gameOverScene = new Container();
  app.stage.addChild(gameOverScene);

  //Make the `gameOver` scene invisible when the game first starts
  gameOverScene.visible = false;

  transitionGraphics = new Graphics();
  app.stage.addChild(transitionGraphics);

  keyboard = createKeyboard();
  state = play;

  app.ticker.add((delta: number) => gameLoop(delta));
}

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

const stopButton = document.createElement("button");
stopButton.innerText = "Stop";
stopButton.addEventListener("click", () => {
  if (app.ticker.started) {
    app.ticker.stop();
    stopButton.innerText = "Start";
  } else {
    app.ticker.start();
    stopButton.innerText = "Stop";
  }
});
document.body.appendChild(stopButton);

loadTextures(setup);
