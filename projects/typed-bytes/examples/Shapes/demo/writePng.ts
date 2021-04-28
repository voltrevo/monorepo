import render from "./render.ts";
import * as shapes from "./shapes.ts";
import ensureType from "./helpers/ensureType.ts";

const colors = ensureType<Record<string, shapes.Color>>()({
  black: { red: 0, green: 0, blue: 0, alpha: 255 },
  white: { red: 255, green: 255, blue: 255, alpha: 255 },
  red: { red: 255, green: 0, blue: 0, alpha: 255 },
  green: { red: 0, green: 255, blue: 0, alpha: 255 },
  blue: { red: 0, green: 0, blue: 255, alpha: 255 },
  halfGrey: { red: 128, green: 128, blue: 128, alpha: 128 },
});

const outlineAndFill = {
  outline: {
    thickness: 1,
    color: colors.green,
  },
  fill: null,
};

const drawing: shapes.Drawing = {
  canvas: {
    width: 1280,
    height: 720,
    background: null,
  },
  shapes: [
    {
      type: "circle",
      position: { x: 640, y: 360 },
      radius: 100,
      ...outlineAndFill,
    },
    {
      type: "triangle",
      position: { x: 640, y: 380 },
      sideLength: 100,
      rotation: 30,
      ...outlineAndFill,
    },
    {
      type: "square",
      position: { x: 640, y: 400 },
      sideLength: 100,
      rotation: 45,
      ...outlineAndFill,
    },
  ],
};

await Deno.writeFile("./drawing.png", render(drawing));
