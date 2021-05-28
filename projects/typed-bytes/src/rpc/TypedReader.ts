import * as tb from "../index.ts";
import type BufferReader from "./BufferReader.ts";

type TypedReader<T> = {
  read(): Promise<{ message: T } | null>;
};

function TypedReader<T>(
  bufferReader: BufferReader,
  bicoder: tb.Bicoder<T>,
): TypedReader<T> {
  return {
    read: async () => {
      const buffer = await bufferReader.read();

      if (buffer === null) {
        return null;
      }

      return { message: bicoder.decode(buffer) };
    },
  };
}

export default TypedReader;
