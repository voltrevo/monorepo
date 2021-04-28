import * as tb from "../../../mod.ts";

export const Color = tb.object({
  red: tb.byte,
  green: tb.byte,
  blue: tb.byte,
  alpha: tb.byte,
});

export type Color = tb.TypeOf<typeof Color>;

export const Canvas = tb.object({
  width: tb.size,
  height: tb.size,
  background: Color,
});

export type Canvas = tb.TypeOf<typeof Canvas>;

export const Position = tb.object({
  x: tb.isize, // Note: `isize` is like `size` but it allows negative numbers
  y: tb.isize,
});

const outlineAndFill = {
  outline: tb.optional(tb.object({
    color: Color,
    thickness: tb.size,
  })),
  fill: tb.optional(Color),
};

export type Position = tb.TypeOf<typeof Position>;

export const Circle = tb.object({
  type: tb.exact("circle"),
  position: Position,
  radius: tb.size,
  ...outlineAndFill,
});

export type Circle = tb.TypeOf<typeof Circle>;

export const RegularPolygon = tb.object({
  type: tb.exact("regular-polygon"),
  sides: tb.size,
  position: Position,
  radius: tb.size,
  rotation: tb.isize,
  ...outlineAndFill,
});

export type RegularPolygon = tb.TypeOf<typeof RegularPolygon>;

export const Square = tb.object({
  type: tb.exact("square"),
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
  ...outlineAndFill,
});

export type Square = tb.TypeOf<typeof Square>;

export const Shape = tb.union(Circle, RegularPolygon, Square);
export type Shape = tb.TypeOf<typeof Shape>;

export const Drawing = tb.object({
  canvas: Canvas,
  shapes: tb.array(Shape),
});

export type Drawing = tb.TypeOf<typeof Drawing>;
