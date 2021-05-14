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

export default function method<
  Args extends MethodBase["args"],
  Result extends MethodBase["result"],
>(args: Args, result: Result): Method<Args, Result> {
  return {
    type: "method",
    args,
    result,
  };
}
