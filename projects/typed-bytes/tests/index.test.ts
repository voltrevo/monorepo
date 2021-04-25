import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";

import { Bicoder, bicoders } from "../mod.ts";

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

function testBicoder<T>(
  bicoder: Bicoder<T>,
  testCases: { value: T; bytes: number[] }[],
) {
  for (const { value, bytes } of testCases) {
    const stream = Stream(1024);

    bicoder.encode(stream, value);
    stream.assert(bytes);

    stream.offset = 0;

    assertEquals(
      JSON.stringify(bicoder.decode(stream)),
      JSON.stringify(value),
    );
  }
}

Deno.test("bicode numbers", () =>
  testBicoder(bicoders.number, [
    { value: 0, bytes: [0, 0, 0, 0, 0, 0, 0, 0] },
    { value: 1, bytes: [63, 240, 0, 0, 0, 0, 0, 0] },
    { value: -1, bytes: [191, 240, 0, 0, 0, 0, 0, 0] },
    { value: 123, bytes: [64, 94, 192, 0, 0, 0, 0, 0] },
    { value: 1.12, bytes: [63, 241, 235, 133, 30, 184, 81, 236] },
  ]));

Deno.test("bicode sizes", () =>
  testBicoder(bicoders.size, [
    { value: 0, bytes: [0] },
    { value: 127, bytes: [127] },
    { value: 128, bytes: [128, 1] },
    { value: 129, bytes: [129, 1] },
    { value: 123456789, bytes: [149, 154, 239, 58] },
  ]));
