import type Stream from "./Stream.ts";
import type { Bicoder } from "./types.ts";

export default class BufferStream implements Stream {
  private offset = 0;
  private length: number;

  constructor(private buffer = new Uint8Array(0)) {
    this.length = buffer.length;
  }

  private ensureCapacity(neededCapacity: number) {
    if (neededCapacity > this.buffer.length) {
      let newCapacity = Math.max(1, this.buffer.length * 2);

      while (newCapacity < neededCapacity) {
        newCapacity *= 2;
      }

      const newBuffer = new Uint8Array(newCapacity);
      newBuffer.set(this.buffer, 0);

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

    const result = this.buffer.subarray(this.offset, newOffset);
    this.offset = newOffset;

    return result;
  }

  writeBuffer(buffer: Uint8Array) {
    const newOffset = this.offset + buffer.length;
    this.prepareOffset(newOffset);

    this.buffer.set(buffer, this.offset);
    this.offset = newOffset;
  }

  readByte() {
    this.prepareOffset(this.offset + 1);

    const result = this.buffer[this.offset];
    this.offset++;

    return result;
  }

  writeByte(value: number) {
    this.prepareOffset(this.offset + 1);

    this.buffer[this.offset] = value;
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
    return this.buffer.subarray(0, this.length);
  }

  read<T>(bicoder: Bicoder<T>): T {
    return bicoder.decode(this);
  }

  write<T>(bicoder: Bicoder<T>, value: T) {
    bicoder.encode(this, value);
  }
}
