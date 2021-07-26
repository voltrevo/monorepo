import * as tb from "../../../mod.ts";
import GreeterProtocol from "./GreeterProtocol.ts";
import StreamBufferIO from "./helpers/StreamBufferIO.ts";

const socket = await Deno.connect({ hostname: "localhost", port: 24321 });
const bufferIO = new StreamBufferIO(socket);

const client = tb.Client(bufferIO, GreeterProtocol);

const reply = await client.sayHello("Alice");

console.log(reply);

socket.close();
