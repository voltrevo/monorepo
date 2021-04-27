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
