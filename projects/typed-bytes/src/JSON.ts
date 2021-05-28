import type Bicoder from "./Bicoder.ts";
import jsonGlobal from "./jsonGlobal.ts";

const JSON = {
  stringify: function <T>(_bicoder: Bicoder<T>, value: T): string {
    return jsonGlobal.stringify(value);
  },
  parse: function <T>(bicoder: Bicoder<T>, jsonString: string): T {
    const parsed = jsonGlobal.parse(jsonString);

    if (!bicoder.test(parsed)) {
      throw new Error("JSON does not match type");
    }

    return parsed;
  },
};

export default JSON;
