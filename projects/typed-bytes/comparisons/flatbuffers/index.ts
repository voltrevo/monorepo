import { flatbuffers } from './flatbuffers';

import { Sample } from './LogMessage_generated';

let builder = new flatbuffers.Builder();

// Strings need to be created externally, otherwise FlatBuffers throws:
//  Error: FlatBuffers: object serialization must not be nested.
//
// (typed-bytes doesn't have this kind of issue)
const testMessage = builder.createString('Test message');

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
  Uint8Array(40) [
     12,   0,   0,  0,   8,   0,   8,   0,   0,   0,
      4,   0,   8,  0,   0,   0,   4,   0,   0,   0,
     12,   0,   0,  0,  84, 101, 115, 116,  32, 109,
    101, 115, 115, 97, 103, 101,   0,   0,   0,   0
  ]
*/

const byteBuffer = new flatbuffers.ByteBuffer(buf);
const decodedValue = Sample.LogMessage.getRootAsLogMessage(byteBuffer)

// Outputs internal details and not level/message:
console.log(decodedValue);

// You need to get the fields one by one.
console.log({
  level: decodedValue.level(), // 0, not 'INFO'
  message: decodedValue.message(),
});
