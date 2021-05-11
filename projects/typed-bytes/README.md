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

<details>
<summary>Less compact, no type information, click for more</summary>

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
</details>

### Protocol Buffers

<details>
<summary>Code-gen, unnecessary code complexity, click for more</summary>

1. Requires learning a special-purpose `.proto` language (can be a positive *if* you need to
share a protocol with a team that doesn't want to interact with TypeScript)

```proto
// messages.proto

syntax = "proto3";

message LogMessage {
  enum Level {
    INFO = 1;
    WARN = 2;
    ERROR = 3;
  }

  Level level = 1;
  string message = 2;
}
```

2. Requires code-gen:

```sh
pbjs messages.proto -t static-module -o messages.js
pbts messages.js -o messages.d.ts
```

3. Protobuf requires you to use its wrappers around your objects which is more verbose:

```ts
// More verbose: special protobuf object instead of vanilla object
const msg = new LogMessage({
  // More verbose: enum wrapper instead of vanilla string
  level: LogMessage.Level['INFO'],
  message: 'Test message',
});
```

4. Assuming you want to use protobuf version 3 (as opposed to version 2 which was superseded by version 3 five years ago), protobuf forces all fields to be optional.

TypeScript cannot tell you when you have forgotten a field:

```ts
const msg = new LogMessage({
  // Forgot `level`, but this compiles just fine
  message: 'Test message',
});
```

Protobuf is inconsistent about how it represents missing fields:

```ts
const emptyMessage = LogMessage.decode(
  LogMessage.encode(new LogMessage()).finish(),
);
```

If you use protobuf's wrapped object (and likely other contexts when using cross-language tooling) it will give you its default value for that type:

```ts
console.log(JSON.stringify(emptyMessage.message)); /*
  ""
*/

// This means you can't tell the difference between the field being missing or
// present as an empty string when accessing the field in this way.
```

But if you want to work with plain objects, `.toJSON` will omit the fields entirely:

```ts
console.log(emptyMessage.toJSON()); /*
  {}
*/
```

In the real world, fields are very often required. It is generally the expected default when programming - if you say that a structure has a field, then an instance of that structure must have that field.

In many cases, this means you need to take special care to deal with the fact that protobuf considers your fields to be optional, even though your application considers messages that are missing those fields to be invalid, and thus should never have been encoded/decoded in the first place.

Protobuf's reason for doing this is that it helps with compatibility. If you are forced to check whether fields are present, then an old message which doesn't have that field will be able to be processed by your upgrade that includes that field (even if that means the upgrade throws it out because it is required nonetheless). Some may find this valuable. `typed-bytes` allows you to make this decision instead of deciding for you.

5. `typed-bytes` allows entities of all shapes and sizes, but protobuf only
supports objects:

```ts
const LogMessages = tb.array(LogMessage);
```

If you want an array in protobuf, you must wrap it in an object:

```proto
message LogMessages {
  repeated LogMessage content = 1;
}
```

[Protobuf mini-project containing these examples.](./comparisons/protobuf/README.md).
</details>

### Avro

<details>
<summary>Verbose, TypeScript is unofficial, no type information</summary>

Note: avro doesn't have any official support for JavaScript or TypeScript. The
best unofficial library appears to be [avsc](https://github.com/mtth/avsc), and
this is being used for comparison here.

1. avsc's first example from
[their README.md](https://github.com/mtth/avsc/blob/master/README.md) is
rejected by the TypeScript compiler.

```ts
import avro from 'avsc';

/*
Argument of type '{ type: "record"; fields: ({ name: string; type: { type: "enum"; symbols: string[]; }; } | { name: string; type: string; })[]; }' is not assignable to parameter of type 'Schema'.
  Type '{ type: "record"; fields: ({ name: string; type: { type: "enum"; symbols: string[]; }; } | { name: string; type: string; })[]; }' is not assignable to type 'string'. ts(2345)
*/
const type = avro.Type.forSchema({
  type: 'record',
  fields: [
    {name: 'kind', type: {type: 'enum', symbols: ['CAT', 'DOG']}},
    {name: 'name', type: 'string'}
  ]
});
```

On troubleshooting this I discovered the `name` field is required, so you can
fix the example above by adding that field at the top level and also in the
embedded enum type.

2. Schemas are much more verbose than `typed-bytes`:

```ts
// avsc
const LogMessage = avro.Type.forSchema({
  name: 'LogMessage',
  type: 'record',
  fields: [
    {
      name: 'level',
      type: {
        type: 'enum',
        name: 'Level',
        symbols: ['INFO', 'WARN', 'ERROR'],
      },
    },
    { name: 'message', type: 'string' },
  ],
});
```

```ts
// typed-bytes
const LogMessage = tb.object({
  level: tb.enum_("INFO", "WARN", "ERROR"),
  message: tb.string,
});
```

3. Type information is not available to the TypeScript compiler (or your IDE):

```ts
// `.toBuffer` below is typed as:
// (method) Type.toBuffer(value: any): any
const buf = LogMessage.toBuffer({
  level: 'INFO',
  message: 'Test message',
});
```

This also means if you want a TypeScript definition of this object, you'll need
to define it redundantly, and TypeScript can't protect you from that redundant
type getting out of sync with your avro schema.

By comparison, in typed-bytes, you can write:

```ts
type LogMessage = tb.TypeOf<typeof LogMessage>;
```
</details>

### Cap'n Proto

<details>
<summary>Lack of support, slow, hacky</summary>

To be clear, we are talking about using Cap'n Proto from TypeScript here. If you
are not using TypeScript these comparisons do not apply.

1. Library describes itself as slow.

> Because v8 cannot inline or otherwise optimize calls into C++ code, and because the C++ bindings are implemented in terms of the "dynamic" API, this implementation is actually very slow.

[node-capnp docs](https://github.com/capnproto/node-capnp#this-implementation-is-slow)

2. Library describes itself as hacky.

> This package is a hacky wrapper around the Cap'n Proto C++ library.

[node-capnp docs](https://github.com/capnproto/node-capnp#capn-proto-bindings-for-nodejs)

3. Cap'n Proto requires that you install it at the system level.

Simply running `npm install capnp` does not work:

```
// lots of noise
npm ERR! ../src/node-capnp/capnp.cc:31:10: fatal error: capnp/dynamic.h: No such file or directory
npm ERR!    31 | #include <capnp/dynamic.h>
// lots more noise
```

[As commented by a `node-capnp` member](https://github.com/capnproto/node-capnp/issues/41#issuecomment-388421409),
this is a requirement.

4. After installing at the system level, `npm install capnp` still does not
work.

I'm running nodejs 16.1.0 on ubuntu 20.04, and I was able to install Cap'n Proto
on my system to fufil the requirement above just fine with
`sudo apt install capnproto`. However, `npm install capnp` continues to fail
with the same error.

I'd like to expand on the Cap'n Proto comparison, but for now I think it is
clear enough that Cap'n Proto is not currently suitable for use with TypeScript.
[Contributions welcome](./CONTRIBUTING.md).
</details>

### Flat Buffers

<details>
<summary>TODO</summary>

1. TODO
</details>
