import {Sprite} from 'pixi.js';

export default class Tile extends Sprite {
  constructor(texture, cardinalSpeed, diagonalSpeed) {
    super(texture);

    this.linkMovement = {
      cardinal: cardinalSpeed,
      diagonal: diagonalSpeed
    }
  }
}