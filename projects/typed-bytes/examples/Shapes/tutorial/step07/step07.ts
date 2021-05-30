import * as tb from "../../../../mod.ts";

const Color = tb.Object({
  red: tb.byte,
  green: tb.byte,
  blue: tb.byte,
  alpha: tb.byte,
});

const red = { red: 255, green: 0, blue: 0, alpha: 255 };
const green = { red: 0, green: 255, blue: 0, alpha: 255 };
const blue = { red: 0, green: 0, blue: 255, alpha: 255 };

const Canvas = tb.Object({
  width: tb.size,
  height: tb.size,
  background: tb.Optional(Color),
});

const Position = tb.Object({
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

const Square = tb.Object({
  type: tb.Exact("square"),
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
  ...outlineAndFill,
});

const Shape = tb.Union(Circle, Triangle, Square);
type Shape = tb.TypeOf<typeof Shape>;

const outline = {
  color: { red: 0, green: 0, blue: 0, alpha: 255 },
  thickness: 3,
};

const fillAlpha = 100;

const shapes: Shape[] = [
  {
    type: "circle",
    position: { x: 640, y: 360 },
    radius: 100,
    outline,
    fill: { ...red, alpha: fillAlpha },
  },
  {
    type: "square",
    position: { x: 640, y: 360 },
    sideLength: 100,
    rotation: 0,
    outline,
    fill: { ...blue, alpha: fillAlpha },
  },
  {
    type: "triangle",
    position: { x: 440, y: 360 },
    sideLength: 100,
    rotation: 0,
    outline,
    fill: { ...green, alpha: fillAlpha },
  },
  {
    type: "triangle",
    position: { x: 840, y: 360 },
    sideLength: 100,
    rotation: 0,
    outline,
    fill: { ...green, alpha: fillAlpha },
  },
  {
    type: "triangle",
    position: { x: 640, y: 160 },
    sideLength: 100,
    rotation: 0,
    outline,
    fill: { ...green, alpha: fillAlpha },
  },
  {
    type: "triangle",
    position: { x: 640, y: 560 },
    sideLength: 100,
    rotation: 0,
    outline,
    fill: { ...green, alpha: fillAlpha },
  },
];

const Drawing = tb.Object({
  canvas: Canvas,
  shapes: tb.Array(Shape),
});

type Drawing = tb.TypeOf<typeof Drawing>;

const drawing: Drawing = {
  canvas: { width: 1280, height: 720, background: null },
  shapes,
};

console.log(Drawing.encode(drawing)); /*
  // Canvas
  128,  10, 208,   5,   0,

  // 6 Shapes
  6,

  // Circle
    0, 128,  10, 208,   5, 100,
    1,   0,   0,   0, 255,   3,   1, 255,   0,   0, 100,

  // Square
    2, 128,  10, 208,   5, 100,   0,
    1,   0,   0,   0, 255,   3,   1,   0,   0, 255, 100,

  // Triangle
    1, 240,   6, 208,   5, 100,   0,
    1,   0,   0,   0, 255,   3,   1,   0, 255,   0, 100,

  // Triangle
    1, 144,  13, 208,   5, 100,   0,
    1,   0,   0,   0, 255,   3,   1,   0, 255,   0, 100,

  // Triangle
    1, 128,  10, 192,   2, 100,   0,
    1,   0,   0,   0, 255,   3,   1,   0, 255,   0, 100,

  // Triangle
    1, 128,  10, 224,   8, 100,   0,
    1,   0,   0,   0, 255,   3,   1,   0, 255,   0, 100,
*/
