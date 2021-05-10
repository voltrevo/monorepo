## Step 9: Lots of Houses!

Now we can organise our objects in the registry, e.g.:

```ts
const drawing: Drawing = {
  canvas: {
    width: 1280,
    height: 720,
    background: null,
  },
  registry: {
    ...
    house: [
      "chimney",
      "houseFrame",
      "door",
      {
        type: "transformer",
        origin: { x: 0, y: -73 },
        rotate: null,
        scale: null,
        shape: "windowPair",
      },
      "smoke",
    ],
    ...
  },
  shape: "house",
};
```

We could now have multiple houses like this:

```diff
-  shape: "house",
+  shape: ["house", "house", "house"],
```

That would just draw them on top of each other though, so we use a transformer
for each one instead:

```ts
const drawing: Drawing = {
  ...
  shape: [
    "sky",
    {
      type: "transformer",
      origin: { x: 640 + 150, y: 462 },
      rotate: 5,
      scale: null,
      shape: "house",
    },
    "grass",
    {
      type: "transformer",
      origin: { x: 640 - 2 * 150, y: 460 },
      rotate: null,
      scale: null,
      shape: "house",
    },
    {
      type: "transformer",
      origin: { x: 640 - 150, y: 460 },
      rotate: null,
      scale: null,
      shape: "house",
    },
    {
      type: "transformer",
      origin: { x: 640, y: 460 },
      rotate: null,
      scale: [6, 5],
      shape: "house",
    },
    {
      type: "transformer",
      origin: { x: 640 + 2 * 150, y: 460 },
      rotate: null,
      scale: null,
      shape: "house",
    },
  ],
};
```

Ta da:

![Drawing](./drawing.png)

[Source](./step09.ts)

515 bytes.

## [Step 10: Shapes That Loop Into Themselves](../step10/README.md)
