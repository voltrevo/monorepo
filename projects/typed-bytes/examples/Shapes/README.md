# Shapes Example

Suppose we were making graphics application where the user can draw shapes on a
canvas. We want to be able to be able to encode the canvas and its shapes so we
can save it to disk, synchronize it with a remote display, or what-have-you.

## Step 1: Size

Let's start with the size of the canvas:

```ts
const Canvas = tb.object({
  width: tb.number,
  height: tb.number,
});

const buffer = tb.encodeBuffer(Canvas, { width: 1280, height: 720 });

console.log(new Uint8Array(buffer)); /*
  64, 148,   0, 0, 0, 0, 0, 0, // 1280
  64, 134, 128, 0, 0, 0, 0, 0, //  720
*/
```

## Step 2: Use `size` for Size

Hmm there's a lot of zeros in there. Turns out numbers in JavaScript take up 8
bytes because they are based on 64-bit floating point. We're going to be pixel
based, so we're happy with whole numbers. We can replace `tb.number` with
`tb.size` for that:

```diff
-  width: tb.number,
-  height: tb.number,
+  width: tb.size,
+  height: tb.size,
-// 64, 148,   0, 0, 0, 0, 0, 0, // 1280
-// 64, 134, 128, 0, 0, 0, 0, 0, //  720
+// 128, 10, // 1280
+// 208,  5, //  720
```

Just four bytes! Now we're talking.

## Step 3: Add a Circle

Let's add a shape. We'll start with circles. You like circles, right? I like
circles. Well a circle has a center and a radius, so we can define it like
this:

```ts
const Position = tb.object({
  x: tb.isize, // Note: `isize` is like `size` but it allows negative numbers
  y: tb.isize,
});

const Circle = tb.object({
  position: Position,
  radius: tb.size,
});
```

Also, we now have a `Drawing` that contains the canvas and our circle:

```ts
const Drawing = tb.object({
  canvas: Canvas,
  circle: Circle,
});

type Drawing = tb.TypeOf<typeof Drawing>;
```

For example:

```ts
const drawing: Drawing = {
  canvas: { width: 1280, height: 720 },
  circle: {
    position: { x: 0, y: 0 },
    radius: 100,
  },
};
```

These changes are reflected in [`step03.ts`](./step03.ts). Here's the output:

```ts
  128, 10, // width:  1280
  208,  5, // height:  720
    0,     // x: 0
    0,     // y: 0
  100,     // radius: 100
```

Just three bytes added. One for each new field.

(TODO: Add picture.)

You might be wondering how we can get away with a single byte for these numbers.
The reason is that we're using a variable length encoding. Here's a breakdown
of `720`:

```
Byte (decimal)        208          5
Hex                    d0         05
Binary           11010000   00000101
                 ^[~~~~~]   ^[~~~~~]
                 |   |      |   |
                 |   |      |   101(binary) = 5(decimal)
                 |   |      Leading 0 means this is the last byte
                 |   1010000(binary) = 80(decimal)
                 Leading 1 means we're not finished
```

So the bytes above are broken into the following 7-bit numbers: [80, 5]. In 7
bits we can represent 128 different values, so we're just using base 128. We can
then put these together as:

```
  720 = 80*128^0 + 5*128^1
```

One more wrinkle though - we're all used to the most-significant digit coming
first. For example:

```
  1234 = 1*10^3 + 2*10^2 + 3*10^1 + 4*10^0
```

In our base-128 system, I'm using least-significant digit first. This has the
advantage that we always start from the same place-value (1) and increase from
there - we don't need to know how long the sequence is going to be to start
knowing what the digits mean. I find this more elegant but there are arguments
on both sides 🤷‍♂️🤓.

## Step 4: Not Just One Circle

That's *one* circle. We are not satisfied with that number of circles. We need
an array.

```diff
-  circle: Circle,
+  shapes: tb.array(Circle),
```

This allows us to add our actual circles like this:

```diff
-  circle: {
-    position: { x: 0, y: 0 },
-    radius: 100,
-  },
+  shapes: [
+    {
+      position: { x: 0, y: 0 },
+      radius: 100,
+    },
+    {
+      position: { x: 0, y: 20 },
+      radius: 80,
+    },
+    {
+      position: { x: 0, y: 40 },
+      radius: 60,
+    },
+  ],
```

And the output:

```ts
  128,  10,     // width:  1280
  208,  5,      // height:  720
    3,          // 3 shapes (glad we didn't use 64-bit floats for array lengths)
    0,  0, 100, // Circle at (0,  0), radius: 100
    0, 40,  80, // Circle at (0, 20), radius:  80
    0, 80,  60, // Circle at (0, 40), radius:  60
```

No waste, right?

Notice that the y-coordinate of 20 for the second circle is actually encoded
as 40. This is because we're using `isize`, and allowing for negative numbers
means our positive numbers need to be larger. All the odd numbers are used to
encode negatives.
