import render from "./render.ts";
import * as shapes from "./shapes.ts";
import ensureType from "./helpers/ensureType.ts";

const colors = ensureType<Record<string, shapes.Color>>()({
  black: { red: 0, green: 0, blue: 0, alpha: 255 },
  red: { red: 255, green: 0, blue: 0, alpha: 255 },
  green: { red: 0, green: 255, blue: 0, alpha: 255 },
  blue: { red: 0, green: 0, blue: 255, alpha: 255 },
  halfGrey: { red: 128, green: 128, blue: 128, alpha: 128 },
});

const drawing: shapes.Drawing = {
  canvas: {
    width: 1280,
    height: 720,
    background: colors.halfGrey,
  },
  shapes: [
    {
      type: "circle",
      position: { x: 640, y: 360 },
      radius: 100,
      outline: {
        thickness: 3,
        color: colors.black,
      },
      fill: colors.red,
    },
    {
      type: "circle",
      position: { x: 640, y: 380 },
      radius: 80,
      outline: {
        thickness: 3,
        color: colors.black,
      },
      fill: colors.green,
    },
    {
      type: "circle",
      position: { x: 640, y: 460 },
      radius: 60,
      outline: null,
      fill: { ...colors.blue, alpha: 128 },
    },
    {
      type: "square",
      position: { x: 50, y: 50 },
      sideLength: 50,
      rotation: 5,
      outline: {
        thickness: 3,
        color: colors.black,
      },
      fill: colors.blue,
    },
  ],
};

await Deno.writeFile("./drawing.png", render(drawing));
