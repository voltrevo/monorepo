# Typed Bytes

*A public domain binary encoding library for TypeScript.*

## Hello World

```ts
import * as tb from "https://raw.githubusercontent.com/voltrevo/monorepo/26caa290/projects/typed-bytes/mod.ts";

const bb = tb.BufferBicoder(tb.string);

console.log(new Uint8Array(
  bb.encode("Hello world!"),
));

/*
  Uint8Array(13) [
     12,  72, 101, 108, 108,
    111,  32, 119, 111, 114,
    108, 100,  33
  ]
*/
```

## About

`typed-bytes` provides convenient type-aware binary encoding and decoding. The
type awareness provides two main benefits:

1. Smaller encoded size
2. Type information is present on decoded values

This alone isn't anything new, the key is how `typed-bytes` embraces TypeScript.
In particular:
- there is no need for code-gen
- unions are supported
- exact types are supported
- you can extract type information from the bicoder, so you don't need to duplicate it

For example:

```ts
const LogMessage = tb.object({
  level: tb.enum_("INFO", "WARN", "ERROR"),
  message: tb.string,
});

/*
  // on hover:
  type LogMessage = {
    level: "INFO" | "WARN" | "ERROR";
    message: string;
  }
*/
type LogMessage = tb.TypeOf<typeof LogMessage>;

const { encode, decode } = tb.BufferBicoder(LogMessage);

const buffer = encode({
  level: "INFO",
  message: "Test message",
});

/*
    0,                // Option 0: 'INFO'
   12,                // Message needs 12 bytes
   84, 101, 115, 116, // utf-8 bytes for "Test message"
   32, 109, 101, 115,
  115,  97, 103, 101

  // (Notice how no bytes were used for strings 'level', 'message', or 'INFO')
*/
console.log(new Uint8Array(buffer));

/*
  // on hover:
  const decodedValue: {
    level: "INFO" | "WARN" | "ERROR";
    message: string;
  }
*/
const decodedValue = decode(buffer);
```

## [A More Complex Example](./examples/Shapes/README.md)

Suppose we were making graphics application where the user can draw shapes on a
canvas. We want to be able to be able to encode the canvas and its shapes so we
can save it to disk, synchronize it with a remote display, or what-have-you.

![Snake](./examples/Shapes/tutorial/step10/drawing.png)

The image above is encoded in just 71 bytes.
[Keep reading](./examples/Shapes/README.md) for a step-by-step guide to create a
vector graphics format to achieve this using `typed-bytes`.

## Why Use typed-bytes Instead Of...

### MessagePack

1. typed-bytes is more compact:

```ts
const msg: LogMessage = {
  type: 'INFO',
  message: 'Test message',
};

msgpack.encode(msg);              // 33 bytes
tb.encodeBuffer(LogMessage, msg); // 14 bytes
```

Of course, typed-bytes is relying on the type information to achieve this, and
you need that information to decode the buffer. With MessagePack, you can decode
the json in a different place with only the MessagePack library.

2. MessagePack doesn't check the structure being decoded and doesn't provide
type information:

```ts
// on hover:
// const msgpackValue: unknown
const msgpackValue = msgpack.decode(buffer);

// on hover:
// const tbValue: {
//     level: "INFO" | "WARN" | "ERROR";
//     message: string;
// }
const tbValue = tb.decodeBuffer(LogMessage, buffer);
```

### Protocol Buffers

TODO

### Avro

TODO

### Cap'n Proto

TODO

### Flat Buffers

TODO
