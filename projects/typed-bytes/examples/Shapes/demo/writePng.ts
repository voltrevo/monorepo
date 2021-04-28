import render from "./render.ts";
import drawing from "./drawings/step04.ts";

await Deno.writeFile("./drawing.png", render(drawing));
