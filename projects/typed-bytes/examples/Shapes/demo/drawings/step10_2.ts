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
      depth: 20,
      shape: [
        {
          type: "square",
          position: { x: 0, y: 0 },
          sideLength: 200,
          rotation: 0,
          outline: {
            thickness: 5,
            color: colors.black,
          },
          fill: colors.cyan,
        },
        {
          type: "transformer",
          origin: { x: 0, y: 200 },
          rotate: 45,
          scale: [4, 5],
          shape: "fractal",
        },
      ],
    },
  },
  shape: {
    type: "transformer",
    origin: { x: 740, y: 260 },
    rotate: null,
    scale: null,
    shape: "fractal",
  },
});
