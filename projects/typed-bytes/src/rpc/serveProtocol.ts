import * as tb from "../index.ts";
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
      const request = await typedIO.read();

      const handler = implementation[request.method];

      handler(...request.args).then((response) =>
        typedIO.write({
          id: request.id,
          data: tb.encodeBuffer(protocol[request.method].result, response),
        })
      );
    }
  })();
}
