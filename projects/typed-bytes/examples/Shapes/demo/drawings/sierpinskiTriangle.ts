import ensureType from "../helpers/ensureType.ts";
import * as shapes from "../shapes.ts";
import colors from "./colors.ts";

export default ensureType<shapes.Drawing>()({
  canvas: {
    width: 1280,
    height: 720,
    background: null,
  },
  registry: {
    mainTriangle: {
      type: "regular-polygon",
      sides: 3,
      position: { x: 0, y: 0 },
      radius: 300,
      rotation: 0,
      outline: null,
      fill: colors.black,
    },
    fractal: {
      type: "recursive",
      depth: 6,
      shape: [
        {
          type: "regular-polygon",
          sides: 3,
          position: { x: 0, y: 0 },
          radius: 150,
          rotation: 180,
          outline: null,
          fill: colors.white,
        },
        {
          type: "transformer",
          origin: { x: 0, y: -150 },
          rotate: 0,
          scale: [1, 2],
          shape: "fractal",
        },
        {
          type: "transformer",
          origin: { x: 130, y: 75 },
          rotate: 120,
          scale: [1, 2],
          shape: "fractal",
        },
        {
          type: "transformer",
          origin: { x: -130, y: 75 },
          rotate: 240,
          scale: [1, 2],
          shape: "fractal",
        },
      ],
    },
  },
  shape: {
    type: "transformer",
    origin: { x: 640, y: 360 + 65 },
    rotate: null,
    scale: null,
    shape: [
      "mainTriangle",
      "fractal",
    ],
  },
});
