import { RoomBuilder } from '../Room';
import LightWorldGrass from '../../tiles/light-world/LightWorldGrass.js';
import LightWorldField from '../../tiles/light-world/LightWorldField.js';
import { LightWorldBackground } from '../RoomConstants';

let StartingHouse;
export function getStartingHouse() {
  if (!StartingHouse) {
    const builder = new RoomBuilder(LightWorldBackground, 20, 20, LightWorldField);
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j += 2) {
        const y = j + i % 2;
        builder.setTile(i, y, LightWorldGrass());
      }
    }
    StartingHouse = builder.build();
  }
  return StartingHouse;
}
