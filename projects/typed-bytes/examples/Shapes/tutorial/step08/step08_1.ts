import * as tb from "../../../../mod.ts";

const Color = tb.Object({
  red: tb.byte,
  green: tb.byte,
  blue: tb.byte,
  alpha: tb.byte,
});

const black = { red: 0, green: 0, blue: 0, alpha: 255 };
const red = { red: 255, green: 0, blue: 0, alpha: 255 };
const white = { red: 255, green: 255, blue: 255, alpha: 255 };

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

const shapes: Shape[] = [
  // chimney

  // Only have squares so I'm making a rectangle using three
  {
    type: "square",
    position: { x: 640 + 25, y: 360 - 128 },
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
    position: { x: 640 + 25, y: 360 - 139 },
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
    position: { x: 640 + 25, y: 360 - 149 },
    sideLength: 16,
    rotation: 0,
    outline: {
      thickness: 1,
      color: black,
    },
    fill: { red: 100, green: 50, blue: 0, alpha: 255 },
  },

  // I needed the outline so I'm using a third square to cover up the line in
  // between the two squares above
  {
    type: "square",
    position: { x: 640 + 25, y: 360 - 136 },
    sideLength: 14,
    rotation: 0,
    outline: null,
    fill: { red: 100, green: 50, blue: 0, alpha: 255 },
  },

  // house
  // main
  {
    type: "square",
    position: { x: 640, y: 360 - 50 },
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
    position: { x: 640, y: 360 - 125 },
    sideLength: 100,
    rotation: 0,
    outline: {
      thickness: 3,
      color: black,
    },
    fill: { red: 255, green: 180, blue: 50, alpha: 255 },
  },

  // door

  // Only have squares so I'm making a rectangle using two
  {
    type: "square",
    position: { x: 640, y: 360 - 14 },
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
    position: { x: 640, y: 360 - 35 },
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
    position: { x: 640, y: 360 - 20 },
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
    position: { x: 640 - 7, y: 360 - 22 },
    radius: 2,
    outline: null,
    fill: black,
  },

  // windows

  // Left
  {
    type: "square",
    position: { x: 640 - 23, y: 360 - 73 },
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
    position: { x: 640 - 30, y: 360 - 80 },
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
    position: { x: 640 - 16, y: 360 - 66 },
    sideLength: 15,
    rotation: 0,
    outline: {
      thickness: 1,
      color: black,
    },
    fill: white,
  },

  // Right
  {
    type: "square",
    position: { x: 640 + 23, y: 360 - 73 },
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
    position: { x: 640 + 16, y: 360 - 80 },
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
    position: { x: 640 + 30, y: 360 - 66 },
    sideLength: 15,
    rotation: 0,
    outline: {
      thickness: 1,
      color: black,
    },
    fill: white,
  },

  // smoke

  {
    type: "circle",
    position: { x: 640 + 30, y: 360 - 170 },
    radius: 8,
    outline: null,
    fill: { red: 255, green: 255, blue: 255, alpha: 200 },
  },
  {
    type: "circle",
    position: { x: 640 + 38, y: 360 - 181 },
    radius: 12,
    outline: null,
    fill: { red: 255, green: 255, blue: 255, alpha: 150 },
  },
  {
    type: "circle",
    position: { x: 640 + 52, y: 360 - 188 },
    radius: 16,
    outline: null,
    fill: { red: 255, green: 255, blue: 255, alpha: 100 },
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

console.log(Drawing.encode(drawing));
