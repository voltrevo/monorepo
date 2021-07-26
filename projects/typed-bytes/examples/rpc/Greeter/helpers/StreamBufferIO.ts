import * as tb from "../../../../mod.ts";

import readFromStream from "./readFromStream.ts";

type Stream = Deno.Reader & Deno.Writer & Deno.Closer;

export default class StreamBufferIO implements tb.BufferIO {
  queue = new tb.AsyncQueue<Uint8Array>();

  constructor(public stream: Stream) {
    (async () => {
      while (true) {
        const message = await readFromStream(this.stream);

        if (message === null) {
          this.queue.close();
          break;
        }

        this.queue.push(message);
      }
    })();
  }

  async write(message: Uint8Array) {
    const fullMsg = new ArrayBuffer(message.length + 4);

    // TODO: Is there a better way to do this that I'm missing? 😅
    const header = new ArrayBuffer(4);
    new Uint32Array(header)[0] = message.length;
    new Uint8Array(fullMsg).set(new Uint8Array(header), 0);

    new Uint8Array(fullMsg).set(message, 4);

    await write(this.stream, fullMsg);
  }

  async read(): Promise<Uint8Array | null> {
    return await this.queue.pop();
  }
}

async function write(writer: Deno.Writer, buf: ArrayBuffer) {
  const bytesWritten = await writer.write(new Uint8Array(buf));

  if (bytesWritten !== buf.byteLength) {
    // TODO: Not sure if this is possible.
    throw new Error("Failed to write to stream");
  }
}
