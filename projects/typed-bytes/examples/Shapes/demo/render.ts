import * as fastPng from "../../../../deno-ports/fast-png/mod.ts";

import never from "./helpers/never.ts";
import * as shapes from "./shapes.ts";

function SqDist(a: shapes.Position, b: shapes.Position) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export default function render(drawing: shapes.Drawing) {
  const rawSize = 4 * drawing.canvas.width * drawing.canvas.height;
  const data = new Uint8Array(rawSize);

  // TODO: Filling with white here. Remove this to leave it transparent later
  // when this is easy to implement with shapes.
  data.fill(255);

  const black = Uint8Array.from([0, 0, 0, 255]);

  // TODO: Loop tiling?
  for (let x = 0; x < drawing.canvas.width; x++) {
    for (let y = 0; y < drawing.canvas.height; y++) {
      const i = 4 * (y * drawing.canvas.width + x);

      for (const shape of drawing.shapes) {
        switch (shape.type) {
          case "circle": {
            const sqDist = SqDist({ x, y }, shape.position);

            if (
              (shape.radius - 1) ** 2 <= sqDist &&
              sqDist < shape.radius ** 2
            ) {
              data.set(black, i);
            }

            break;
          }

          case "square": {
            console.log("Not implemented: square");
            break;
          }

          case "triangle": {
            console.log("Not implemented: triangle");
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
