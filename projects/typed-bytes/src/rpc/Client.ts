import * as tb from "../base.ts";
import Implementation from "./Implementation.ts";
import { ProtocolBase } from "./Protocol.ts";
import BufferIO from "./BufferIO.ts";
import TypedIO from "./TypedIO.ts";
import { RequestBicoder } from "./Request.ts";
import Response from "./Response.ts";

function Client<Protocol extends ProtocolBase>(
  bufferIO: BufferIO,
  protocol: Protocol,
): Implementation<Protocol> {
  let nextMessageId = 0;

  const Request = RequestBicoder(protocol);
  type Request = tb.TypeOf<typeof Request>;

  const typedIO = TypedIO(bufferIO, Response, Request);

  type PendingResult = {
    resolve: (response: Uint8Array) => void;
    reject: (error: Error) => void;
  } | undefined;

  const pendingResults: PendingResult[] = [];

  function close() {
    for (const [idStr, result] of Object.entries(pendingResults)) {
      if (result !== undefined) {
        result.reject(new Error("Connection closed"));
      }

      delete pendingResults[Number(idStr)];
    }
  }

  (async () => {
    while (true) {
      const readResult = await typedIO.read();

      if (readResult === null) {
        close();
        return;
      }

      const response = readResult.message;
      const result = pendingResults[response.id];

      if (result === undefined) {
        console.error(
          `Received response for unrecognized request id ${response.id}`,
        );

        continue;
      }

      delete pendingResults[response.id];
      result.resolve(response.data);
    }
  })();

  return Object.fromEntries(
    Object.keys(protocol.methods).map((methodName) => {
      return [
        methodName,
        async (...args: unknown[]) => {
          const id = nextMessageId++;

          typedIO.write({
            id,
            method: methodName,
            args: args as Request["args"],
          });

          const responseData = await new Promise<Uint8Array>(
            (resolve, reject) => {
              pendingResults[id] = { resolve, reject };
            },
          );

          return protocol.methods[methodName].result.decode(responseData);
        },
      ];
    }),
  ) as unknown as Implementation<Protocol>;
}

export default Client;
