import * as tb from "../base.ts";

import AsyncQueue from "./helpers/AsyncQueue.ts";
import type BufferIO from "./BufferIO.ts";
import assertExists from "../helpers/assertExists.ts";

type BufferIOChannels = {
  Channel(id: number): BufferIO;
};

const ChannelMessage = tb.Object({
  id: tb.size,
  buffer: tb.buffer,
});

export default function BufferIOChannels(bufferIO: BufferIO): BufferIOChannels {
  const channelQueues: { [id: number]: AsyncQueue<Uint8Array> | undefined } =
    {};

  function Queue(id: number): AsyncQueue<Uint8Array> {
    let queue = channelQueues[id];

    if (queue === undefined) {
      queue = new AsyncQueue<Uint8Array>();
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

      const msg = ChannelMessage.decode(buffer);
      Queue(msg.id).push(msg.buffer);
    }
  })();

  return {
    Channel: (id) => {
      const queue = Queue(id);

      return {
        write: (buffer) =>
          bufferIO.write(
            ChannelMessage.encode({ id, buffer }),
          ),
        read: () => queue.pop(),
      };
    },
  };
}
