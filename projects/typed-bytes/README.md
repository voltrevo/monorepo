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
