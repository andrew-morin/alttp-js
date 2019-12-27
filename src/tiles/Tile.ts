import {Sprite, Texture} from 'pixi.js';

interface TileLinkMovement {
  cardinal: number;
  diagonal: number;
}

export default class Tile extends Sprite {
  linkMovement: TileLinkMovement;

  constructor(texture: Texture, cardinalSpeed: number, diagonalSpeed: number) {
    super(texture);

    this.linkMovement = {
      cardinal: cardinalSpeed,
      diagonal: diagonalSpeed
    };
  }
}
