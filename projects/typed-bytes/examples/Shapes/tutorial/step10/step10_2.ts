import * as tb from "../../../../mod.ts";

const Color = tb.Object({
  red: tb.byte,
  green: tb.byte,
  blue: tb.byte,
  alpha: tb.byte,
});

const black = { red: 0, green: 0, blue: 0, alpha: 255 };
const cyan = { red: 0, green: 255, blue: 255, alpha: 255 };

const Canvas = tb.Object({
  width: tb.size,
  height: tb.size,
  background: tb.Optional(Color),
});

const Position = tb.Object({
  x: tb.isize, // Note: `isize` is like `size` but it allows negative numbers
  y: tb.isize,
});

type Position = tb.TypeOf<typeof Position>;

const outlineAndFill = {
  outline: tb.Optional(tb.Object({
    color: Color,
    thickness: tb.size,
  })),
  fill: tb.Optional(Color),
};

const Circle = tb.Object({
  type: tb.Exact("circle"),
  position: Position,
  radius: tb.size,
  ...outlineAndFill,
});

type Circle = tb.TypeOf<typeof Circle>;

const Triangle = tb.Object({
  type: tb.Exact("triangle"),
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
  ...outlineAndFill,
});

type Triangle = tb.TypeOf<typeof Triangle>;

const Square = tb.Object({
  type: tb.Exact("square"),
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
  ...outlineAndFill,
});

type Square = tb.TypeOf<typeof Square>;

const Reference = tb.string;
type Reference = tb.TypeOf<typeof Reference>;

type MetaShape = Shape[];

type Transformer = {
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

type Shape = (
  | Circle
  | Triangle
  | Square
  | MetaShape
  | Reference
  | Transformer
  | Recursive
);

const ShapeReference: tb.Bicoder<Shape> = tb.defer(() => Shape);

const MetaShape = tb.Array(ShapeReference);

const Ratio = tb.Tuple(tb.isize, tb.size);

const Transformer = tb.Object({
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

const Shape = tb.Union(
  Circle,
  Triangle,
  Square,
  MetaShape,
  Reference,
  Transformer,
  Recursive,
);

const Drawing = tb.Object({
  canvas: Canvas,
  registry: tb.StringMap(Shape),
  shape: Shape,
});

type Drawing = tb.TypeOf<typeof Drawing>;

const drawing: Drawing = {
  canvas: {
    width: 1280,
    height: 720,
    background: null,
  },
  registry: {
    fractal: {
      type: "recursive",
      depth: 20,
      shape: [
        {
          type: "square",
          position: { x: 0, y: 0 },
          sideLength: 200,
          rotation: 0,
          outline: {
            thickness: 5,
            color: black,
          },
          fill: cyan,
        },
        {
          type: "transformer",
          origin: { x: 0, y: 200 },
          rotate: 45,
          scale: [4, 5],
          shape: "fractal",
        },
      ],
    },
  },
  shape: {
    type: "transformer",
    origin: { x: 740, y: 260 },
    rotate: null,
    scale: null,
    shape: "fractal",
  },
};

console.log(Drawing.encode(drawing));
