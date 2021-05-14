import BufferServer from "./BufferServer.ts";
import { ProtocolBase } from "./Protocol.ts";
import Implementation from "./Implementation.ts";
import serveProtocol from "./serveProtocol.ts";

export default function Server<Protocol extends ProtocolBase>(
  bufferServer: BufferServer,
  protocol: Protocol,
  implementation: Implementation<Protocol>,
) {
  (async () => {
    while (true) {
      const bufferIO = await bufferServer.accept();
      serveProtocol(bufferIO, protocol, implementation);
    }
  })();
}
