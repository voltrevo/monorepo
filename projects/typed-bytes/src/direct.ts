import type { Bicoder, Decoder, Encoder } from "./types.ts";
import BufferStream from "./BufferStream.ts";

export function encodeBuffer<T>(encoder: Encoder<T>, value: T): ArrayBuffer {
  const stream = new BufferStream();
  stream.write(encoder, value);
  stream.setOffset(0);

  return stream.get();
}

export function decodeBuffer<T>(decoder: Decoder<T>, buffer: ArrayBuffer): T {
  const stream = new BufferStream(buffer);

  return stream.read(decoder);
}

export function BufferBicoder<T>(bicoder: Bicoder<T>) {
  return {
    encode(value: T): ArrayBuffer {
      return encodeBuffer(bicoder, value);
    },
    decode(buffer: ArrayBuffer): T {
      return decodeBuffer(bicoder, buffer);
    },
  };
}
