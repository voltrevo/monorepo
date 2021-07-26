import * as tb from "../../../mod.ts";
import GreeterProtocol from "./GreeterProtocol.ts";
import StreamBufferIO from "./helpers/StreamBufferIO.ts";

const tcpServer = Deno.listen({ port: 24321 });

console.log("Listening...");

for await (const socket of tcpServer) {
  const bufferIO = new StreamBufferIO(socket);

  tb.serveProtocol(bufferIO, GreeterProtocol, {
    sayHello: (name) => {
      return Promise.resolve(`Hi ${name}!`);
    },
  });
}
