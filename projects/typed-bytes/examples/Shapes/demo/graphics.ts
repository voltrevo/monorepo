import * as shapes from "./shapes.ts";

export function SqDist(a: shapes.Position, b: shapes.Position) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function toColorBytes(color: shapes.Color): Uint8Array {
  return Uint8Array.from([color.red, color.green, color.blue, color.alpha]);
}

export function rotate(
  position: shapes.Position,
  angle: number,
): shapes.Position {
  const sin = Math.sin(angle / 360 * (2 * Math.PI));
  const cos = Math.cos(angle / 360 * (2 * Math.PI));

  return {
    x: cos * position.x - sin * position.y,
    y: sin * position.x + cos * position.y,
  };
}

// Untested
export function polygonContainsPoint(
  polygon: shapes.Position[],
  point: shapes.Position,
) {
  let accumulatedAngle = 0;

  const lastPoint = polygon[polygon.length - 1];
  let angle = Math.atan2(lastPoint.y - point.y, lastPoint.x - point.x);

  for (const polygonPoint of polygon) {
    const newAngle = Math.atan2(
      polygonPoint.y - point.y,
      polygonPoint.x - point.x,
    );

    let angleDiff = newAngle - angle;

    if (Math.abs(angleDiff) > Math.PI) {
      angleDiff -= Math.sign(angleDiff) * Math.PI;
    }

    accumulatedAngle += angleDiff;

    angle = newAngle;
  }

  return Math.abs(accumulatedAngle) > Math.PI;
}

// WIP
export function regularPolygonContainsPoint(
  polygon: {
    sides: number;
    center: shapes.Position;
    rotation: number;
    sideLength: number;
  },
  point: shapes.Position,
) {
  const polygonPoints: shapes.Position[] = [];

  for (let i = 0; i < polygon.sides; i++) {
  }
}
