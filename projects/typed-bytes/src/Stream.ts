import type { Decoder, Encoder } from "./types.ts";

type Stream = {
  readBuffer(sz: number): ArrayBuffer;
  writeBuffer(buffer: ArrayBuffer): void;

  readByte(): number;
  writeByte(value: number): void;

  getOffset(): number;
  setOffset(offset: number): void;

  getLength(): number;

  read<T>(decoder: Decoder<T>): T;
  write<T>(encoder: Encoder<T>, value: T): void;
};

export default Stream;
