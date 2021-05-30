## Step 6: Tell Shapes Apart

Let's add a `type` field to each shape to fix this:

```diff
 const Circle = tb.Object({
+  type: tb.Exact("circle"),

 const Triangle = tb.Object({
+  type: tb.Exact("triangle"),

 const Square = tb.Object({
+  type: tb.Exact("square"),
```

Upon doing this, TypeScript detects that the shapes we pass to the `show`
function are now incorrect 🤘.

After fixing that, [`step06.ts`](./step06.ts) outputs almost Exactly the same
thing:

```diff
 Uint8Array(4) [ 0, 0, 0, 100 ]     // Circle
 Uint8Array(5) [ 1, 0, 0, 100, 60 ] // Triangle
-Uint8Array(5) [ 1, 0, 0, 100, 90 ] // Triangle (oops)
+Uint8Array(5) [ 2, 0, 0, 100, 90 ] // Square
-{ position: { x: 0, y: 0 }, sideLength: 100, rotation: 45 }
+{ type: "square", position: { x: 0, y: 0 }, sideLength: 100, rotation: 45 }
```

Ta da 🎉. That fixed the problem. Our square is now a square.

![Drawing](./drawing.png)

There's more though - the encoding didn't actually change. The `type` field
takes up *zero space*. Why? Well, a `tb.Exact` can only encode one thing, which
means it represents zero information.

Thinking of it another way, when the decoder encounters a `tb.Exact`, it already
knows what the value is, so it doesn't need to consume any bytes to figure that
out.

For example:

```ts
console.log(new Uint8Array(
  tb.Exact("hello").encode("hello")
));
// Uint8Array(0) []

console.log(
  tb.Exact("hello").decode(new Uint8Array(0)),
);
// hello
```

## [Step 7: Colors!](../step07/README.md)
