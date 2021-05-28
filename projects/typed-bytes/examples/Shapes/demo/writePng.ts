import render from "./render.ts";
import drawing from "./drawings/step10_2.ts";
import * as shapes from "./shapes.ts";

await Deno.writeFile("./drawing.png", render(drawing));

console.log(shapes.Drawing.encode(drawing).length, "bytes");
