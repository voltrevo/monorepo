import {
  DecoderInputType,
  IDecodedPNG,
  IImageData,
  IPNGDecoderOptions,
  IPNGEncoderOptions,
} from "./types.d.ts";
export * from "./types.d.ts";
declare function decodePNG(
  data: DecoderInputType,
  options?: IPNGDecoderOptions,
): IDecodedPNG;
declare function encodePNG(
  png: IImageData,
  options?: IPNGEncoderOptions,
): Uint8Array;
export { decodePNG as decode, encodePNG as encode };
