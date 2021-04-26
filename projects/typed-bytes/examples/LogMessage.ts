import * as tb from "../mod.ts";

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
