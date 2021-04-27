import * as tb from "../../../mod.ts";

export const Canvas = tb.object({
  width: tb.size,
  height: tb.size,
});

export type Canvas = tb.TypeOf<typeof Canvas>;

export const Position = tb.object({
  x: tb.isize, // Note: `isize` is like `size` but it allows negative numbers
  y: tb.isize,
});

export type Position = tb.TypeOf<typeof Position>;

export const Circle = tb.object({
  type: tb.exact("circle"),
  position: Position,
  radius: tb.size,
});

export type Circle = tb.TypeOf<typeof Circle>;

export const Triangle = tb.object({
  type: tb.exact("triangle"),
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
});

export type Triangle = tb.TypeOf<typeof Triangle>;

export const Square = tb.object({
  type: tb.exact("square"),
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
});

export type Square = tb.TypeOf<typeof Square>;

export const Shape = tb.union(Circle, Triangle, Square);
export type Shape = tb.TypeOf<typeof Shape>;

export const Drawing = tb.object({
  canvas: Canvas,
  shapes: tb.array(Shape),
});

export type Drawing = tb.TypeOf<typeof Drawing>;
