import * as tb from "../index.ts";
import BufferIO from "./BufferIO.ts";
import TypedReader from "./TypedReader.ts";
import TypedWriter from "./TypedWriter.ts";

type TypedIO<In, Out> = TypedReader<In> & TypedWriter<Out>;

function TypedIO<In, Out>(
  bufferIO: BufferIO,
  inBicoder: tb.Bicoder<In>,
  outBicoder: tb.Bicoder<Out>,
): TypedIO<In, Out> {
  return {
    ...TypedReader(bufferIO, inBicoder),
    ...TypedWriter(bufferIO, outBicoder),
  };
}

export default TypedIO;
