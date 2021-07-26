import * as tb from "../../../mod.ts";

export default tb.Protocol({
  sayHello: tb.Method(tb.string)(tb.string),
});
