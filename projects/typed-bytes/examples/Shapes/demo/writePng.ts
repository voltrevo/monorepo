import * as tb from "../../../mod.ts";

import render from "./render.ts";
import drawing from "./drawings/step09small.ts";
import * as shapes from "./shapes.ts";

await Deno.writeFile("./drawing.png", render(drawing));

console.log(tb.encodeBuffer(shapes.Drawing, drawing).byteLength, "bytes");
