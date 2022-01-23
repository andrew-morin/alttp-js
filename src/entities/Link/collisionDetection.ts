import { Container, DisplayObject, Point, Rectangle } from "pixi.js";
import Tile from "tiles/Tile";
import { Link } from "./Link";

function detectCollisionHelper(
  link: Link,
  pointsToCheck: Point[],
  tilesToCheck: DisplayObject[]
): [Tile | undefined, boolean[]] {
  const collidedPoints = new Array(pointsToCheck.length).fill(false);
  let collidedTile;
  tilesToCheck.forEach((child) => {
    const tile = child as Tile;
    if (
      tile.x > link.x + 9 ||
      tile.x < link.x - 25 ||
      tile.y > link.y + 9 ||
      tile.y < link.y - 25
    ) {
      return;
    }
    pointsToCheck.forEach((point, index) => {
      if (tile.collidesWithPoint(point)) {
        collidedPoints[index] = true;
        collidedTile = tile;
      }
    });
  });
  return [collidedTile, collidedPoints];
}

function detectOverlapHelper(
  link: Link,
  pointsToCheck: Point[],
  tilesToCheck: DisplayObject[]
): void {
  tilesToCheck.forEach((child) => {
    const tile = child as Tile;
    pointsToCheck.forEach((point) => {
      if (tile.overlapsWithPoint(point)) {
        tile.updateOnOverlap(link, point.x, point.y);
      }
    });
  });
}

export function detectCollisions(
  link: Link,
  vx: number,
  vy: number,
  background: Container
): [number, number] {
  const linkRow = Math.floor(link.y / 16);
  const rowsToCheck = [linkRow - 1, linkRow, linkRow + 1];
  const linkCol = Math.floor(link.x / 16);
  const colsToCheck = [linkCol - 1, linkCol, linkCol + 1];
  const tilesPerRow = Math.floor(background.width / 16);
  const tilesToCheck: DisplayObject[] = [];
  rowsToCheck.forEach((row) => {
    colsToCheck.forEach((col) => {
      const index = row * tilesPerRow + col;
      if (index >= 0 && index < background.children.length) {
        tilesToCheck.push(background.getChildAt(index));
      }
    });
  });
  let newX = link.x + vx,
    newY = link.y + vy;
  let xToCheck: number | undefined;
  if (vx > 0) {
    xToCheck = newX + 8;
  } else if (vx < 0) {
    xToCheck = newX - 8;
  }
  if (xToCheck != null) {
    const xPointsToCheck: Point[] = [
      new Point(xToCheck, link.y + 7),
      new Point(xToCheck, link.y),
      new Point(xToCheck, link.y - 8),
    ];
    const [collidedTile, collidedPoints] = detectCollisionHelper(
      link,
      xPointsToCheck,
      tilesToCheck
    );
    if (collidedTile) {
      const unitVelocity = vx / Math.abs(vx);
      const collisionShape = collidedTile.collisionShape as Rectangle;
      const halfWidth = collisionShape.width / 2;
      const centerOfTile = collidedTile.x + collisionShape.x + halfWidth;
      newX = centerOfTile + -unitVelocity * (halfWidth + 8);
    }

    if (vy === 0 && !collidedPoints[1]) {
      if (collidedPoints[0]) {
        newY -= 1;
      } else if (collidedPoints[2]) {
        newY += 1;
      }
    }
  }
  let yToCheck: number | undefined;
  if (vy > 0) {
    yToCheck = newY + 8;
  } else if (vy < 0) {
    yToCheck = newY - 8;
  }
  if (yToCheck != null) {
    const yPointsToCheck: Point[] = [
      new Point(newX + 7, yToCheck),
      new Point(newX, yToCheck),
      new Point(newX - 8, yToCheck),
    ];
    const [collidedTile, collidedPoints] = detectCollisionHelper(
      link,
      yPointsToCheck,
      tilesToCheck
    );
    if (collidedTile) {
      const unitVelocity = vy / Math.abs(vy);
      const collisionShape = collidedTile.collisionShape as Rectangle;
      const halfHeight = collisionShape.height / 2;
      const centerOfTile = collidedTile.y + collisionShape.y + halfHeight;
      newY = centerOfTile + -unitVelocity * (halfHeight + 8);

      if (vx === 0 && !collidedPoints[1]) {
        if (collidedPoints[0]) {
          newX -= 1;
        } else if (collidedPoints[2]) {
          newX += 1;
        }
      }
    }
  }
  const overlapPointsToCheck: Point[] = [
    new Point(newX + 7, newY + 7),
    new Point(newX + 7, newY - 8),
    new Point(newX - 8, newY + 7),
    new Point(newX - 8, newY - 8),
  ];
  detectOverlapHelper(link, overlapPointsToCheck, tilesToCheck);

  return [newX, newY];
}
