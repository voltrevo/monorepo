import { flatbuffers } from './flatbuffers';

import { Sample } from './LogMessage_generated';

let builder = new flatbuffers.Builder();

Sample.LogMessage.startLogMessage(builder);
Sample.LogMessage.addLevel(builder, Sample.Level.INFO);
Sample.LogMessage.addMessage(builder, builder.createString('Test message'));
const msgOffset = Sample.LogMessage.endLogMessage(builder);
builder.finish(msgOffset);

console.log(builder.asUint8Array());
