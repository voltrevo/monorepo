import ensureType from "../helpers/ensureType.ts";
import * as shapes from "../shapes.ts";
import * as defaults from "./defaults.ts";

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
      ...defaults.outlineAndFill,
    },
    {
      type: "triangle",
      position: { x: 640, y: 380 },
      sideLength: 100,
      rotation: 30,
      ...defaults.outlineAndFill,
    },
    {
      type: "triangle",
      position: { x: 640, y: 400 },
      sideLength: 100,
      rotation: 45,
      ...defaults.outlineAndFill,
    },
  ],
});
