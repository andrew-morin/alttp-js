import { Container, DisplayObject, Point, Rectangle } from "pixi.js";
import Tile from "tiles/Tile";
import { Link } from "./Link";

function detectCollisionHelper(
  link: Link,
  pointsToCheck: Point[],
  tilesToCheck: DisplayObject[]
): [Tile | undefined, Rectangle | undefined, boolean[]] {
  const collidedPoints = new Array(pointsToCheck.length).fill(false);
  let collidedTile;
  let collidedShape;
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
      const maybeCollidedShape = tile.collidesWithPoint(point);
      if (maybeCollidedShape) {
        collidedPoints[index] = true;
        collidedTile = tile;
        collidedShape = maybeCollidedShape;
      }
    });
  });
  return [collidedTile, collidedShape, collidedPoints];
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
  background: Container,
  isPush?: boolean
): [number, number] {
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
    const [collidedTile, collidedShape, collidedPoints] = detectCollisionHelper(
      link,
      xPointsToCheck,
      background.children
    );
    if (collidedTile && collidedShape) {
      const unitVelocity = vx / Math.abs(vx);
      const halfWidth = collidedShape.width / 2;
      const centerOfTile = collidedTile.x + collidedShape.x + halfWidth;
      newX = centerOfTile + -unitVelocity * (halfWidth + 8);

      if (!isPush && vy === 0 && !collidedPoints[1]) {
        if (collidedPoints[0]) {
          [newX, newY] = detectCollisions(link, 0, -1, background, true);
        } else if (collidedPoints[2]) {
          [newX, newY] = detectCollisions(link, 0, 1, background, true);
        }
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
    const [collidedTile, collidedShape, collidedPoints] = detectCollisionHelper(
      link,
      yPointsToCheck,
      background.children
    );
    if (collidedTile && collidedShape) {
      const unitVelocity = vy / Math.abs(vy);
      const halfHeight = collidedShape.height / 2;
      const centerOfTile = collidedTile.y + collidedShape.y + halfHeight;
      newY = centerOfTile + -unitVelocity * (halfHeight + 8);

      if (!isPush && vx === 0 && !collidedPoints[1]) {
        if (collidedPoints[0] && !collidedPoints[2]) {
          [newX, newY] = detectCollisions(link, -1, 0, background, true);
        } else if (collidedPoints[2] && !collidedPoints[0]) {
          [newX, newY] = detectCollisions(link, 1, 0, background, true);
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
  detectOverlapHelper(link, overlapPointsToCheck, background.children);

  return [newX, newY];
}
