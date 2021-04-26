# Typed Bytes

*A binary encoding library for TypeScript.*

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
  level: tb.enum_("LOG", "WARN", "ERROR"),
  message: tb.string,
});

/*
  // on hover:
  type LogMessage = {
    level: "LOG" | "WARN" | "ERROR";
    message: string;
  }
*/
type LogMessage = tb.TypeOf<typeof LogMessage>;

const { encode, decode } = tb.BufferBicoder(LogMessage);

const buffer = encode({
  level: "LOG",
  message: "Test message",
});

/*
    0,                // Option 0: 'LOG'
   12,                // Message needs 12 bytes
   84, 101, 115, 116, // utf-8 bytes for "Test message"
   32, 109, 101, 115,
  115,  97, 103, 101

  // (Notice how no bytes were used for strings 'level', 'message', or 'LOG')
*/
console.log(new Uint8Array(buffer));

/*
  // on hover:
  const decodedValue: {
    level: "LOG" | "WARN" | "ERROR";
    message: string;
  }
*/
const decodedValue = decode(buffer);
```

## Why Use `typed-bytes` Instead Of...

### MessagePack

TODO

### Protocol Buffers

TODO

### Avro

TODO

### Cap'n Proto

TODO

### Flat Buffers

TODO
