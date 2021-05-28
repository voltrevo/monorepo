import BufferStream from "./BufferStream.ts";
import Stream from "./Stream.ts";

export type BicoderInit<T> = {
  write(stream: Stream, value: T): void;
  read(stream: Stream): T;
  test(value: unknown): boolean;
};

export default class Bicoder<T> implements BicoderInit<T> {
  private echo = (value: T): T => value;

  constructor(private init: BicoderInit<T>) {}

  write(stream: Stream, value: T) {
    return this.init.write(stream, value);
  }

  read(stream: Stream) {
    return this.init.read(stream);
  }

  test(value: unknown) {
    return this.init.test(value);
  }

  encode(value: T): Uint8Array {
    const stream = new BufferStream();
    stream.write(this, value);
    stream.setOffset(0);

    return stream.get();
  }

  decode(buffer: Uint8Array): T {
    const stream = new BufferStream(buffer);

    return stream.read(this);
  }
}
