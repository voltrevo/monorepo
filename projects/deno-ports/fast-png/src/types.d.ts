import { IOBuffer } from "../deps/iobuffer/index.d.ts";
import { DeflateFunctionOptions } from "../deps/pako/index.d.ts";
export { DeflateFunctionOptions };
export declare type PNGDataArray = Uint8Array | Uint8ClampedArray | Uint16Array;
export declare type DecoderInputType =
  | IOBuffer
  | ArrayBufferLike
  | ArrayBufferView;
export declare type BitDepth = 1 | 2 | 4 | 8 | 16;
export interface IPNGResolution {
  /**
     * Pixels per unit, X axis
     */
  x: number;
  /**
     * Pixels per unit, Y axis
     */
  y: number;
  /**
     * Unit specifier
     */
  unit: ResolutionUnitSpecifier;
}
export declare enum ResolutionUnitSpecifier {
  /**
     * Unit is unknown
     */
  UNKNOWN = 0,
  /**
     * Unit is the metre
     */
  METRE = 1,
}
export interface IImageData {
  width: number;
  height: number;
  data: PNGDataArray;
  depth?: BitDepth;
  channels?: number;
}
export interface IDecodedPNG {
  width: number;
  height: number;
  data: PNGDataArray;
  depth: BitDepth;
  channels: number;
  text: {
    [key: string]: string;
  };
  resolution?: IPNGResolution;
  palette?: IndexedColors;
}
export interface IPNGDecoderOptions {
  checkCrc?: boolean;
}
export interface IPNGEncoderOptions {
  zlib?: DeflateFunctionOptions;
}
export declare type IndexedColors = number[][];
