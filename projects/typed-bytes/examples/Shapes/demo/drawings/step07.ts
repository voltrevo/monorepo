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
  registry: {},
  shape: [
    {
      type: "circle",
      position: { x: 640, y: 360 },
      radius: 100,
      outline,
      fill: { ...colors.red, alpha: fillAlpha },
    },
    {
      type: "square",
      position: { x: 640, y: 360 },
      sideLength: 100,
      rotation: 0,
      outline,
      fill: { ...colors.blue, alpha: fillAlpha },
    },
    {
      type: "triangle",
      position: { x: 440, y: 360 },
      sideLength: 100,
      rotation: 0,
      outline,
      fill: { ...colors.green, alpha: fillAlpha },
    },
    {
      type: "triangle",
      position: { x: 840, y: 360 },
      sideLength: 100,
      rotation: 0,
      outline,
      fill: { ...colors.green, alpha: fillAlpha },
    },
    {
      type: "triangle",
      position: { x: 640, y: 160 },
      sideLength: 100,
      rotation: 0,
      outline,
      fill: { ...colors.green, alpha: fillAlpha },
    },
    {
      type: "triangle",
      position: { x: 640, y: 560 },
      sideLength: 100,
      rotation: 0,
      outline,
      fill: { ...colors.green, alpha: fillAlpha },
    },
  ],
});
