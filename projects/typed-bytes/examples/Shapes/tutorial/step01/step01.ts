import * as tb from "../../../../mod.ts";

const Canvas = tb.object({
  width: tb.number,
  height: tb.number,
});

const buffer = Canvas.encode({
  width: 1280,
  height: 720,
});

/*
  64, 148,   0, 0, 0, 0, 0, 0, // 1280
  64, 134, 128, 0, 0, 0, 0, 0, //  720
*/
console.log(buffer);
