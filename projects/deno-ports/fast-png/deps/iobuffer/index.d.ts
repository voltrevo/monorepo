/* Stripped by CDN: <reference types="node" /> */
declare type InputData =
  | number
  | ArrayBufferLike
  | ArrayBufferView
  | IOBuffer;
interface IOBufferOptions {
  /**
     * Ignore the first n bytes of the ArrayBuffer.
     */
  offset?: number;
}
export declare class IOBuffer {
  /**
     * Reference to the internal ArrayBuffer object.
     */
  buffer: ArrayBufferLike;
  /**
     * Byte length of the internal ArrayBuffer.
     */
  byteLength: number;
  /**
     * Byte offset of the internal ArrayBuffer.
     */
  byteOffset: number;
  /**
     * Byte length of the internal ArrayBuffer.
     */
  length: number;
  /**
     * The current offset of the buffer's pointer.
     */
  offset: number;
  private lastWrittenByte;
  private littleEndian;
  private _data;
  private _mark;
  private _marks;
  /**
     * @param data - The data to construct the IOBuffer with.
     * If data is a number, it will be the new buffer's length<br>
     * If data is `undefined`, the buffer will be initialized with a default length of 8Kb<br>
     * If data is an ArrayBuffer, SharedArrayBuffer, an ArrayBufferView (Typed Array), an IOBuffer instance,
     * or a Node.js Buffer, a view will be created over the underlying ArrayBuffer.
     * @param options
     */
  constructor(data?: InputData, options?: IOBufferOptions);
  /**
     * Checks if the memory allocated to the buffer is sufficient to store more
     * bytes after the offset.
     * @param byteLength - The needed memory in bytes.
     * @returns `true` if there is sufficient space and `false` otherwise.
     */
  available(byteLength?: number): boolean;
  /**
     * Check if little-endian mode is used for reading and writing multi-byte
     * values.
     * @returns `true` if little-endian mode is used, `false` otherwise.
     */
  isLittleEndian(): boolean;
  /**
     * Set little-endian mode for reading and writing multi-byte values.
     */
  setLittleEndian(): this;
  /**
     * Check if big-endian mode is used for reading and writing multi-byte values.
     * @returns `true` if big-endian mode is used, `false` otherwise.
     */
  isBigEndian(): boolean;
  /**
     * Switches to big-endian mode for reading and writing multi-byte values.
     */
  setBigEndian(): this;
  /**
     * Move the pointer n bytes forward.
     * @param n - Number of bytes to skip.
     */
  skip(n?: number): this;
  /**
     * Move the pointer to the given offset.
     * @param offset
     */
  seek(offset: number): this;
  /**
     * Store the current pointer offset.
     * @see {@link IOBuffer#reset}
     */
  mark(): this;
  /**
     * Move the pointer back to the last pointer offset set by mark.
     * @see {@link IOBuffer#mark}
     */
  reset(): this;
  /**
     * Push the current pointer offset to the mark stack.
     * @see {@link IOBuffer#popMark}
     */
  pushMark(): this;
  /**
     * Pop the last pointer offset from the mark stack, and set the current
     * pointer offset to the popped value.
     * @see {@link IOBuffer#pushMark}
     */
  popMark(): this;
  /**
     * Move the pointer offset back to 0.
     */
  rewind(): this;
  /**
     * Make sure the buffer has sufficient memory to write a given byteLength at
     * the current pointer offset.
     * If the buffer's memory is insufficient, this method will create a new
     * buffer (a copy) with a length that is twice (byteLength + current offset).
     * @param byteLength
     */
  ensureAvailable(byteLength?: number): this;
  /**
     * Read a byte and return false if the byte's value is 0, or true otherwise.
     * Moves pointer forward by one byte.
     */
  readBoolean(): boolean;
  /**
     * Read a signed 8-bit integer and move pointer forward by 1 byte.
     */
  readInt8(): number;
  /**
     * Read an unsigned 8-bit integer and move pointer forward by 1 byte.
     */
  readUint8(): number;
  /**
     * Alias for {@link IOBuffer#readUint8}.
     */
  readByte(): number;
  /**
     * Read `n` bytes and move pointer forward by `n` bytes.
     */
  readBytes(n?: number): Uint8Array;
  /**
     * Read a 16-bit signed integer and move pointer forward by 2 bytes.
     */
  readInt16(): number;
  /**
     * Read a 16-bit unsigned integer and move pointer forward by 2 bytes.
     */
  readUint16(): number;
  /**
     * Read a 32-bit signed integer and move pointer forward by 4 bytes.
     */
  readInt32(): number;
  /**
     * Read a 32-bit unsigned integer and move pointer forward by 4 bytes.
     */
  readUint32(): number;
  /**
     * Read a 32-bit floating number and move pointer forward by 4 bytes.
     */
  readFloat32(): number;
  /**
     * Read a 64-bit floating number and move pointer forward by 8 bytes.
     */
  readFloat64(): number;
  /**
     * Read a 1-byte ASCII character and move pointer forward by 1 byte.
     */
  readChar(): string;
  /**
     * Read `n` 1-byte ASCII characters and move pointer forward by `n` bytes.
     */
  readChars(n?: number): string;
  /**
     * Read the next `n` bytes, return a UTF-8 decoded string and move pointer
     * forward by `n` bytes.
     */
  readUtf8(n?: number): string;
  /**
     * Write 0xff if the passed value is truthy, 0x00 otherwise and move pointer
     * forward by 1 byte.
     */
  writeBoolean(value: unknown): this;
  /**
     * Write `value` as an 8-bit signed integer and move pointer forward by 1 byte.
     */
  writeInt8(value: number): this;
  /**
     * Write `value` as an 8-bit unsigned integer and move pointer forward by 1
     * byte.
     */
  writeUint8(value: number): this;
  /**
     * An alias for {@link IOBuffer#writeUint8}.
     */
  writeByte(value: number): this;
  /**
     * Write all elements of `bytes` as uint8 values and move pointer forward by
     * `bytes.length` bytes.
     */
  writeBytes(bytes: ArrayLike<number>): this;
  /**
     * Write `value` as a 16-bit signed integer and move pointer forward by 2
     * bytes.
     */
  writeInt16(value: number): this;
  /**
     * Write `value` as a 16-bit unsigned integer and move pointer forward by 2
     * bytes.
     */
  writeUint16(value: number): this;
  /**
     * Write `value` as a 32-bit signed integer and move pointer forward by 4
     * bytes.
     */
  writeInt32(value: number): this;
  /**
     * Write `value` as a 32-bit unsigned integer and move pointer forward by 4
     * bytes.
     */
  writeUint32(value: number): this;
  /**
     * Write `value` as a 32-bit floating number and move pointer forward by 4
     * bytes.
     */
  writeFloat32(value: number): this;
  /**
     * Write `value` as a 64-bit floating number and move pointer forward by 8
     * bytes.
     */
  writeFloat64(value: number): this;
  /**
     * Write the charCode of `str`'s first character as an 8-bit unsigned integer
     * and move pointer forward by 1 byte.
     */
  writeChar(str: string): this;
  /**
     * Write the charCodes of all `str`'s characters as 8-bit unsigned integers
     * and move pointer forward by `str.length` bytes.
     */
  writeChars(str: string): this;
  /**
     * UTF-8 encode and write `str` to the current pointer offset and move pointer
     * forward according to the encoded length.
     */
  writeUtf8(str: string): this;
  /**
     * Export a Uint8Array view of the internal buffer.
     * The view starts at the byte offset and its length
     * is calculated to stop at the last written byte or the original length.
     */
  toArray(): Uint8Array;
  /**
     * Update the last written byte offset
     * @private
     */
  private _updateLastWrittenByte;
}
export {};
