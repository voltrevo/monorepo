import BufferStream from "./BufferStream.ts";
import Stream from "./Stream.ts";

// deno-lint-ignore no-explicit-any
type ExplicitAny = any;
type AnyBicoder = Bicoder<ExplicitAny>;

type Meta = AnyBicoder | {
  fn: (...args: ExplicitAny[]) => AnyBicoder;
  args: ExplicitAny[];
};

type Meta2 = (
  | { type: "primitive"; bicoder: AnyBicoder }
  | { type: "" }
);

export type BicoderInit<T> = {
  write(stream: Stream, value: T): void;
  read(stream: Stream): T;
  test(value: unknown): boolean;
  Meta?: () => Meta;
};

export default class Bicoder<T> implements BicoderInit<T> {
  private echo = (value: T): T => value;
  Meta?: () => Meta;

  constructor(private init: BicoderInit<T>) {
    if (init.Meta !== undefined) {
      this.Meta = init.Meta;
    }
  }

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
