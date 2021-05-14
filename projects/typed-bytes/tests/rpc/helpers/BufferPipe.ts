import BufferReader from "../../../src/rpc/BufferReader.ts";
import BufferWriter from "../../../src/rpc/BufferWriter.ts";
import AsyncQueue from "./AsyncQueue.ts";

export default function BufferPipe(): {
  reader: BufferReader;
  writer: BufferWriter;
} {
  const queue = new AsyncQueue<ArrayBuffer>();

  return {
    reader: {
      read: async () => (await queue.pop())!, // TODO: Handle close/etc
    },
    writer: {
      write: async (buffer) => {
        await Promise.resolve();
        queue.push(buffer);
      },
    },
  };
}
