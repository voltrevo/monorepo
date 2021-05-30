import * as tb from "../../../mod.ts";

export const Color = tb.Object({
  red: tb.byte,
  green: tb.byte,
  blue: tb.byte,
  alpha: tb.byte,
});

export type Color = tb.TypeOf<typeof Color>;

export const Canvas = tb.Object({
  width: tb.size,
  height: tb.size,
  background: tb.Optional(Color),
});

export type Canvas = tb.TypeOf<typeof Canvas>;

export const Position = tb.Object({
  x: tb.isize, // Note: `isize` is like `size` but it allows negative numbers
  y: tb.isize,
});

const outlineAndFill = {
  outline: tb.Optional(tb.Object({
    color: Color,
    thickness: tb.size,
  })),
  fill: tb.Optional(Color),
};

export type Position = tb.TypeOf<typeof Position>;

export const Circle = tb.Object({
  type: tb.Exact("circle"),
  position: Position,
  radius: tb.size,
  ...outlineAndFill,
});

export type Circle = tb.TypeOf<typeof Circle>;

export const Triangle = tb.Object({
  type: tb.Exact("triangle"),
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
  ...outlineAndFill,
});

export type Triangle = tb.TypeOf<typeof Triangle>;

export const RegularPolygon = tb.Object({
  type: tb.Exact("regular-polygon"),
  sides: tb.size,
  position: Position,
  radius: tb.size,
  rotation: tb.isize,
  ...outlineAndFill,
});

export type RegularPolygon = tb.TypeOf<typeof RegularPolygon>;

export const Square = tb.Object({
  type: tb.Exact("square"),
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

export const MetaShape = tb.Array(ShapeReference);

export const Ratio = tb.Tuple(tb.isize, tb.size);

export const Transformer = tb.Object({
  type: tb.Exact("transformer"),
  origin: tb.Optional(Position),
  rotate: tb.Optional(tb.isize),
  scale: tb.Union(
    tb.null_,
    Ratio,
    tb.Object({
      x: Ratio,
      y: Ratio,
    }),
  ),
  shape: ShapeReference,
});

const Recursive = tb.Object({
  type: tb.Exact("recursive"),
  depth: tb.size,
  shape: ShapeReference,
});

export const Shape = tb.Union(
  Circle,
  Triangle,
  Square,
  RegularPolygon,
  MetaShape,
  Reference,
  Transformer,
  Recursive,
);

export const Drawing = tb.Object({
  canvas: Canvas,
  registry: tb.StringMap(Shape),
  shape: Shape,
});

export type Drawing = tb.TypeOf<typeof Drawing>;
