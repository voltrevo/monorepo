## Step 10: Shapes That Loop Into Themselves

Now that we have a registry of shapes that can be referred to by name, there's
nothing stopping us from making a shape that references itself:

```ts
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
        shape: "fractal", // <--- fractal draws itself again here
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
```

[Source](./step10_1.ts)

However, when it comes to interpreting this structure to draw an image, we need
to do something to prevent that program from going into infinite recursion.

Because the example above shrinks exponentially during the recursion, we could
implement stopping by ignoring shapes smaller than one pixel. It's a bit dicey
though (e.g. how do you decide whether an infinite structure is smaller than a
pixel?) and won't cover all use cases (e.g. fractals that don't shrink but end
up getting drawn outside the canvas).

Instead, we'll solve this by adding a new shape allowing us to recurse with an
explicit depth limit. This way we can also forbid recursion that doesn't make
use of this tool, so we don't accidentally create a drawing that can never
finish drawing.

```diff
+type Recursive = {
+  type: "recursive";
+  depth: number;
+  shape: Shape;
+};
 
 type Shape = (
   | Circle
   | Triangle
   | Square
   | MetaShape
   | Reference
   | Transformer
+  | Recursive
 );
...
+const Recursive = tb.object({
+  type: tb.exact("recursive"),
+  depth: tb.size,
+  shape: ShapeReference,
+});
 
 const Shape = tb.union(
   Circle,
   Triangle,
   Square,
   MetaShape,
   Reference,
   Transformer,
+  Recursive,
 );
```

Now we can redefine our drawing like so:

```diff
   registry: {
-    fractal: [
+    fractal: {
+      type: "recursive",
+      depth: 20,
+      shape: [
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
-          shape: "fractal", // <--- fractal draws itself again here
+          shape: "fractal", // <--- fractal draws itself as before but this
+                            //      time there's a "recursive" wrapper that
+                            //      lets the renderer know not to go on forever
         },
       ],
     },
+  },
```

[Source](./step10_1.ts)

![Drawing](./drawing.png)

71 bytes.
