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
    fractal: {
      type: "recursive",
      depth: 25,
      shape: [
        {
          type: "regular-polygon",
          sides: 5,
          position: { x: 0, y: 0 },
          radius: 300,
          rotation: 0,
          outline: null,
          fill: colors.cyan,
        },
        {
          type: "regular-polygon",
          sides: 5,
          position: { x: 0, y: 0 },
          radius: 270,
          rotation: 10,
          outline: null,
          fill: colors.black,
        },
        {
          type: "transformer",
          origin: { x: 0, y: 0 },
          rotate: 20,
          scale: [46, 57],
          shape: "fractal",
        },
      ],
    },
  },
  shape: {
    type: "transformer",
    origin: { x: 640, y: 360 + 25 },
    rotate: null,
    scale: null,
    shape: "fractal",
  },
});
