import avro from 'avsc';

// This is a lot more verbose than typed-bytes.
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

// No type information is available for LogMessage. `.toBuffer` below accepts
// `any`. Its return type is also, strangely, `any`.
const buf = LogMessage.toBuffer({
  level: 'INFO',
  message: 'Test message',
});

console.log(buf); /*
  14 bytes. Same length as typed-bytes.
  <Buffer 00 18 54 65 73 74 20 6d 65 73 73 61 67 65>
*/

// Again, `.fromBuffer` returns `any`.
console.log(LogMessage.fromBuffer(buf)); /*
  // Doesn't restore the plain object we encoded, but ok
  LogMessage { level: 'INFO', message: 'Test message' }
*/
