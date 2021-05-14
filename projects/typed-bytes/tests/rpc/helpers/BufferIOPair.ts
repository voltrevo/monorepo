import BufferIO from "../../../src/rpc/BufferIO.ts";
import BufferPipe from "./BufferPipe.ts";

export default function BufferIOPair(): {
  left: BufferIO;
  right: BufferIO;
} {
  const pipe1 = BufferPipe();
  const pipe2 = BufferPipe();

  return {
    left: {
      ...pipe1.reader,
      ...pipe2.writer,
    },
    right: {
      ...pipe2.reader,
      ...pipe1.writer,
    },
  };
}
