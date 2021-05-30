import Bicoder from "./Bicoder.ts";

// deno-lint-ignore no-explicit-any
type ExplicitAny = any;

export type AnyBicoder = Bicoder<ExplicitAny>;

type BicoderTargetsImpl<T> = (
  T extends [Bicoder<infer First>, ...infer Rest]
    ? [First, ...BicoderTargetsImpl<Rest>]
    : []
);

export type BicoderTargets<T extends AnyBicoder[]> = BicoderTargetsImpl<T>;

export type TypeOf<B extends AnyBicoder> = B extends Bicoder<infer T> ? T
  : never;

export type UnionOf<T extends unknown[]> = (
  T extends [infer First, ...infer Rest] ? First | UnionOf<Rest>
    : never
);

export type Primitive =
  | undefined
  | null
  | boolean
  | number
  | string;
