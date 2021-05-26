import * as tb from "../../../../mod.ts";

const Canvas = tb.object({
  width: tb.size,
  height: tb.size,
});

const buffer = tb.encodeBuffer(Canvas, {
  width: 1280,
  height: 720,
});

/*
  128, 10, // 1280
  208,  5, //  720
*/
console.log(buffer);
