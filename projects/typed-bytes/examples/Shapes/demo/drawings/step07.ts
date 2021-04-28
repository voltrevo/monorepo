import ensureType from "../helpers/ensureType.ts";
import * as shapes from "../shapes.ts";
import colors from "./colors.ts";

const outline = {
  thickness: 3,
  color: colors.black,
};

const fillAlpha = 100;

export default ensureType<shapes.Drawing>()({
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
      outline,
      fill: { ...colors.red, alpha: fillAlpha },
    },
    {
      type: "triangle",
      position: { x: 640, y: 380 },
      sideLength: 100,
      rotation: 30,
      outline,
      fill: { ...colors.green, alpha: fillAlpha },
    },
    {
      type: "square",
      position: { x: 640, y: 400 },
      sideLength: 100,
      rotation: 45,
      outline,
      fill: { ...colors.blue, alpha: fillAlpha },
    },
  ],
});
