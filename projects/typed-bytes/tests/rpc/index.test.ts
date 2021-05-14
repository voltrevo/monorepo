import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

import * as tb from "../../mod.ts";
import * as rpc from "../../src/rpc/index.ts";
import BufferIOPair from "./helpers/BufferIOPair.ts";

function Fixture<Protocol extends rpc.ProtocolBase>(
  protocol: Protocol,
  implementation: rpc.Implementation<Protocol>,
) {
  const { left: clientIO, right: serverIO } = BufferIOPair();
  const client = rpc.Client(clientIO, protocol);
  rpc.serveProtocol(serverIO, protocol, implementation);

  return { client };
}

Deno.test("ping", async () => {
  const { client } = Fixture(
    rpc.Protocol({
      ping: rpc.method()(),
    }),
    {
      ping: () => Promise.resolve(),
    },
  );

  const reply = await client.ping();

  assertEquals(reply, undefined);
});

Deno.test("greet", async () => {
  const { client } = Fixture(
    rpc.Protocol({
      greet: rpc.method(tb.string)(tb.string),
    }),
    {
      greet: (name) => Promise.resolve(`Hi ${name}`),
    },
  );

  const reply = await client.greet("Alice");

  assertEquals(reply, "Hi Alice");
});
