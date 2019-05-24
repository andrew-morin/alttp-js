import { RoomBuilder } from '../Room';
import LightWorldGrass from '../../tiles/light-world/LightWorldGrass.js';
import LightWorldField from '../../tiles/light-world/LightWorldField.js';

let StartingHouse;
export function getStartingHouse() {
  if (!StartingHouse) {
    const builder = new RoomBuilder(0x489848, 16, 14, LightWorldField);
    builder.setTile(1, 2, new LightWorldGrass());
    StartingHouse = builder.build();
  }
  return StartingHouse;
}
