# Shapes Example

Suppose we were making graphics application where the user can draw shapes on a
canvas. We want to be able to be able to encode the canvas and its shapes so we
can save it to disk, synchronize it with a remote display, or what-have-you.

Let's start with the size of the canvas:

```ts
const Canvas = tb.object({ width: tb.number, height: tb.number });
const buffer = tb.encodeBuffer(Canvas, { width: 1280, height: 720 });
console.log(new Uint8Array(buffer));
// 64, 148,   0, 0, 0, 0, 0, 0, // 1280
// 64, 134, 128, 0, 0, 0, 0, 0, //  720
```

Hmm there's a lot of zeros in there. Turns out numbers in JavaScript take up 8
bytes because they are based on 64-bit floating point. We're going to be pixel
based, so we're happy with whole numbers. We can replace `tb.number` with
`tb.size` for that:

```diff
-const Canvas = tb.object({ width: tb.number, height: tb.number });
+const Canvas = tb.object({ width: tb.size, height: tb.size });
-// 64, 148,   0, 0, 0, 0, 0, 0, // 1280
-// 64, 134, 128, 0, 0, 0, 0, 0, //  720
+// 128, 10, // 1280
+// 208,  5, //  720
```

Just four bytes! Now we're talking.