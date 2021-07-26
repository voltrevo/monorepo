// TODO: Fix naming ('stream' isn't quite right anymore)

import assert from "./assert.ts";

async function readPartialLengthFromStream(
  stream: Deno.Reader,
  lengthLimit: number,
): Promise<Uint8Array | null> {
  assert(lengthLimit > 0);

  const buf = new Uint8Array(lengthLimit);

  let bytesRead;

  try {
    bytesRead = await stream.read(buf);
  } catch (error) {
    if (error.name === "BadResource") {
      // This happens when the connection is closed.
      bytesRead = null;
    } else {
      throw error;
    }
  }

  if (bytesRead === null) {
    return null;
  }

  // FIXME: This is inefficient
  return buf.slice(0, bytesRead);
}

async function readLengthFromStream(
  stream: Deno.Reader,
  length: number,
): Promise<Uint8Array | null> {
  const result = new Uint8Array(length);
  let pos = 0;

  while (pos < result.length) {
    const chunk = await readPartialLengthFromStream(
      stream,
      result.length - pos,
    );

    if (chunk === null) {
      if (pos === 0) {
        return null;
      }

      throw new Error(`Incomplete read ${pos}/${result.length}`);
    }

    result.set(chunk, pos);
    pos += chunk.length;
  }

  return result;
}

export default async function readFromStream(
  stream: Deno.Reader,
): Promise<Uint8Array | null> {
  const lengthBytes = await readLengthFromStream(stream, 4);

  if (lengthBytes === null) {
    return null;
  }

  const length = new Uint32Array(lengthBytes.slice().buffer)[0];
  const message = await readLengthFromStream(stream, length);

  if (message === null) {
    throw new Error("Got lengthBytes but not message");
  }

  return message;
}
