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

## [Step 3: Add a Circle](./step03)
