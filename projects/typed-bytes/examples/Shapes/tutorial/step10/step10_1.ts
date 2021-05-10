import * as tb from "../../../../mod.ts";

const Color = tb.object({
  red: tb.byte,
  green: tb.byte,
  blue: tb.byte,
  alpha: tb.byte,
});

const black = { red: 0, green: 0, blue: 0, alpha: 255 };
const red = { red: 255, green: 0, blue: 0, alpha: 255 };
const white = { red: 255, green: 255, blue: 255, alpha: 255 };

const Canvas = tb.object({
  width: tb.size,
  height: tb.size,
  background: tb.optional(Color),
});

const Position = tb.object({
  x: tb.isize, // Note: `isize` is like `size` but it allows negative numbers
  y: tb.isize,
});

type Position = tb.TypeOf<typeof Position>;

const outlineAndFill = {
  outline: tb.optional(tb.object({
    color: Color,
    thickness: tb.size,
  })),
  fill: tb.optional(Color),
};

const Circle = tb.object({
  type: tb.exact("circle"),
  position: Position,
  radius: tb.size,
  ...outlineAndFill,
});

type Circle = tb.TypeOf<typeof Circle>;

const Triangle = tb.object({
  type: tb.exact("triangle"),
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
  ...outlineAndFill,
});

type Triangle = tb.TypeOf<typeof Triangle>;

const Square = tb.object({
  type: tb.exact("square"),
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

type Shape = (
  | Circle
  | Triangle
  | Square
  | MetaShape
  | Reference
  | Transformer
);

const ShapeReference: tb.Bicoder<Shape> = tb.defer(() => Shape);

const MetaShape = tb.array(ShapeReference);

const Ratio = tb.tuple(tb.isize, tb.size);

const Transformer = tb.object({
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

const Shape = tb.union(
  Circle,
  Triangle,
  Square,
  MetaShape,
  Reference,
  Transformer,
);

const Drawing = tb.object({
  canvas: Canvas,
  registry: tb.stringMap(Shape),
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
    fractal: [
      {
        type: "square",
        position: { x: 0, y: 0 },
        sideLength: 100,
        rotation: 0,
        outline: {
          thickness: 5,
          color: black,
        },
        fill: white,
      },
      {
        type: "transformer",
        origin: { x: 0, y: 100 },
        rotate: 45,
        scale: [4, 5],
        shape: "fractal",
      },
    ],
  },
  shape: {
    type: "transformer",
    origin: { x: 640, y: 360 },
    rotate: null,
    scale: null,
    shape: "fractal",
  },
};

console.log(new Uint8Array(tb.encodeBuffer(Drawing, drawing)));
