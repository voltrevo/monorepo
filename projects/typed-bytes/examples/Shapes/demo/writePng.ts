import render from "./render.ts";
import * as shapes from "./shapes.ts";

const drawing: shapes.Drawing = {
  canvas: { width: 1280, height: 720 },
  shapes: [
    {
      type: "circle",
      position: { x: 640, y: 360 },
      radius: 100,
    },
    {
      type: "circle",
      position: { x: 640, y: 380 },
      radius: 80,
    },
    {
      type: "circle",
      position: { x: 640, y: 400 },
      radius: 60,
    },
  ],
};

await Deno.writeFile("./drawing.png", render(drawing));
