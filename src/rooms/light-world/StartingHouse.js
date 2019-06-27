import { RoomBuilder } from '../Room';
import LightWorldGrass from '../../tiles/light-world/LightWorldGrass.js';
import LightWorldField from '../../tiles/light-world/LightWorldField.js';

let StartingHouse;
export function getStartingHouse() {
  if (!StartingHouse) {
    const builder = new RoomBuilder(0x489848, 16, 14, LightWorldField);
    builder.setTile(1, 2, new LightWorldGrass());
    builder.setTile(1, 4, new LightWorldGrass());
    builder.setTile(1, 6, new LightWorldGrass());
    builder.setTile(1, 8, new LightWorldGrass());
    builder.setTile(1, 10, new LightWorldGrass());
    builder.setTile(3, 1, new LightWorldGrass());
    builder.setTile(3, 3, new LightWorldGrass());
    builder.setTile(3, 5, new LightWorldGrass());
    builder.setTile(3, 7, new LightWorldGrass());
    builder.setTile(3, 9, new LightWorldGrass());
    builder.setTile(3, 11, new LightWorldGrass());
    StartingHouse = builder.build();
  }
  return StartingHouse;
}
