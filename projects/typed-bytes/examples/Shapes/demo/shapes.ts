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
  background: tb.optional(Color),
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

export const Triangle = tb.object({
  type: tb.exact("triangle"),
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
  ...outlineAndFill,
});

export type Triangle = tb.TypeOf<typeof Triangle>;

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

export const Reference = tb.string;
export type Reference = tb.TypeOf<typeof Reference>;

export type MetaShape = Shape[];

export type Transformer = {
  type: "transformer";
  origin: null | Position;
  rotate: null | number;
  scale: (
    | null
    | [number, number]
    | { x: [number, number]; y: [number, number] }
  );
  shape: Shape;
};

type Recursive = {
  type: "recursive";
  depth: number;
  shape: Shape;
};

export type Shape = (
  | Circle
  | Triangle
  | Square
  | RegularPolygon
  | MetaShape
  | Reference
  | Transformer
  | Recursive
);

export const ShapeReference: tb.Bicoder<Shape> = tb.defer(() => Shape);

export const MetaShape = tb.array(ShapeReference);

export const Ratio = tb.tuple(tb.isize, tb.size);

export const Transformer = tb.object({
  type: tb.exact("transformer"),
  origin: tb.optional(Position),
  rotate: tb.optional(tb.isize),
  scale: tb.union(
    tb.null_,
    Ratio,
    tb.object({
      x: Ratio,
      y: Ratio,
    }),
  ),
  shape: ShapeReference,
});

const Recursive = tb.object({
  type: tb.exact("recursive"),
  depth: tb.size,
  shape: ShapeReference,
});

export const Shape = tb.union(
  Circle,
  Triangle,
  Square,
  RegularPolygon,
  MetaShape,
  Reference,
  Transformer,
  Recursive,
);

export const Drawing = tb.object({
  canvas: Canvas,
  registry: tb.stringMap(Shape),
  shape: Shape,
});

export type Drawing = tb.TypeOf<typeof Drawing>;
