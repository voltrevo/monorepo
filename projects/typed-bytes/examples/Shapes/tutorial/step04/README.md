## Step 4: Not Just One Circle

That's *one* circle. We are not satisfied with that number of circles. We need
an array.

```diff
-  circle: Circle,
+  shapes: tb.Array(Circle),
```

This allows us to add our actual circles like this:

```diff
-  circle: {
-    position: { x: 640, y: 360 },
-    radius: 100,
-  },
+  shapes: [
+    {
+      position: { x: 640, y: 360 },
+      radius: 100,
+    },
+    {
+      position: { x: 640, y: 380 },
+      radius: 80,
+    },
+    {
+      position: { x: 640, y: 400 },
+      radius: 60,
+    },
+  ],
```

And the output:

```ts
  128,  10,               // width:  1280
  208,   5,               // height:  720
    3,                    // 3 shapes (glad we didn't use 64-bit floats for
                          // array lengths)
  128,  10, 208,  5, 100, // Circle at (640, 360), radius: 100
  128,  10, 248,  5, 100, // Circle at (640, 380), radius:  80
  128,  10, 160,  6, 100, // Circle at (640, 400), radius:  60
```

No waste, right?

Notice that the y-coordinate of 20 for the second circle is actually encoded
as 40. This is because we're using `isize`, and allowing for negative numbers
means our positive numbers need to be larger. All the odd numbers are used to
encode negatives.

![Drawing](./drawing.png)

## [Step 5: More Shapes](../step05/README.md)
