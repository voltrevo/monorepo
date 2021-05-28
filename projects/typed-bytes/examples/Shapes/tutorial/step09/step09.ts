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
    door: [
      // Only have squares so I'm making a rectangle using two
      {
        type: "square",
        position: { x: 0, y: -14 },
        sideLength: 24,
        rotation: 0,
        outline: {
          thickness: 1,
          color: black,
        },
        fill: red,
      },
      {
        type: "square",
        position: { x: 0, y: -35 },
        sideLength: 24,
        rotation: 0,
        outline: {
          thickness: 1,
          color: black,
        },
        fill: red,
      },

      // I needed the outline so I'm using a third square to cover up the line in
      // between the two squares above
      {
        type: "square",
        position: { x: 0, y: -20 },
        sideLength: 22,
        rotation: 0,
        outline: null,
        fill: red,
      },

      // Handle
      {
        // Because there's no anti-aliasing (yet?) an r=2 circle actually renders
        // as a square hah
        type: "circle",
        position: { x: -7, y: -22 },
        radius: 2,
        outline: null,
        fill: black,
      },
    ],
    houseFrame: [
      // main
      {
        type: "square",
        position: { x: 0, y: -50 },
        sideLength: 100,
        rotation: 0,
        outline: {
          thickness: 3,
          color: black,
        },
        fill: { red: 255, green: 255, blue: 0, alpha: 255 },
      },
      // roof
      {
        type: "triangle",
        position: { x: 0, y: -125 },
        sideLength: 100,
        rotation: 0,
        outline: {
          thickness: 3,
          color: black,
        },
        fill: { red: 255, green: 180, blue: 50, alpha: 255 },
      },
    ],
    window: [
      {
        type: "square",
        position: { x: 0, y: 0 },
        sideLength: 30,
        rotation: 0,
        outline: {
          thickness: 1,
          color: black,
        },
        fill: white,
      },
      {
        type: "square",
        position: { x: -7, y: -7 },
        sideLength: 15,
        rotation: 0,
        outline: {
          thickness: 1,
          color: black,
        },
        fill: white,
      },
      {
        type: "square",
        position: { x: 7, y: 7 },
        sideLength: 15,
        rotation: 0,
        outline: {
          thickness: 1,
          color: black,
        },
        fill: white,
      },
    ],
    windowPair: [
      {
        type: "transformer",
        origin: { x: -23, y: 0 },
        rotate: null,
        scale: null,
        shape: "window",
      },
      {
        type: "transformer",
        origin: { x: 23, y: 0 },
        rotate: null,
        scale: null,
        shape: "window",
      },
    ],
    chimney: [
      // Only have squares so I'm making a rectangle using three
      {
        type: "square",
        position: { x: 25, y: -128 },
        sideLength: 16,
        rotation: 0,
        outline: {
          thickness: 1,
          color: black,
        },
        fill: { red: 100, green: 50, blue: 0, alpha: 255 },
      },
      {
        type: "square",
        position: { x: 25, y: -139 },
        sideLength: 16,
        rotation: 0,
        outline: {
          thickness: 1,
          color: black,
        },
        fill: { red: 100, green: 50, blue: 0, alpha: 255 },
      },
      {
        type: "square",
        position: { x: 25, y: -149 },
        sideLength: 16,
        rotation: 0,
        outline: {
          thickness: 1,
          color: black,
        },
        fill: { red: 100, green: 50, blue: 0, alpha: 255 },
      },

      // I needed the outline so I'm using a third square to cover up the line
      // in between the two squares above
      {
        type: "square",
        position: { x: 25, y: -136 },
        sideLength: 14,
        rotation: 0,
        outline: null,
        fill: { red: 100, green: 50, blue: 0, alpha: 255 },
      },
    ],
    smoke: [
      {
        type: "circle",
        position: { x: 30, y: -170 },
        radius: 8,
        outline: null,
        fill: { red: 255, green: 255, blue: 255, alpha: 200 },
      },
      {
        type: "circle",
        position: { x: 38, y: -181 },
        radius: 12,
        outline: null,
        fill: { red: 255, green: 255, blue: 255, alpha: 150 },
      },
      {
        type: "circle",
        position: { x: 52, y: -188 },
        radius: 16,
        outline: null,
        fill: { red: 255, green: 255, blue: 255, alpha: 100 },
      },
    ],
    house: [
      "chimney",
      "houseFrame",
      "door",
      {
        type: "transformer",
        origin: { x: 0, y: -73 },
        rotate: null,
        scale: null,
        shape: "windowPair",
      },
      "smoke",
    ],
    sky: {
      type: "square",
      position: { x: 640, y: 360 },
      sideLength: 2000,
      rotation: 0,
      outline: null,
      fill: { red: 100, green: 150, blue: 255, alpha: 255 },
    },
    grass: {
      type: "square",
      position: { x: 640, y: 1458 },
      sideLength: 2000,
      rotation: 0,
      outline: null,
      fill: { red: 100, green: 255, blue: 150, alpha: 255 },
    },
  },
  shape: [
    "sky",
    {
      type: "transformer",
      origin: { x: 640 + 150, y: 462 },
      rotate: 5,
      scale: null,
      shape: "house",
    },
    "grass",
    {
      type: "transformer",
      origin: { x: 640 - 2 * 150, y: 460 },
      rotate: null,
      scale: null,
      shape: "house",
    },
    {
      type: "transformer",
      origin: { x: 640 - 150, y: 460 },
      rotate: null,
      scale: null,
      shape: "house",
    },
    {
      type: "transformer",
      origin: { x: 640, y: 460 },
      rotate: null,
      scale: [6, 5],
      shape: "house",
    },
    {
      type: "transformer",
      origin: { x: 640 + 2 * 150, y: 460 },
      rotate: null,
      scale: null,
      shape: "house",
    },
  ],
};

console.log(Drawing.encode(drawing));
