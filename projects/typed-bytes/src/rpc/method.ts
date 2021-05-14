import * as tb from "../index.ts";

export type MethodBase = {
  type: "method";
  args: tb.AnyBicoder[];
  result: tb.AnyBicoder;
};

type Method<
  Args extends MethodBase["args"],
  Result extends MethodBase["result"],
> = {
  type: "method";
  args: Args;
  result: Result;
};

// deno-lint-ignore no-explicit-any
type ExplicitAny = any;

export default function method<
  Args extends MethodBase["args"],
>(
  ...args: Args
): <ResultArgs extends [MethodBase["result"]] | []>(
  ...resultArgs: ResultArgs
) => Method<
  Args,
  ResultArgs extends [] ? tb.Bicoder<void> : ResultArgs[0]
> {
  return (...resultArgs) => ({
    type: "method",
    args,
    result: (resultArgs[0] ?? tb.undefined_) as ExplicitAny,
  });
}
