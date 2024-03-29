import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

import * as tb from "../mod.ts";

function testBicoder<T extends tb.AnyBicoder>(
  bicoder: T,
  testCases: { value: tb.TypeOf<T>; bytes: number[] }[],
) {
  for (const { value, bytes } of testCases) {
    const buffer = bicoder.encode(value);
    assertEquals([...buffer], bytes);

    const valueDecoded = bicoder.decode(buffer);
    assertEquals(valueDecoded, value);
  }
}

Deno.test("bicode numbers", () =>
  testBicoder(tb.number, [
    { value: 0, bytes: [0, 0, 0, 0, 0, 0, 0, 0] },
    { value: 1, bytes: [63, 240, 0, 0, 0, 0, 0, 0] },
    { value: -1, bytes: [191, 240, 0, 0, 0, 0, 0, 0] },
    { value: 123, bytes: [64, 94, 192, 0, 0, 0, 0, 0] },
    { value: 1.12, bytes: [63, 241, 235, 133, 30, 184, 81, 236] },
  ]));

Deno.test("bicode sizes", () =>
  testBicoder(tb.size, [
    { value: 0, bytes: [0] },
    { value: 127, bytes: [127] },
    { value: 128, bytes: [128, 1] },
    { value: 129, bytes: [129, 1] },
    { value: 123456789, bytes: [149, 154, 239, 58] },
  ]));

Deno.test("bicode strings", () =>
  testBicoder(tb.string, [
    { value: "", bytes: [0] },
    {
      value: "Hello world!",
      bytes: [12, 72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33],
    },
    { value: "🤠", bytes: [4, 240, 159, 164, 160] },
  ]));

Deno.test("bicode string arrays", () =>
  testBicoder(tb.Array(tb.string), [
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
  const bicoder = tb.Array(tb.Object({
    x: tb.number,
    y: tb.number,
    message: tb.string,
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

Deno.test("bicode Tuple", () => {
  testBicoder(tb.Tuple(tb.number, tb.null_, tb.string), [
    {
      value: [1, null, "hi"],
      bytes: [
        [63, 240, 0, 0, 0, 0, 0, 0], // 1
        [], // null takes up no space
        [2, 104, 105], // "hi"
      ].flat(),
    },
  ]);
});

Deno.test("bicode Union", () => {
  testBicoder(tb.Union(tb.null_, tb.number, tb.string), [
    { value: null, bytes: [0] },
    { value: 123, bytes: [1, 64, 94, 192, 0, 0, 0, 0, 0] },
    { value: "hi", bytes: [2, 2, 104, 105] },
  ]);
});

Deno.test("bicode json", () => {
  type JSON =
    | null
    | boolean
    | number
    | string
    | JSON[]
    | { [key in string]?: JSON };

  const deferBicoder = tb.defer((): tb.Bicoder<JSON> => bicoder);

  const bicoder = tb.Union(
    tb.null_,
    tb.boolean,
    tb.number,
    tb.string,
    tb.Array(deferBicoder),
    tb.StringMap(deferBicoder),
  );

  testBicoder(bicoder, [
    { value: null, bytes: [0] },
    {
      value: [1, 2, null, 3],
      bytes: [
        [4], // Option 4: array
        [4], // 4 elements
        [2], // Option 2: number
        [63, 240, 0, 0, 0, 0, 0, 0], // 1
        [2], // Option 2: number
        [64, 0, 0, 0, 0, 0, 0, 0], // 2
        [0], // Option 0: null
        [2], // Option 2: number
        [64, 8, 0, 0, 0, 0, 0, 0], // 3
      ].flat(),
    },
    {
      value: {
        one: 1,
        two: 2,
        obj: {
          foo: "bar",
        },
        nulls: [null, null, null],
      },
      bytes: [
        [5], // Option 5: StringMap
        [4], // 4 keys

        [3, 111, 110, 101], // "one"
        [2, 63, 240, 0, 0, 0, 0, 0, 0], // 1 (leading 2 was option 2: number)

        [3, 116, 119, 111], // "two"
        [2, 64, 0, 0, 0, 0, 0, 0, 0], // 2

        [3, 111, 98, 106], // "obj"
        [5], // Option 5: StringMap
        [1], // 1 key
        [3, 102, 111, 111], // "foo"
        [3, 3, 98, 97, 114], // "bar"

        [5, 110, 117, 108, 108, 115], // "nulls"
        [4], // Option 4: array
        [3], // 3 elements
        [0], // null
        [0], // null
        [0], // null
      ].flat(),
    },
  ]);
});

Deno.test("bicode json comparison (known structure)", () => {
  const bicoder = tb.Object({
    one: tb.number,
    two: tb.number,
    obj: tb.Object({
      foo: tb.string,
    }),
    nulls: tb.Array(tb.null_),
  });

  testBicoder(bicoder, [
    {
      value: {
        one: 1,
        two: 2,
        obj: {
          foo: "bar",
        },
        nulls: [null, null, null],
      },
      bytes: [
        [63, 240, 0, 0, 0, 0, 0, 0], // 1
        [64, 0, 0, 0, 0, 0, 0, 0], // 2
        [3, 98, 97, 114], // "bar"
        [3], // nulls is length 3
      ].flat(),
    },
  ]);
});

Deno.test("bicode enums", () => {
  const bicoder = tb.Enum("foo", null, "bar");

  testBicoder(bicoder, [
    { value: "foo", bytes: [0] },
    { value: "bar", bytes: [2] },
  ]);
});

Deno.test("bicode bigints", () =>
  testBicoder(tb.bigint, [
    { value: 0n, bytes: [0] },
    { value: 1n, bytes: [2, 1] },
    { value: -1n, bytes: [3, 1] },
    { value: 2n, bytes: [2, 2] },
    { value: 123456n, bytes: [6, 1, 226, 64] },
  ]));

Deno.test("bicode custom class", () => {
  class Point {
    constructor(
      public x: number,
      public y: number,
    ) {}

    static bicoder = new tb.Bicoder<Point>({
      write(stream, point) {
        stream.write(tb.number, point.x);
        stream.write(tb.number, point.y);
      },
      read(stream) {
        return new Point(
          stream.read(tb.number),
          stream.read(tb.number),
        );
      },
      test(value): value is Point {
        return value instanceof Point;
      },
    });
  }

  const buffer = Point.bicoder.encode(new Point(1, 2));
  const point = Point.bicoder.decode(buffer);

  assertEquals(point, new Point(1, 2));
  assert(point instanceof Point);
});

Deno.test("bicode isizes", () => {
  testBicoder(tb.isize, [
    { value: 0, bytes: [0] },
    { value: 1, bytes: [2] },
    { value: -1, bytes: [3] },
    { value: 2, bytes: [4] },
    { value: -2, bytes: [5] },
    { value: 123456789, bytes: [170, 180, 222, 117] },
    { value: -123456789, bytes: [171, 180, 222, 117] },
  ]);
});

Deno.test("shapes", () => {
  const Position = tb.Object({
    x: tb.isize,
    y: tb.isize,
  });

  const Circle = tb.Object({
    position: Position,
    radius: tb.size,
  });

  const Triangle = tb.Object({
    position: Position,
    radius: tb.size,
    rotation: tb.isize,
  });

  const Square = tb.Object({
    position: Position,
    radius: tb.size,
    rotation: tb.isize,
  });

  const Shape = tb.Union(Circle, Triangle, Square);
  type Shape = tb.TypeOf<typeof Shape>;

  const buffer = Shape.encode({
    position: { x: 0, y: 0 },
    radius: 100,
    rotation: 30,
  });

  assertEquals([...buffer], [1, 0, 0, 100, 60]);
});

Deno.test("bicode type number", () => {
  const number2 = tb.Type.decode(tb.Type.encode(tb.number));

  const encoded123 = number2.encode(123);
  const decoded123 = number2.decode(encoded123);

  assertEquals(decoded123, 123);
});

Deno.test("bicode Any", () => {
  testBicoder(tb.Any, [
    {
      value: undefined,
      bytes: [0],
    },
    {
      value: null,
      bytes: [1],
    },
    {
      value: [undefined, null, false],
      bytes: [6, 3, 0, 1, 2, 0],
    },
    {
      value: tb.number,
      bytes: [8, 0, 3],
    },
  ]);
});

Deno.test("bicode type Array(number)", () => {
  const NumberArray = tb.Array(tb.number);
  const NumberArray2 = tb.Type.decode(tb.Type.encode(NumberArray));

  const encodedNumbers = NumberArray2.encode([1, 2, 3]);
  const decodedNumbers = NumberArray2.decode(encodedNumbers);

  assertEquals(decodedNumbers, [1, 2, 3]);
});

Deno.test("bicode types", () => {
  const Fruit = tb.Enum("Apple", "Banana", "Orange");
  const Fruit2 = tb.Type.decode(tb.Type.encode(Fruit));

  const encodedBanana = Fruit.encode("Banana");
  const decodedBanana = Fruit2.decode(encodedBanana);

  assertEquals(decodedBanana, "Banana");
});

Deno.test("bicode Type", () => {
  const Type2 = tb.Type.decode(tb.Type.encode(tb.Type));

  const Fruit = tb.Enum("Apple", "Banana", "Orange");
  const Fruit2 = Type2.decode(Type2.encode(Fruit));

  const encodedBanana = Fruit.encode("Banana");
  const decodedBanana = Fruit2.decode(encodedBanana);

  assertEquals(decodedBanana, "Banana");
});

Deno.test("bicode highly meta type", () => {
  let meta123: tb.AnyBicoder = tb.Exact(123);

  for (let i = 0; i < 10; i++) {
    meta123 = tb.Exact(meta123);
  }

  for (let i = 0; i < 10; i++) {
    meta123 = meta123.decode(Uint8Array.from([]));
  }

  const value = meta123.decode(Uint8Array.from([]));

  assertEquals(value, 123);
});

Deno.test("bicode recursive type", () => {
  type DeepNumberArray = number | DeepNumberArray[];

  const deferredDeepNumberArray: tb.Bicoder<DeepNumberArray> = tb.defer(
    () => DeepNumberArray,
  );

  const DeepNumberArray = tb.Union(
    tb.number,
    tb.Array(deferredDeepNumberArray),
  );

  const DeepNumberArray2 = tb.Type.decode(tb.Type.encode(DeepNumberArray));

  const numbers: DeepNumberArray = [1, [2], [[3]]];

  const encodedNumbers = DeepNumberArray2.encode(numbers);
  const decodedNumbers = DeepNumberArray2.decode(encodedNumbers);

  assertEquals(decodedNumbers, numbers);
});

Deno.test("can decode correctly after encoding an object with fields in a different order", () => {
  const Obj = tb.Object({
    a: tb.string,
    b: tb.string,
  });

  const buf = Obj.encode({
    b: "b",
    a: "a",
  });

  const decoded = Obj.decode(buf);

  assertEquals(decoded.a, "a");
});
