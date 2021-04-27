import * as tb from "../../../../mod.ts";

const Color = tb.object({
  red: tb.byte,
  green: tb.byte,
  blue: tb.byte,
  alpha: tb.byte,
});

const red = { red: 255, green: 0, blue: 0, alpha: 255 };
const green = { red: 0, green: 255, blue: 0, alpha: 255 };
const blue = { red: 0, green: 0, blue: 255, alpha: 255 };
const halfGrey = { red: 128, green: 128, blue: 128, alpha: 128 };

const Canvas = tb.object({
  width: tb.size,
  height: tb.size,
  background: Color,
});

const Position = tb.object({
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

const Square = tb.object({
  type: tb.exact("square"),
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
  ...outlineAndFill,
});

const Shape = tb.union(Circle, Triangle, Square);
type Shape = tb.TypeOf<typeof Shape>;

const blackOutline = {
  color: { red: 0, green: 0, blue: 0, alpha: 255 },
  thickness: 3,
};

const circles: Circle[] = [
  {
    type: "circle",
    position: { x: 640, y: 360 },
    radius: 100,
    outline: blackOutline,
    fill: red,
  },
  {
    type: "circle",
    position: { x: 640, y: 380 },
    radius: 80,
    outline: blackOutline,
    fill: green,
  },
  {
    type: "circle",
    position: { x: 640, y: 400 },
    radius: 60,
    outline: null,
    fill: blue,
  },
];

const Drawing = tb.object({
  canvas: Canvas,
  shapes: tb.array(Shape),
});

type Drawing = tb.TypeOf<typeof Drawing>;

const drawing: Drawing = {
  canvas: { width: 1280, height: 720, background: halfGrey },
  shapes: circles,
};

console.log(new Uint8Array(tb.encodeBuffer(Drawing, drawing))); /*
  // Canvas
    128,  10,
    208,   5,
    128, 128, 128, 128,

  // 3 shapes
      3,

  // Shape
      0,                     // Option 0: Circle
    128,  10, 208,   5, 100, // Position, radius
      1,                     // Outline presnt
           0,   0,   0, 255, // Black
           3,                // Thickness 3
      1, 255,   0,   0, 255, // Fill red

  // Shape
      0,                     // Option 0: Circle
    128,  10, 248,   5,  80, // Position, radius
      1,                     // Outline presnt
           0,   0,   0, 255, // Black
           3,                // Thickness 3
      1,   0, 255,   0, 255, // Fill green

  // Shape
      0,                     // Option 0: Circle
    128, 10, 160,    6,  60, // Position, radius
      0,                     // Outline absent
      1,   0,  0, 255,  255, // Fill blue
*/
