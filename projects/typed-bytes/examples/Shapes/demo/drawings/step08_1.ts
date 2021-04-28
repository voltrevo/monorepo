import ensureType from "../helpers/ensureType.ts";
import * as shapes from "../shapes.ts";
import colors from "./colors.ts";

const entities = ensureType<Record<string, shapes.Shape[]>>()({
  door: [
    // Only have squares so I'm making a rectangle using two
    {
      type: "square",
      position: { x: 640, y: 360 - 14 },
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
      position: { x: 640, y: 360 - 35 },
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
      position: { x: 640, y: 360 - 20 },
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
      position: { x: 640 - 7, y: 360 - 22 },
      radius: 2,
      outline: null,
      fill: colors.black,
    },
  ],
  house: [
    // main
    {
      type: "square",
      position: { x: 640, y: 360 - 50 },
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
      position: { x: 640, y: 360 - 125 },
      sideLength: 100,
      rotation: 0,
      outline: {
        thickness: 3,
        color: colors.black,
      },
      fill: { red: 255, green: 180, blue: 50, alpha: 255 },
    },
  ],
  windows: [
    // Left
    {
      type: "square",
      position: { x: 640 - 23, y: 360 - 73 },
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
      position: { x: 640 - 30, y: 360 - 80 },
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
      position: { x: 640 - 16, y: 360 - 66 },
      sideLength: 15,
      rotation: 0,
      outline: {
        thickness: 1,
        color: colors.black,
      },
      fill: colors.white,
    },

    // Right
    {
      type: "square",
      position: { x: 640 + 23, y: 360 - 73 },
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
      position: { x: 640 + 16, y: 360 - 80 },
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
      position: { x: 640 + 30, y: 360 - 66 },
      sideLength: 15,
      rotation: 0,
      outline: {
        thickness: 1,
        color: colors.black,
      },
      fill: colors.white,
    },
  ],
  chimney: [
    // Only have squares so I'm making a rectangle using three
    {
      type: "square",
      position: { x: 640 + 25, y: 360 - 128 },
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
      position: { x: 640 + 25, y: 360 - 139 },
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
      position: { x: 640 + 25, y: 360 - 149 },
      sideLength: 16,
      rotation: 0,
      outline: {
        thickness: 1,
        color: colors.black,
      },
      fill: { red: 100, green: 50, blue: 0, alpha: 255 },
    },

    // I needed the outline so I'm using a third square to cover up the line in
    // between the two squares above
    {
      type: "square",
      position: { x: 640 + 25, y: 360 - 136 },
      sideLength: 14,
      rotation: 0,
      outline: null,
      fill: { red: 100, green: 50, blue: 0, alpha: 255 },
    },
  ],
  smoke: [
    {
      type: "circle",
      position: { x: 640 + 30, y: 360 - 170 },
      radius: 8,
      outline: null,
      fill: { red: 255, green: 255, blue: 255, alpha: 200 },
    },
    {
      type: "circle",
      position: { x: 640 + 38, y: 360 - 181 },
      radius: 12,
      outline: null,
      fill: { red: 255, green: 255, blue: 255, alpha: 150 },
    },
    {
      type: "circle",
      position: { x: 640 + 52, y: 360 - 188 },
      radius: 16,
      outline: null,
      fill: { red: 255, green: 255, blue: 255, alpha: 100 },
    },
  ],
});

export default ensureType<shapes.Drawing>()({
  canvas: {
    width: 1280,
    height: 720,
    background: null,
  },
  shapes: [
    ...entities.chimney,
    ...entities.house,
    ...entities.door,
    ...entities.windows,
    ...entities.smoke,
  ],
});
