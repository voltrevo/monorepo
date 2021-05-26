import type { Bicoder } from "./types.ts";
import BufferStream from "./BufferStream.ts";
import jsonGlobal from "./jsonGlobal.ts";

export function encodeBuffer<T>(bicoder: Bicoder<T>, value: T): Uint8Array {
  const stream = new BufferStream();
  stream.write(bicoder, value);
  stream.setOffset(0);

  return stream.get();
}

export function decodeBuffer<T>(bicoder: Bicoder<T>, buffer: Uint8Array): T {
  const stream = new BufferStream(buffer);

  return stream.read(bicoder);
}

export type BufferBicoder<T> = {
  encode(value: T): Uint8Array;
  decode(buffer: Uint8Array): T;
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
  stringify: function <T>(_bicoder: Bicoder<T>, value: T): string {
    return jsonGlobal.stringify(value);
  },
  parse: function <T>(bicoder: Bicoder<T>, jsonString: string): T {
    const parsed = jsonGlobal.parse(jsonString);

    if (!bicoder.test(parsed)) {
      throw new Error("JSON does not match type");
    }

    return parsed;
  },
};
