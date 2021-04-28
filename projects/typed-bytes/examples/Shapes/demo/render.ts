import * as fastPng from "../../../../deno-ports/fast-png/mod.ts";

import never from "./helpers/never.ts";
import * as shapes from "./shapes.ts";
import * as graphics from "./graphics.ts";

export default function render(drawing: shapes.Drawing) {
  const rawSize = 4 * drawing.canvas.width * drawing.canvas.height;
  const data = new Uint8Array(rawSize);

  // TODO: Loop tiling?
  for (let x = 0; x < drawing.canvas.width; x++) {
    for (let y = 0; y < drawing.canvas.height; y++) {
      const i = 4 * (y * drawing.canvas.width + x);

      let color = drawing.canvas.background;

      for (const shape of drawing.shapes) {
        switch (shape.type) {
          case "circle": {
            const sqDist = graphics.SqDist({ x, y }, shape.position);

            if (sqDist < shape.radius ** 2) {
              if (
                shape.outline !== null &&
                (shape.radius - shape.outline.thickness) ** 2 <= sqDist
              ) {
                color = graphics.blend(color, shape.outline.color);
              } else if (shape.fill !== null) {
                color = graphics.blend(color, shape.fill);
              }
            }

            break;
          }

          case "regular-polygon": {
            const sqDist = graphics.SqDist({ x, y }, shape.position);

            if (sqDist >= shape.radius ** 2) {
              break;
            }

            const containsPoint = graphics.regularPolygonContainsPoint(
              {
                sides: shape.sides,
                center: shape.position,
                rotation: shape.rotation * Math.PI / 180,
                radius: shape.radius,
              },
              { x, y },
            );

            if (!containsPoint) {
              break;
            }

            const computeInOutline = (thickness: number) =>
              graphics.regularPolygonContainsPoint(
                {
                  sides: shape.sides,
                  center: shape.position,
                  rotation: shape.rotation * Math.PI / 180,
                  radius: shape.radius - thickness,
                },
                { x, y },
              );

            if (
              shape.outline !== null &&
              !computeInOutline(shape.outline.thickness)
            ) {
              color = graphics.blend(color, shape.outline.color);
            } else if (shape.fill !== null) {
              color = graphics.blend(color, shape.fill);
            }

            break;
          }

          case "square": {
            const relPos = graphics.rotate(
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
                color = graphics.blend(color, shape.outline.color);
              } else if (shape.fill !== null) {
                color = graphics.blend(color, shape.fill);
              }
            }

            break;
          }

          default:
            never(shape);
        }
      }

      data.set(graphics.toColorBytes(color), i);
    }
  }

  return fastPng.encode({
    width: drawing.canvas.width,
    height: drawing.canvas.height,
    data,
  });
}
