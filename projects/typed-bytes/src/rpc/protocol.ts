import * as tb from "../index.ts";
import method, { MethodBase } from "./method.ts";

type SpecBase = Record<string, MethodBase>;

type MethodMessage<Spec extends SpecBase, MethodName extends keyof Spec> = {
  method: MethodName;
  args: tb.BicoderTargets<Spec[MethodName]["args"]>;
};

type ValuesOf<Obj> = Obj[keyof Obj];

type Protocol<Spec extends SpecBase> = {
  type: "protocol";
  spec: Spec;
  sendBicoder: tb.Bicoder<
    ValuesOf<
      {
        [MethodName in keyof Spec]: MethodMessage<Spec, MethodName>;
      }
    >
  >;
};

export default function protocol<Spec extends SpecBase>(
  spec: Spec,
): Protocol<Spec> {
  const methodNames = Object.keys(spec);

  const sendBicoder = tb.union(
    ...methodNames.map((methodName) =>
      tb.object({
        method: tb.exact(methodName),
        args: tb.tuple(...spec[methodName].args),
      })
    ),
  ) as unknown as Protocol<Spec>["sendBicoder"];

  return {
    type: "protocol",
    spec,
    sendBicoder,
  };
}

function foo() {
  const p: any = protocol({
    ping: method([tb.string], tb.string),
  });

  p.ping.send("foo"); // buffer
  p.ping.reply("bar"); // buffer
}
