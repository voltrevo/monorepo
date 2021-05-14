import * as tb from "../index.ts";
import type BufferReader from "./BufferReader.ts";

type TypedReader<T> = {
  read(): Promise<T>;
};

function TypedReader<T>(
  bufferReader: BufferReader,
  bicoder: tb.Bicoder<T>,
): TypedReader<T> {
  return {
    read: async () => tb.decodeBuffer(bicoder, await bufferReader.read()),
  };
}

export default TypedReader;
