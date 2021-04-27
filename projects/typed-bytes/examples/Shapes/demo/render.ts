import * as fastPng from "../../../../deno-ports/fast-png/mod.ts";

import never from "./helpers/never.ts";
import * as shapes from "./shapes.ts";

function SqDist(a: shapes.Position, b: shapes.Position) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function toColorBytes(color: shapes.Color): Uint8Array {
  return Uint8Array.from([color.red, color.green, color.blue, color.alpha]);
}

function rotate(position: shapes.Position, angle: number): shapes.Position {
  const sin = Math.sin(angle / 360 * (2 * Math.PI));
  const cos = Math.cos(angle / 360 * (2 * Math.PI));

  return {
    x: cos * position.x - sin * position.y,
    y: sin * position.x + cos * position.y,
  };
}

export default function render(drawing: shapes.Drawing) {
  const rawSize = 4 * drawing.canvas.width * drawing.canvas.height;
  const data = new Uint8Array(rawSize);
  const bgColorBytes = toColorBytes(drawing.canvas.background);

  // TODO: Loop tiling?
  for (let x = 0; x < drawing.canvas.width; x++) {
    for (let y = 0; y < drawing.canvas.height; y++) {
      const i = 4 * (y * drawing.canvas.width + x);

      data.set(bgColorBytes, i);

      for (const shape of drawing.shapes) {
        switch (shape.type) {
          case "circle": {
            const sqDist = SqDist({ x, y }, shape.position);

            if (sqDist < shape.radius ** 2) {
              if (
                shape.outline !== null &&
                (shape.radius - shape.outline.thickness) ** 2 <= sqDist
              ) {
                data.set(toColorBytes(shape.outline.color), i);
              } else if (shape.fill !== null) {
                data.set(toColorBytes(shape.fill), i);
              }
            }

            break;
          }

          case "triangle": {
            console.log("Not implemented: triangle");
            break;
          }

          case "square": {
            const relPos = rotate(
              {
                x: x - shape.position.x,
                y: y - shape.position.y,
              },
              -shape.rotation,
            );

            const radius = shape.sideLength / 2;

            if (Math.abs(relPos.x) < radius && Math.abs(relPos.y) < radius) {
              if (
                shape.outline !== null &&
                (
                  Math.abs(relPos.x) >= (radius - shape.outline.thickness) ||
                  Math.abs(relPos.y) >= (radius - shape.outline.thickness)
                )
              ) {
                data.set(toColorBytes(shape.outline.color), i);
              } else if (shape.fill !== null) {
                data.set(toColorBytes(shape.fill), i);
              }
            }

            break;
          }

          default:
            never(shape);
        }
      }
    }
  }

  return fastPng.encode({
    width: drawing.canvas.width,
    height: drawing.canvas.height,
    data,
  });
}
