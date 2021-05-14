import * as tb from "../index.ts";
import { ProtocolBase } from "./Protocol.ts";

type Implementation<Protocol extends ProtocolBase> = {
  [MethodName in keyof Protocol]: (
    ...args: tb.BicoderTargets<Protocol[MethodName]["args"]>
  ) => Promise<
    tb.TypeOf<Protocol[MethodName]["result"]>
  >;
};

export default Implementation;
