# Typed Bytes

_A public domain binary encoding library for TypeScript._

## Hello World

```sh
npm install typed-bytes
```

```ts
import * as tb from "typed-bytes";

console.log(
  tb.string.encode("Hello world!"),
);

/*
  Uint8Array(13) [
     12,  72, 101, 108, 108,
    111,  32, 119, 111, 114,
    108, 100,  33
  ]
*/
```

**Deno users**

No need for install, run the above code directly with this tweak:

```diff
-import * as tb from "typed-bytes";
+import * as tb from "https://raw.githubusercontent.com/voltrevo/monorepo/c1ff75a/projects/typed-bytes/mod.ts";
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
- you can extract type information from the bicoder, so you don't need to
  duplicate it

For example:

```ts
const LogMessage = tb.Object({
  level: tb.Enum("INFO", "WARN", "ERROR"),
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

const buffer = LogMessage.encode({
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
console.log(buffer);

/*
  // on hover:
  const decodedValue: {
    level: "INFO" | "WARN" | "ERROR";
    message: string;
  }
*/
const decodedValue = LogMessage.decode(buffer);
```

## [A More Complex Example](./examples/Shapes/README.md)

Suppose we were making a graphics application where the user can draw shapes on
a canvas. We want to be able to be able to encode the canvas and its shapes so
we can save it to disk, synchronize it with a remote display, or what-have-you.

![Snake](./examples/Shapes/tutorial/step10/drawing.png)

The image above is encoded in just 71 bytes.
[Keep reading](./examples/Shapes/README.md) for a step-by-step guide to create a
vector graphics format to achieve this using `typed-bytes`.

## RPC

To use RPC you need to provide a `bufferIO` which conforms to type `tb.BufferIO`
so that `typed-bytes` has a way to send and receive data:

```ts
type BufferIO = {
  read(): Promise<Uint8Array | null>;
  write(buffer: Uint8Array): Promise<void>;
};
```

_(In future, some convenience methods will probably be added to handle the
common TCP socket and WebSocket use cases here, but it's also important to keep
this because it allows you to provide whatever exotic transport you desire.)_

Then, define your protocol like this:

```ts
const GreeterProtocol = tb.Protocol({
  // A method that accepts a string and returns a string
  // (You can use more complex types too of course, as well as multiple
  // arguments.)
  sayHello: tb.Method(tb.string)(tb.string),
});
```

On the server, use `tb.serveProtocol`:

```ts
tb.serveProtocol(bufferIO, greeterProtocol, {
  sayHello: (name) => {
    return Promise.resolve(`Hi ${name}!`);
  },
});
```

On the client, use `tb.Client`:

```ts
const greeterClient = tb.Client(GreeterProtocol);

const reply = await greeterClient.sayHello("Alice");
console.log(reply); // "Hi Alice!"
```

[Complete example](./examples/rpc/Greeter/README.md).

This is all fully typed (and there's still no codegen involved). That means:

- When you type `greeterClient.`, your IDE will show you the list of methods
- Calls to those methods will have their arguments checked and the return type
  will be inferred correctly
- When you call `serveProtocol` you'll get useful intellisense related to the
  protocol you passed in and TypeScript will check your implementation provides
  all the methods correctly

## Status

`typed-bytes` isn't ready to offer a stable API.

Having said that, I believe it's very usable in its current form by pinning the
version. It's also only ~500 sloc, so if you have problems upgrading you have
the option of staying on your own fork.

## Plans

- Support for omitting fields instead of optionals needing to be present with
  `null`/`undefined`
- Better support for sparse objects / condense union options at the object level
  so that a whole byte isn't needed for each union option
- Optionally including some header bytes representing a digest of the type
  information
- Performance testing and tuning
- Tools for aligning with existing encodings
- Advice about versioning and compatibility when using `typed-bytes`
- Better support for user defined types (e.g. include classes)
- Async support
- Adaptors for files/sockets/etc
- Optional code-gen for boosting performance and supporting other languages
- Incorporate pointers to support file format enabling incremental changes to
  large data structures

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Why Use typed-bytes Instead Of...

### JSON

<details>
<summary>Less compact, no type information, click for more</summary>

1. typed-bytes is more compact:

```ts
const msg: LogMessage = {
  type: "INFO",
  message: "Test message",
};

new TextEncoder().encode(JSON.stringify(msg)); // 40 bytes
LogMessage.encode(msg); // 14 bytes
```

Of course, typed-bytes is relying on the type information to achieve this, and
you need that information to decode the buffer. With JSON, you can decode it in
a different place with just `JSON.parse`.

2. `JSON.parse` doesn't check the structure being decoded and doesn't provide
   type information:

```ts
// on hover:
// const jsonValue: any
const jsonValue = JSON.parse('{"type":"INFO","message":"Test message"}');

// on hover:
// const tbValue: {
//     level: "INFO" | "WARN" | "ERROR";
//     message: string;
// }
const tbValue = LogMessage.decode(buffer);
```

If you still really like JSON for its human readable format, and you like JSON's
API, you might still be interested in using `typed-bytes` for its type
information. I have included `tb.JSON` to mirror the `JSON` api like so:

```ts
// on hover:
// const typedValue: {
//     level: "INFO" | "WARN" | "ERROR";
//     message: string;
// }
const typedValue = tb.JSON.parse(
  LogMessage,
  '{"type":"INFO","message":"Test message"}',
);
// (This will also throw if the json is not a valid LogMessage.)

const jsonString = tb.JSON.stringify(LogMessage, {
  // These fields are type checked against `LogMessage`
  level: "INFO",
  message: "Test message",
});
```

(If you're not interested in type information, then I'm not sure why you're here
😄.)

</details>

### MessagePack

<details>
<summary>Less compact, no type information, click for more</summary>

1. typed-bytes is more compact:

```ts
const msg: LogMessage = {
  type: "INFO",
  message: "Test message",
};

msgpack.encode(msg); // 33 bytes
LogMessage.encode(msg); // 14 bytes
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
const tbValue = LogMessage.decode(buffer);
```

</details>

### Protocol Buffers

<details>
<summary>Code-gen, unnecessary code complexity, click for more</summary>

[Protobuf mini-project containing these
examples.](./comparisons/protobuf/README.md)

1. Requires learning a special-purpose `.proto` language (can be a positive _if_
   you need to share a protocol with a team that doesn't want to interact with
   TypeScript)

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

3. Protobuf requires you to use its wrappers around your objects which is more
   verbose:

```ts
// More verbose: special protobuf object instead of vanilla object
const msg = new LogMessage({
  // More verbose: enum wrapper instead of vanilla string
  level: LogMessage.Level["INFO"],
  message: "Test message",
});
```

4. Assuming you want to use protobuf version 3 (as opposed to version 2 which
   was superseded by version 3 five years ago), protobuf forces all fields to be
   optional.

TypeScript cannot tell you when you have forgotten a field:

```ts
const msg = new LogMessage({
  // Forgot `level`, but this compiles just fine
  message: "Test message",
});
```

Protobuf is inconsistent about how it represents missing fields:

```ts
const emptyMessage = LogMessage.decode(
  LogMessage.encode(new LogMessage()).finish(),
);
```

If you use protobuf's wrapped object (and likely other contexts when using
cross-language tooling) it will give you its default value for that type:

```ts
console.log(JSON.stringify(emptyMessage.message)); /*
  ""
*/

// This means you can't tell the difference between the field being missing or
// present as an empty string when accessing the field in this way.
```

But if you want to work with plain objects, `.toJSON` will omit the fields
entirely:

```ts
console.log(emptyMessage.toJSON()); /*
  {}
*/
```

In the real world, fields are very often required. It is generally the expected
default when programming - if you say that a structure has a field, then an
instance of that structure must have that field.

In many cases, this means you need to take special care to deal with the fact
that protobuf considers your fields to be optional, even though your application
considers messages that are missing those fields to be invalid, and thus should
never have been encoded/decoded in the first place.

Protobuf's reason for doing this is that it helps with compatibility. If you are
forced to check whether fields are present, then an old message which doesn't
have that field will be able to be processed by your upgrade that includes that
field (even if that means the upgrade throws it out because it is required
nonetheless). Some may find this valuable. `typed-bytes` allows you to make this
decision instead of deciding for you.

5. `typed-bytes` allows entities of all shapes and sizes, but protobuf only
   supports objects:

```ts
const LogMessages = tb.Array(LogMessage);
```

If you want an array in protobuf, you must wrap it in an object:

```proto
message LogMessages {
  repeated LogMessage content = 1;
}
```

</details>

### Avro

<details>
<summary>Verbose, TypeScript is unofficial, no type information, click for
more</summary>

[Avro mini-project containing these examples.](./comparisons/avro/README.md)

Note: avro doesn't have any official support for JavaScript or TypeScript. The
best unofficial library appears to be [avsc](https://github.com/mtth/avsc), and
this is being used for comparison here.

1. avsc's first example from
   [their README.md](https://github.com/mtth/avsc/blob/master/README.md) is
   rejected by the TypeScript compiler.

```ts
import avro from "avsc";

/*
Argument of type '{ type: "record"; fields: ({ name: string; type: { type: "enum"; symbols: string[]; }; } | { name: string; type: string; })[]; }' is not assignable to parameter of type 'Schema'.
  Type '{ type: "record"; fields: ({ name: string; type: { type: "enum"; symbols: string[]; }; } | { name: string; type: string; })[]; }' is not assignable to type 'string'. ts(2345)
*/
const type = avro.Type.forSchema({
  type: "record",
  fields: [
    { name: "kind", type: { type: "enum", symbols: ["CAT", "DOG"] } },
    { name: "name", type: "string" },
  ],
});
```

On troubleshooting this I discovered the `name` field is required, so you can
fix the example above by adding that field at the top level and also in the
embedded enum type.

2. Schemas are much more verbose than `typed-bytes`:

```ts
// avsc
const LogMessage = avro.Type.forSchema({
  name: "LogMessage",
  type: "record",
  fields: [
    {
      name: "level",
      type: {
        type: "enum",
        name: "Level",
        symbols: ["INFO", "WARN", "ERROR"],
      },
    },
    { name: "message", type: "string" },
  ],
});
```

```ts
// typed-bytes
const LogMessage = tb.Object({
  level: tb.Enum("INFO", "WARN", "ERROR"),
  message: tb.string,
});
```

3. Type information is not available to the TypeScript compiler (or your IDE):

```ts
// `.toBuffer` below is typed as:
// (method) Type.toBuffer(value: any): any
const buf = LogMessage.toBuffer({
  level: "INFO",
  message: "Test message",
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
<summary>Lack of support, slow, hacky, click for more</summary>

To be clear, we are talking about using Cap'n Proto from TypeScript here. If you
are not using TypeScript these comparisons do not apply.

1. Library describes itself as slow.

> Because v8 cannot inline or otherwise optimize calls into C++ code, and
> because the C++ bindings are implemented in terms of the "dynamic" API, this
> implementation is actually very slow.

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

### FlatBuffers

<details>
<summary>Code-gen, strange API, non-js dependencies, click for more</summary>

[FlatBuffers mini-project containing these
examples.](./comparisons/flatbuffers/README.md)

1. Requires learning a special-purpose `.fbs` language.

Here's the `.fbs` file for `LogMessage`:

```fbs
// FlatBuffers doesn't appear to require namespaces, but for some reason they
// are needed to get correct TypeScript output.
namespace Sample;

enum Level: byte { INFO = 0, WARN = 1, ERROR = 2 }

table LogMessage {
  level: Level;
  message: string;
}
```

2. Requires code-gen.

```sh
flatc --ts LogMessage.fbs
```

3. Code-gen requires non-js dependency `flatc`.

On Ubuntu 20.04 I was able to install using:

```sh
sudo apt install flatbuffers-compiler
```

4. Version 2.0.0 of the npm package was released in a broken state.

Hopefully they have fixed this by the time you're reading this. I was unlucky
enough to try to use FlatBuffers for the first time on the day this release went
out, and it took me some time to realise that 2.0.0 was just broken and I needed
to install 1.x.

(Simply running `require('flatbuffers')` threw an error. As far as I can tell
the artifact they pushed to npm was incomplete.)

5. `flatc`'s TypeScript code requires a workaround to compile.

The first line of code generated by `flatc` is:

```ts
import { flatbuffers } from "./flatbuffers";
```

(In fact, for some reason, if you don't specify a namespace in your `.fbs` file,
`flatc` doesn't even emit this import, and generates unresolved references to
`flatbuffers`.)

`./flatbuffers` does not exist, but it's clear this is intended to be the
FlatBuffers library.

[Their TypeScript guide](https://google.github.io/flatbuffers/flatbuffers_guide_use_typescript.html)
doesn't mention this, but the fix in my case was to create `./flatbuffers.ts`
with this content:

```ts
export { flatbuffers } from "flatbuffers";
```

6. FlatBuffers' API is... strange

Here's what I came up with to encode a `LogMessage`:

```ts
let builder = new flatbuffers.Builder();

// Strings need to be created externally, otherwise FlatBuffers throws:
//  Error: FlatBuffers: object serialization must not be nested.
//
// (typed-bytes doesn't have this kind of issue)
const testMessage = builder.createString("Test message");

// This is clumsy and verbose. I'd also argue it doesn't even meet the
// requirement of encoding a LogMessage as binary. Instead it's an API that
// gives you some tools to help you do that in a way that is still very manual.
Sample.LogMessage.startLogMessage(builder);
Sample.LogMessage.addLevel(builder, Sample.Level.INFO);
Sample.LogMessage.addMessage(builder, testMessage);
const msgOffset = Sample.LogMessage.endLogMessage(builder);
builder.finish(msgOffset);

const buf = builder.asUint8Array();

console.log(buf); /*
  // This is really long. I'm not sure why. The other schema-based encodings
  // (including typed-bytes) have managed 14-16 bytes. I'm not going to put this
  // as a concrete point for now because it might not be true outside of this
  // example and FlatBuffers has proved exceptionally difficult to work with so
  // I don't have enough time to get to the bottom of this. If you know more
  // about what's going on please consider contributing.
  Uint8Array(40) [
     12,   0,   0,  0,   8,   0,   8,   0,   0,   0,
      4,   0,   8,  0,   0,   0,   4,   0,   0,   0,
     12,   0,   0,  0,  84, 101, 115, 116,  32, 109,
    101, 115, 115, 97, 103, 101,   0,   0,   0,   0
  ]
*/
```

the decode part is almost as strange:

```ts
const byteBuffer = new flatbuffers.ByteBuffer(buf);
const decodedValue = Sample.LogMessage.getRootAsLogMessage(byteBuffer);

// Outputs internal details and not level/message:
console.log(decodedValue);

// You need to get the fields one by one.
console.log({
  level: decodedValue.level(), // 0, not 'INFO'
  message: decodedValue.message(),
});
```

I think FlatBuffers is intended to be very low level. It's targeting a use case
where you interact directly with bytes instead of ever really having js-native
objects. Even so, I expect it is possible to make this API much more ergonomic,
and I think it's just a case of trying to support every major language, and js
simply hasn't received enough attention to make something that's simple to use.

</details>
