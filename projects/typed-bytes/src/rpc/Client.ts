import * as tb from "../index.ts";
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

  const pendingResolves: (((response: ArrayBuffer) => void) | undefined)[] = [];

  (async () => {
    while (true) {
      const response = await typedIO.read();
      const resolve = pendingResolves[response.id];

      if (resolve === undefined) {
        console.error(
          `Received response for unrecognized request id ${response.id}`,
        );

        continue;
      }

      resolve(response.data);
    }
  })();

  return Object.fromEntries(
    Object.entries(protocol.methods).map(([methodName, method]) => {
      return [
        methodName,
        async (...args: unknown[]) => {
          const id = nextMessageId++;

          typedIO.write({
            id,
            method: methodName,
            args: args as Request["args"],
          });

          const responseData = await new Promise<ArrayBuffer>((resolve) => {
            pendingResolves[id] = resolve;
          });

          return tb.decodeBuffer(
            protocol.methods[methodName].result,
            responseData,
          );
        },
      ];
    }),
  ) as unknown as Implementation<Protocol>;
}

export default Client;
