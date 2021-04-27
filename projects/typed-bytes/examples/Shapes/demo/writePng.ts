import render from "./render.ts";
import * as shapes from "./shapes.ts";

const drawing: shapes.Drawing = {
  canvas: {
    width: 640,
    height: 360,
  },
  shapes: [
    {
      type: "circle",
      position: { x: 100, y: 100 },
      radius: 50,
    },
  ],
};

await Deno.writeFile("./out.png", render(drawing));
