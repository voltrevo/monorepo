import render from "./render.ts";
import drawing from "./drawings/step08a.ts";

await Deno.writeFile("./drawing.png", render(drawing));
