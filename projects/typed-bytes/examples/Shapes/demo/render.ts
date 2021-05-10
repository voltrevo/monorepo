import * as fastPng from "../../../../deno-ports/fast-png/mod.ts";

import never from "./helpers/never.ts";
import * as shapes from "./shapes.ts";
import * as graphics from "./graphics.ts";

type RenderContext = {
  inProgress: Set<string>;
  recursionDepths: Map<unknown, number>;
};

function RenderContext(): RenderContext {
  return {
    inProgress: new Set<string>(),
    recursionDepths: new Map(),
  };
}

export default function render(drawing: shapes.Drawing) {
  const rawSize = 4 * drawing.canvas.width * drawing.canvas.height;
  const data = new Uint8Array(rawSize);

  // TODO: Loop tiling?
  for (let x = 0; x < drawing.canvas.width; x++) {
    for (let y = 0; y < drawing.canvas.height; y++) {
      const i = 4 * (y * drawing.canvas.width + x);

      const checkerFlag = (Math.floor(x / 20) + Math.floor(y / 20)) % 2 === 0;

      let color: shapes.Color | null = {
        red: 128,
        green: 128,
        blue: 128,
        alpha: checkerFlag ? 25 : 0,
      };

      if (drawing.canvas.background !== null) {
        color = graphics.blend(color, drawing.canvas.background);
      }

      color = graphics.blend(
        color,
        renderShape(RenderContext(), drawing, drawing.shape, { x, y }),
      );

      if (color !== null) {
        data.set(graphics.toColorBytes(color), i);
      }
    }
  }

  return fastPng.encode({
    width: drawing.canvas.width,
    height: drawing.canvas.height,
    data,
  });
}

function renderShape(
  rc: RenderContext,
  drawing: shapes.Drawing,
  shape: shapes.Shape,
  position: shapes.Position,
): shapes.Color | null {
  const { x, y } = position;

  if (typeof shape === "string") {
    if (rc.inProgress.has(shape)) {
      throw new Error(`Shape "${shape}" is not allowed to draw itself`);
    }

    const registeredShape = drawing.registry[shape];

    if (registeredShape === undefined) {
      console.error("Shape not found: ", shape);
      return null;
    }

    return renderShape(
      {
        ...rc,
        inProgress: (() => {
          const result = new Set(rc.inProgress);
          result.add(shape);

          return result;
        })(),
      },
      drawing,
      registeredShape,
      position,
    );
  }

  if (Array.isArray(shape)) {
    let color: shapes.Color | null = null;

    for (const s of shape) {
      color = graphics.blend(color, renderShape(rc, drawing, s, position));
    }

    return color;
  }

  switch (shape.type) {
    case "circle": {
      const sqDist = graphics.SqDist(position, shape.position);

      if (sqDist < shape.radius ** 2) {
        if (
          shape.outline !== null &&
          (shape.radius - shape.outline.thickness) ** 2 <= sqDist
        ) {
          return shape.outline.color;
        }

        return shape.fill;
      }

      return null;
    }

    case "triangle": {
      const shapeColor = renderRegularPolygon(
        {
          type: "regular-polygon",
          sides: 3,
          position: shape.position,
          radius: shape.sideLength / (2 * Math.sin(Math.PI / 3)),
          rotation: shape.rotation,
          outline: shape.outline,
          fill: shape.fill,
        },
        x,
        y,
      );

      return shapeColor;
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
          return shape.outline.color;
        }

        return shape.fill;
      }

      return null;
    }

    case "regular-polygon": {
      return renderRegularPolygon(shape, x, y);
    }

    case "transformer": {
      let newPosition = position;

      if (shape.origin !== null) {
        newPosition = {
          x: newPosition.x - shape.origin.x,
          y: newPosition.y - shape.origin.y,
        };
      }

      if (shape.rotate !== null) {
        newPosition = graphics.rotate(newPosition, -shape.rotate);
      }

      if (shape.scale !== null) {
        if (Array.isArray(shape.scale)) {
          // Using the reverse because we're actually transforming the point
          // instead of the shape
          const ratio = shape.scale[1] / shape.scale[0];

          newPosition = {
            x: ratio * newPosition.x,
            y: ratio * newPosition.y,
          };
        } else if ("x" in shape.scale) {
          newPosition = {
            x: shape.scale.x[1] / shape.scale.x[0] * newPosition.x,
            y: shape.scale.y[1] / shape.scale.y[0] * newPosition.y,
          };
        } else {
          never(shape.scale);
        }
      }

      return renderShape(rc, drawing, shape.shape, newPosition);
    }

    case "recursive": {
      const currentDepth = rc.recursionDepths.get(shape) ?? 0;

      if (currentDepth >= shape.depth) {
        return null;
      }

      return renderShape(
        {
          ...rc,
          inProgress: new Set(),
          recursionDepths: (() => {
            const result = new Map(rc.recursionDepths);
            result.set(shape, currentDepth + 1);

            return result;
          })(),
        },
        drawing,
        shape.shape,
        position,
      );
    }

    default:
      never(shape);
  }
}

function renderRegularPolygon(
  shape: shapes.RegularPolygon,
  x: number,
  y: number,
): shapes.Color | null {
  const sqDist = graphics.SqDist({ x, y }, shape.position);

  if (sqDist >= shape.radius ** 2) {
    return null;
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
    return null;
  }

  const computeInOutline = (thickness: number) => {
    // This has to do with the pinch factor that causes the inner radius to
    // contract by more than the line thickness when the interior angles of the
    // polygon are small.
    const adjustedThickness = thickness / (
      Math.sin(0.5 * (shape.sides - 2) / shape.sides * Math.PI)
    );

    return graphics.regularPolygonContainsPoint(
      {
        sides: shape.sides,
        center: shape.position,
        rotation: shape.rotation * Math.PI / 180,
        radius: shape.radius - adjustedThickness,
      },
      { x, y },
    );
  };

  if (
    shape.outline !== null &&
    !computeInOutline(shape.outline.thickness)
  ) {
    return shape.outline.color;
  }

  return shape.fill;
}
