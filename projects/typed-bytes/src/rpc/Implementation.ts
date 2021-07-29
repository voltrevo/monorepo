import * as tb from "../base.ts";
import { ProtocolBase } from "./Protocol.ts";

type Implementation<Protocol extends ProtocolBase> = {
  [MethodName in keyof Protocol["methods"]]: (
    ...args: tb.BicoderTargets<Protocol["methods"][MethodName]["args"]>
  ) => Promise<
    tb.TypeOf<Protocol["methods"][MethodName]["result"]>
  >;
};

type Foo = Implementation<{
  type: "protocol";
  methods: {
    greet: {
      type: "method";
      args: [tb.Bicoder<string>];
      result: tb.Bicoder<string>;
    };
  };
}>;

export default Implementation;
