import type Stream from "./Stream.ts";

export type Bicoder<T> = {
  encode(stream: Stream, value: T): void;
  decode(stream: Stream): T;
  test(value: unknown): boolean;
  echo(value: T): T;
};

// deno-lint-ignore no-explicit-any
type ExplicitAny = any;

export type AnyBicoder = Bicoder<ExplicitAny>;

export type StringMap<T> = { [key in string]?: T };

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
