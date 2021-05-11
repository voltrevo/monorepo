import { LogMessage } from './messages';

// More verbose: special protobuf object instead of vanilla object
const msg = new LogMessage({
  // More verbose: enum wrapper instead of vanilla string
  level: LogMessage.Level['INFO'],
  message: 'Test message',
});

const buf = LogMessage.encode(msg).finish();

console.log(buf); /*
  // 16 bytes, fair. typed-bytes is slightly shorter at 14 bytes.
  <Buffer 08 01 12 0c 54 65 73 74 20 6d 65 73 73 61 67 65>
*/

const decoded = LogMessage.decode(buf);

console.log(decoded); /*
  LogMessage { // Special protobuf object instead of vanilla object
    level: 1, // 1 instead of 'INFO'
    message: 'Test message',
  }
*/

// Now we get a vanilla object but we've lost type information. This means that
// if you want to use your protobuf entities in your application, you'll need
// to do a manual conversion or embrace protobuf's wrappers.
//
// On hover:
// const decodedJSON: {
//   [k: string]: any;
// }
const decodedJSON = decoded.toJSON();

console.log(decodedJSON); /*
  {
    level: 'INFO',
    message: 'Test message',
  }
*/
