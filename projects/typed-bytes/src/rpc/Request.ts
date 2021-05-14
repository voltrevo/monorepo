import * as tb from "../index.ts";
import { ProtocolBase } from "./Protocol.ts";

type ValueOf<Obj> = Obj[keyof Obj];

type MethodMessage<
  Protocol extends ProtocolBase,
  MethodName extends keyof Protocol["methods"],
> = {
  id: number;
  method: MethodName;
  args: tb.BicoderTargets<Protocol["methods"][MethodName]["args"]>;
};

type Request<Protocol extends ProtocolBase> = tb.Bicoder<
  ValueOf<
    {
      [MethodName in keyof Protocol["methods"]]: MethodMessage<
        Protocol,
        MethodName
      >;
    }
  >
>;

export function RequestBicoder<Protocol extends ProtocolBase>(
  protocol: Protocol,
): Request<Protocol> {
  return tb.union(
    ...Object.keys(protocol.methods).map((methodName) =>
      tb.object({
        id: tb.size,
        method: tb.exact(methodName),
        args: tb.tuple(...protocol.methods[methodName].args),
      })
    ),
  ) as unknown as Request<Protocol>;
}

export default Request;
