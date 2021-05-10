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
    position: { x: 640, y: 360 },
    radius: 100,
  },
};
```

These changes are reflected in [`step03.ts`](./step03.ts). Here's the output:

```ts
  128, 10, // width:  1280
  208,  5, // height:  720
  128, 10, // x: 640
  208,  5, // y: 360
  100,     // radius: 100
```

Just five bytes added. And we have a circle, yay:

![Drawing](./drawing.png)

You might be wondering how we can get away with one or two bytes for these
numbers. The reason is that we're using a variable length encoding. Here's a
breakdown of `720`:

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

## [Step 4: Not Just One Circle](../step04/README.md)
