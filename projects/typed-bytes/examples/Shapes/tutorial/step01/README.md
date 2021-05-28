## Step 1: Size

Let's start with the size of the canvas:

```ts
const Canvas = tb.object({
  width: tb.number,
  height: tb.number,
});

const buffer = Canvas.encode({ width: 1280, height: 720 });

console.log(buffer); /*
  64, 148,   0, 0, 0, 0, 0, 0, // 1280
  64, 134, 128, 0, 0, 0, 0, 0, //  720
*/
```

## [Step 2: Use `size` for Size](../step02/README.md)
