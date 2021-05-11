import type { Bicoder, Decoder, Encoder } from "./types.ts";
import BufferStream from "./BufferStream.ts";
import jsonGlobal from "./jsonGlobal.ts";

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

export type BufferBicoder<T> = {
  encode(value: T): ArrayBuffer;
  decode(buffer: ArrayBuffer): T;
};

export function BufferBicoder<T>(bicoder: Bicoder<T>): BufferBicoder<T> {
  return {
    encode(value) {
      return encodeBuffer(bicoder, value);
    },
    decode(buffer) {
      return decodeBuffer(bicoder, buffer);
    },
  };
}

export const JSON = {
  stringify: <T>(_bicoder: Bicoder<T>, value: T): string => (
    jsonGlobal.stringify(value)
  ),
  parse: <T>(bicoder: Bicoder<T>, jsonString: string): T => {
    const parsed = jsonGlobal.parse(jsonString);

    if (!bicoder.test(parsed)) {
      throw new Error("JSON does not match type");
    }

    return parsed;
  },
};
