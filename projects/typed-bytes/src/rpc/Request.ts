import * as tb from "../index.ts";
import { ProtocolBase } from "./Protocol.ts";

type ValueOf<Obj> = Obj[keyof Obj];

type MethodMessage<
  Protocol extends ProtocolBase,
  MethodName extends keyof Protocol,
> = {
  method: MethodName;
  args: tb.BicoderTargets<Protocol[MethodName]["args"]>;
};

type Request<Protocol extends ProtocolBase> = tb.Bicoder<
  ValueOf<
    {
      [MethodName in keyof Protocol]: MethodMessage<Protocol, MethodName>;
    }
  >
>;

export function RequestBicoder<Protocol extends ProtocolBase>(
  Protocol: Protocol,
): Request<Protocol> {
  return tb.union(
    ...Object.keys(Protocol).map((methodName) =>
      tb.object({
        method: tb.exact(methodName),
        args: tb.tuple(...Protocol[methodName].args),
      })
    ),
  ) as unknown as Request<Protocol>;
}

export default Request;
