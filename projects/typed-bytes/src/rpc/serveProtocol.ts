import * as tb from "../base.ts";
import BufferIO from "./BufferIO.ts";
import { ProtocolBase } from "./Protocol.ts";
import Implementation from "./Implementation.ts";
import TypedIO from "./TypedIO.ts";
import { RequestBicoder } from "./Request.ts";
import Response from "./Response.ts";

export default function serveProtocol<Protocol extends ProtocolBase>(
  bufferIO: BufferIO,
  protocol: Protocol,
  implementation: Implementation<Protocol>,
) {
  const Request = RequestBicoder(protocol);
  const typedIO = TypedIO(bufferIO, Request, Response);

  (async () => {
    while (true) {
      const readResult = await typedIO.read();

      if (readResult === null) {
        return;
      }

      const request = readResult.message;
      const handler = implementation[request.method];

      handler(...request.args).then((response) =>
        typedIO.write({
          id: request.id,
          data: protocol.methods[request.method as string].result.encode(
            response,
          ),
        })
      );
    }
  })();
}
