import type Stream from "./Stream.ts";
import type { Decoder, Encoder } from "./types.ts";

export default class BufferStream implements Stream {
  private offset = 0;
  private length = 0;

  constructor(private buffer = new ArrayBuffer(0)) {}

  private ensureCapacity(neededCapacity: number) {
    if (neededCapacity > this.buffer.byteLength) {
      let newCapacity = Math.max(1, this.buffer.byteLength * 2);

      while (newCapacity < neededCapacity) {
        newCapacity *= 2;
      }

      const newBuffer = new ArrayBuffer(newCapacity);
      new Uint8Array(newBuffer).set(new Uint8Array(this.buffer), 0);

      this.buffer = newBuffer;
    }
  }

  private prepareOffset(newOffset: number) {
    if (newOffset > this.length) {
      this.ensureCapacity(newOffset);
      this.length = newOffset;
    }
  }

  readBuffer(sz: number) {
    const newOffset = this.offset + sz;
    this.prepareOffset(newOffset);

    const result = this.buffer.slice(this.offset, newOffset);
    this.offset = newOffset;

    return result;
  }

  writeBuffer(buffer: ArrayBuffer) {
    const newOffset = this.offset + buffer.byteLength;
    this.prepareOffset(newOffset);

    new Uint8Array(this.buffer).set(new Uint8Array(buffer), this.offset);
    this.offset = newOffset;
  }

  readByte() {
    this.prepareOffset(this.offset + 1);

    const result = new Uint8Array(this.buffer)[this.offset];
    this.offset++;

    return result;
  }

  writeByte(value: number) {
    this.prepareOffset(this.offset + 1);

    new Uint8Array(this.buffer)[this.offset] = value;
    this.offset++;
  }

  getOffset() {
    return this.offset;
  }

  setOffset(offset: number) {
    this.ensureCapacity(offset);
    this.offset = offset;
  }

  getLength() {
    return this.length;
  }

  get() {
    return this.buffer.slice(0, this.length);
  }

  read<T>(decoder: Decoder<T>): T {
    return decoder.decode(this);
  }

  write<T>(encoder: Encoder<T>, value: T) {
    encoder.encode(this, value);
  }
}
