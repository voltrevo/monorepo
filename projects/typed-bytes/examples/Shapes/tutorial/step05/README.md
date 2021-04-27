## Step 5: More Shapes

So, `shapes: tb.array(Circle)` looks a bit strange. We can pull out a definition
of `Shape` like so:

```diff
+const Shape = Circle;
-  shapes: tb.array(Circle),
+  shapes: tb.array(Shape),
```

Now that we have a proper concept of `Shape`, let's add some others:

```ts
const Triangle = tb.object({
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
});

const Square = tb.object({
  position: Position,
  sideLength: tb.size,
  rotation: tb.isize,
});
```

We need to change our definition of `Shape` from just `Circle` to any of
`Circle`, `Triangle`, or `Square`.

Introducing `tb.union`:

```diff
-const Shape = Circle;
+const Shape = tb.union(Circle, Triangle, Square);
```

Let's focus on how individual shapes are encoded for a moment. Let's add a
little helper for that this time:

```ts
function show(shape: Shape) {
  console.log(new Uint8Array(tb.encodeBuffer(Shape, shape)));
}
```

and now:

```ts
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
```

We can see the `tb.union` at work here. Encoding the circle just takes one extra
byte, a `0`, to signal that it is a circle and not one of the other shapes.

However, our square got encoded as a triangle. That's a problem. In fact, even
if it was successfully encoded as a square, when we decode it, it would produce
this:

```ts
console.log(tb.decodeBuffer(Shape, new Uint8Array([
  2,    // Option 2:     Square
  0, 0, // Position:     (0, 0)
  100,  // sideLength:      100
  90,   // rotation:         45
]).buffer)); /* {
  position: { x: 0, y: 0 },
  sideLength: 100,
  rotation: 45,
} */
```

How are we to know this a `Square` and not a `Triangle`? It's there in the
encoding, but that's internal to the encoding, we told the decoder this is the
structure we wanted. There's nothing stopping us from making decoders that
produce ambiguous results.

## [Step 6: Tell Shapes Apart](./step06)
