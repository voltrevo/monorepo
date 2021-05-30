import * as tb from "../../../../mod.ts";

const Canvas = tb.Object({
  width: tb.size,
  height: tb.size,
});

const Position = tb.Object({
  x: tb.isize, // Note: `isize` is like `size` but it allows negative numbers
  y: tb.isize,
});

const Circle = tb.Object({
  position: Position,
  radius: tb.size,
});

const Drawing = tb.Object({
  canvas: Canvas,
  shapes: tb.Array(Circle),
});

type Drawing = tb.TypeOf<typeof Drawing>;

const drawing: Drawing = {
  canvas: { width: 1280, height: 720 },
  shapes: [
    {
      position: { x: 640, y: 360 },
      radius: 100,
    },
    {
      position: { x: 640, y: 380 },
      radius: 80,
    },
    {
      position: { x: 640, y: 400 },
      radius: 60,
    },
  ],
};

const buffer = Drawing.encode(drawing);

console.log(buffer);
