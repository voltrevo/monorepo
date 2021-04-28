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
    w: [
      {
        type: "square",
        position: { x: 0, y: 0 },
        sideLength: 30,
        rotation: 0,
        outline: {
          thickness: 1,
          color: colors.black,
        },
        fill: colors.white,
      },
      {
        type: "square",
        position: { x: -7, y: -7 },
        sideLength: 15,
        rotation: 0,
        outline: {
          thickness: 1,
          color: colors.black,
        },
        fill: colors.white,
      },
      {
        type: "square",
        position: { x: 7, y: 7 },
        sideLength: 15,
        rotation: 0,
        outline: {
          thickness: 1,
          color: colors.black,
        },
        fill: colors.white,
      },
    ],
  },
  shape: {
    type: "transformer",
    origin: { x: 640, y: 360 },
    rotate: null,
    scale: null,
    shape: [ // Only have squares so I'm making a rectangle using three
      {
        type: "square",
        position: { x: 25, y: -128 },
        sideLength: 16,
        rotation: 0,
        outline: {
          thickness: 1,
          color: colors.black,
        },
        fill: { red: 100, green: 50, blue: 0, alpha: 255 },
      },
      {
        type: "square",
        position: { x: 25, y: -139 },
        sideLength: 16,
        rotation: 0,
        outline: {
          thickness: 1,
          color: colors.black,
        },
        fill: { red: 100, green: 50, blue: 0, alpha: 255 },
      },
      {
        type: "square",
        position: { x: 25, y: -149 },
        sideLength: 16,
        rotation: 0,
        outline: {
          thickness: 1,
          color: colors.black,
        },
        fill: { red: 100, green: 50, blue: 0, alpha: 255 },
      },

      // I needed the outline so I'm using a third square to cover up the line
      // in between the two squares above
      {
        type: "square",
        position: { x: 25, y: -136 },
        sideLength: 14,
        rotation: 0,
        outline: null,
        fill: { red: 100, green: 50, blue: 0, alpha: 255 },
      },
      {
        type: "circle",
        position: { x: 30, y: -170 },
        radius: 8,
        outline: null,
        fill: { red: 255, green: 255, blue: 255, alpha: 200 },
      },
      {
        type: "circle",
        position: { x: 38, y: -181 },
        radius: 12,
        outline: null,
        fill: { red: 255, green: 255, blue: 255, alpha: 150 },
      },
      {
        type: "circle",
        position: { x: 52, y: -188 },
        radius: 16,
        outline: null,
        fill: { red: 255, green: 255, blue: 255, alpha: 100 },
      },
      // main
      {
        type: "square",
        position: { x: 0, y: -50 },
        sideLength: 100,
        rotation: 0,
        outline: {
          thickness: 3,
          color: colors.black,
        },
        fill: { red: 255, green: 255, blue: 0, alpha: 255 },
      },
      // roof
      {
        type: "triangle",
        position: { x: 0, y: -125 },
        sideLength: 100,
        rotation: 0,
        outline: {
          thickness: 3,
          color: colors.black,
        },
        fill: { red: 255, green: 180, blue: 50, alpha: 255 },
      },
      // Only have squares so I'm making a rectangle using two
      {
        type: "square",
        position: { x: 0, y: -14 },
        sideLength: 24,
        rotation: 0,
        outline: {
          thickness: 1,
          color: colors.black,
        },
        fill: colors.red,
      },
      {
        type: "square",
        position: { x: 0, y: -35 },
        sideLength: 24,
        rotation: 0,
        outline: {
          thickness: 1,
          color: colors.black,
        },
        fill: colors.red,
      },

      // I needed the outline so I'm using a third square to cover up the line in
      // between the two squares above
      {
        type: "square",
        position: { x: 0, y: -20 },
        sideLength: 22,
        rotation: 0,
        outline: null,
        fill: colors.red,
      },

      // Handle
      {
        // Because there's no anti-aliasing (yet?) an r=2 circle actually renders
        // as a square hah
        type: "circle",
        position: { x: -7, y: -22 },
        radius: 2,
        outline: null,
        fill: colors.black,
      },

      {
        type: "transformer",
        origin: { x: -23, y: -73 },
        rotate: null,
        scale: null,
        shape: "w",
      },
      {
        type: "transformer",
        origin: { x: 23, y: -73 },
        rotate: null,
        scale: null,
        shape: "w",
      },
    ],
  },
});
