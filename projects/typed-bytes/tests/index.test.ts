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

Deno.test("bicode strings", () =>
  testBicoder(bicoders.string, [
    { value: "", bytes: [0] },
    {
      value: "Hello world!",
      bytes: [12, 72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33],
    },
    { value: "🤠", bytes: [4, 240, 159, 164, 160] },
  ]));

Deno.test("bicode string arrays", () =>
  testBicoder(bicoders.Array_(bicoders.string), [
    { value: [], bytes: [0] },
    { value: [""], bytes: [1, 0] },
    { value: ["", ""], bytes: [2, 0, 0] },
    {
      value: ["Hello", "world!"],
      bytes: [2, 5, 72, 101, 108, 108, 111, 6, 119, 111, 114, 108, 100, 33],
    },
    {
      value: ["One", "two", "three", "four", "five."],
      bytes: [
        [5], // 5 elements
        [3, 79, 110, 101], // "One" (length 3, 'O', 'n', 'e')
        [3, 116, 119, 111], // "two"
        [5, 116, 104, 114, 101, 101], // "three"
        [4, 102, 111, 117, 114], // "four"
        [5, 102, 105, 118, 101, 46], // "five."
      ].flat(),
    },
  ]));

Deno.test("bicode array of objects", () => {
  const bicoder = bicoders.Array_(bicoders.Object_({
    x: bicoders.number,
    y: bicoders.number,
    message: bicoders.string,
  }));

  testBicoder(bicoder, [
    { value: [], bytes: [0] },
    {
      value: [{ x: 0, y: 0, message: "" }],
      bytes: [
        [1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0],
      ].flat(),
    },
    {
      value: [
        { x: 0, y: 0, message: "" },
        { x: 1.1, y: -7, message: "Fourth quadrant." },
      ],
      bytes: [
        [2],

        // { x: 0, y: 0, message: "" }
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0],

        // { x: 1.1, y: -7, message: "Fourth quadrant." }
        [63, 241, 153, 153, 153, 153, 153, 154], // 1.1
        [192, 28, 0, 0, 0, 0, 0, 0], // -7
        [16], // String needs 16 bytes
        [70, 111, 117, 114, 116, 104], // "Fourth"
        [32], // " "
        [113, 117, 97, 100, 114, 97, 110, 116, 46], // "quadrant."
      ].flat(),
    },
  ]);
});
