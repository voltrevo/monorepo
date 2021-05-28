import type Bicoder from "./Bicoder.ts";

type Stream = {
  readBuffer(sz: number): Uint8Array;
  writeBuffer(buffer: Uint8Array): void;

  readByte(): number;
  writeByte(value: number): void;

  getOffset(): number;
  setOffset(offset: number): void;

  getLength(): number;

  read<T>(bicoder: Bicoder<T>): T;
  write<T>(bicoder: Bicoder<T>, value: T): void;
};

export default Stream;
