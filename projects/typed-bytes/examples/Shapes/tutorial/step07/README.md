## Step 7: Colors!

Green outlines on a transparent background are cool and all, but not as cool as
pretty colors. Let's add `outline` and `fill` so shapes can have different
colors.

First, a definition of `Color`:

```ts
const Color = tb.object({
  red: tb.byte,
  green: tb.byte,
  blue: tb.byte,
  alpha: tb.byte,
});
```

Outline and fill is going to be common to our shapes but I'm not sure what to
call it. Let's just do `outlineAndFill` for now:

```ts
const outlineAndFill = {
  outline: tb.object({
    color: Color,
    thickness: tb.size,
  }),
  fill: Color,
};
```

Now we can add `outline` and `fill` to our shapes:

```diff
 const Circle = tb.object({
   type: tb.exact("circle"),
   position: Position,
   radius: tb.size,
+  ...outlineAndFill,
 });

 const Triangle = tb.object({
   type: tb.exact("triangle"),
   position: Position,
   sideLength: tb.size,
   rotation: tb.isize,
+  ...outlineAndFill,
 });

 const Square = tb.object({
   type: tb.exact("square"),
   position: Position,
   sideLength: tb.size,
   rotation: tb.isize,
+  ...outlineAndFill,
 });
```

![Drawing](./drawing.png)

| Bytes         | Format |
|--------------:|:-------|
|     3,686,400 | raw    |
|       116,886 | .png   |
|          TODO | .svg   |
|           113 | .shape |
