import ensureType from "../helpers/ensureType.ts";
import * as shapes from "../shapes.ts";
import * as defaults from "./defaults.ts";

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
      ...defaults.outlineAndFill,
    },
  ],
});
