import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

import * as tb from "../../mod.ts";
import * as rpc from "../../src/rpc/index.ts";
import BufferIOPair from "./helpers/BufferIOPair.ts";

Deno.test("greet", async () => {
  const protocol = rpc.Protocol({
    greet: rpc.method(tb.string)(tb.string),
  });

  const { left: clientIO, right: serverIO } = BufferIOPair();

  const client = rpc.Client(clientIO, protocol);

  rpc.serveProtocol(serverIO, protocol, {
    greet: (name) => Promise.resolve(`Hi ${name}`),
  });

  const reply = await client.greet("Alice");

  assertEquals(reply, "Hi Alice");
});
