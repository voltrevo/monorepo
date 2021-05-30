import * as tb from "../../../../mod.ts";

const Position = tb.Object({
  x: tb.isize, // Note: `isize` is like `size` but it allows negative numbers
  y: tb.isize,
});

const Circle = tb.Object({
  position: Position,
  radius: tb.size,
});

const Triangle = tb.Object({
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
});

const Square = tb.Object({
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
});

const Shape = tb.Union(Circle, Triangle, Square);
type Shape = tb.TypeOf<typeof Shape>;

function show(shape: Shape) {
  console.log(Shape.encode(shape));
}

// Circle
show({
  position: { x: 0, y: 0 },
  radius: 100,
}); /*
  0,    // Option 0:     Circle
  0, 0, // Position:     (0, 0)
  100,  // Radius:          100
*/

// Triangle
show({
  position: { x: 0, y: 0 },
  sideLength: 100,
  rotation: 30,
}); /*
  1,    // Option 1:   Triangle
  0, 0, // Position:     (0, 0)
  100,  // sideLength:      100
  60,   // rotation:         30
*/

// Square
show({
  position: { x: 0, y: 0 },
  sideLength: 100,
  rotation: 45,
}); /*
  1,    // Option 1:   Triangle (Oops)
  0, 0, // Position:     (0, 0)
  100,  // sideLength:      100
  90,   // rotation:         45
*/

console.log(Shape.decode(
  new Uint8Array([
    [2], //    Option 2:     Square
    [0, 0], // Position:     (0, 0)
    [100], //  sideLength:      100
    [90], //   rotation:         45
  ].flat()),
)); /* {
  position: { x: 0, y: 0 },
  sideLength: 100,
  rotation: 45,
} */
