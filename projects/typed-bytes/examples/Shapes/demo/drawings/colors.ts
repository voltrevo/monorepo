import ensureType from "../helpers/ensureType.ts";
import * as shapes from "../shapes.ts";

export default ensureType<Record<string, shapes.Color>>()({
  black: { red: 0, green: 0, blue: 0, alpha: 255 },
  white: { red: 255, green: 255, blue: 255, alpha: 255 },
  red: { red: 255, green: 0, blue: 0, alpha: 255 },
  green: { red: 0, green: 255, blue: 0, alpha: 255 },
  blue: { red: 0, green: 0, blue: 255, alpha: 255 },
  halfGrey: { red: 128, green: 128, blue: 128, alpha: 128 },
});
