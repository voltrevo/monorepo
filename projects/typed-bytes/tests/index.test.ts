import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

import { bicoders } from "../mod.ts";

function Stream(size: number) {
  const buffer = new ArrayBuffer(size);

  const stream = {
    data: new DataView(buffer),
    offset: 0,
    assert: (bytes: number[]) => {
      assertEquals(
        JSON.stringify([...new Uint8Array(buffer).subarray(0, stream.offset)]),
        JSON.stringify(bytes),
      );
    },
  };

  return stream;
}

Deno.test("bicode number", () => {
  const stream = Stream(8);

  bicoders.number.encode(stream, 123);
  stream.assert([64, 94, 192, 0, 0, 0, 0, 0]);

  stream.offset = 0;
  assertEquals(bicoders.number.decode(stream), 123);
  assertEquals(stream.offset, 8);
});

Deno.test("bicode size 0", () => {
  const stream = Stream(8);

  bicoders.size.encode(stream, 0);
  stream.assert([0]);

  stream.offset = 0;
  assertEquals(bicoders.size.decode(stream), 0);
  assertEquals(stream.offset, 1);
});

Deno.test("bicode size 123456789", () => {
  const stream = Stream(8);

  bicoders.size.encode(stream, 123456789);
  // stream.assert([]);

  stream.offset = 0;
  assertEquals(bicoders.size.decode(stream), 123456789);
});
