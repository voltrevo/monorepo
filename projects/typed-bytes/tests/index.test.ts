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

Deno.test("bicode sizes", () => {
  function testSize(size: number, bytes: number[]) {
    const stream = Stream(8);

    bicoders.size.encode(stream, size);
    stream.assert(bytes);

    stream.offset = 0;
    assertEquals(bicoders.size.decode(stream), size);
  }

  testSize(0, [0]);
  testSize(127, [127]);
  testSize(128, [128, 1]);
  testSize(129, [129, 1]);
  testSize(123456789, [149, 154, 239, 58]);
});
