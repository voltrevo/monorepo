import * as tb from "../index.ts";

import AsyncQueue from "./helpers/AsyncQueue.ts";
import BufferIO from "./BufferIO.ts";
import assertExists from "../helpers/assertExists.ts";

type BufferIOChannels = {
  Channel(id: number): BufferIO;
};

const ChannelMessage = tb.object({
  id: tb.size,
  buffer: tb.buffer,
});

export default function BufferIOChannels(bufferIO: BufferIO): BufferIOChannels {
  const channelQueues: { [id: number]: AsyncQueue<ArrayBuffer> | undefined } =
    {};

  function Queue(id: number): AsyncQueue<ArrayBuffer> {
    let queue = channelQueues[id];

    if (queue === undefined) {
      queue = new AsyncQueue<ArrayBuffer>();
      channelQueues[id] = queue;
    }

    return queue;
  }

  function close() {
    for (const queue of Object.values(channelQueues)) {
      assertExists(queue).close();
    }
  }

  (async () => {
    while (true) {
      const buffer = await bufferIO.read();

      if (buffer === null) {
        close();
        return;
      }

      const msg = tb.decodeBuffer(ChannelMessage, buffer);
      Queue(msg.id).push(msg.buffer);
    }
  })();

  return {
    Channel: (id) => {
      const queue = Queue(id);

      return {
        write: (buffer) =>
          bufferIO.write(
            tb.encodeBuffer(ChannelMessage, { id, buffer }),
          ),
        read: () => queue.pop(),
      };
    },
  };
}
