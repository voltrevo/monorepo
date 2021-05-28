import * as tb from "../index.ts";
import type BufferWriter from "./BufferWriter.ts";

type TypedWriter<T> = {
  write(value: T): Promise<void>;
};

function TypedWriter<T>(
  bufferWriter: BufferWriter,
  bicoder: tb.Bicoder<T>,
): TypedWriter<T> {
  return {
    write: (value) => bufferWriter.write(bicoder.encode(value)),
  };
}

export default TypedWriter;
