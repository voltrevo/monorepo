import * as tb from "../../../../mod.ts";

const Canvas = tb.Object({
  width: tb.size,
  height: tb.size,
});

const buffer = Canvas.encode({
  width: 1280,
  height: 720,
});

/*
  128, 10, // 1280
  208,  5, //  720
*/
console.log(buffer);
