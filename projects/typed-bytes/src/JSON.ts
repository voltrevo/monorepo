import type Bicoder from "./Bicoder.ts";
import globals from "./globals.ts";

const JSON = {
  stringify: function <T>(_bicoder: Bicoder<T>, value: T): string {
    return globals.JSON.stringify(value);
  },
  parse: function <T>(bicoder: Bicoder<T>, jsonString: string): T {
    const parsed = globals.JSON.parse(jsonString);

    if (!bicoder.test(parsed)) {
      throw new Error("JSON does not match type");
    }

    return parsed;
  },
};

export default JSON;
