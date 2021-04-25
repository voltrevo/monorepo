type Stream = {
  data: DataView;
  offset: number;
};

type Encoder<T> = {
  encode(stream: Stream, value: T): void;
};

type Decoder<T> = {
  decode(stream: Stream): T;
};

type Tester<T> = {
  test(value: unknown): value is T;
};

export type Bicoder<T> = Encoder<T> & Decoder<T> & Tester<T>;

export const size: Bicoder<number> = {
  encode(stream, value) {
    // TODO: Check value is encodable as a size (float strangeness)

    while (true) {
      let byte = value % 128;
      value -= byte;
      value /= 128;

      if (value > 0) {
        byte += 128;
      }

      stream.data.setUint8(stream.offset, byte);
      stream.offset++;

      if (value === 0) {
        break;
      }
    }
  },
  decode(stream) {
    let value = 0;
    let placeValue = 1;

    while (true) {
      const byte = stream.data.getUint8(stream.offset);
      stream.offset++;

      const more = byte >= 128;

      if (!more) {
        return value + byte * placeValue;
      }

      value += (byte - 128) * placeValue;
      placeValue *= 128;
    }
  },

  // TODO: Possible issues since we reject some numbers
  test(value): value is number {
    return (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0 &&
      Math.round(value) === value
    );
  },
};

export const buffer: Bicoder<ArrayBuffer> = {
  encode(stream, value) {
    size.encode(stream, value.byteLength);

    new Uint8Array(stream.data.buffer).set(
      new Uint8Array(value),
      stream.offset,
    );

    stream.offset += value.byteLength;
  },
  decode(stream) {
    const sz = size.decode(stream);

    const buf = stream.data.buffer.slice(
      stream.offset,
      stream.offset + sz,
    );

    stream.offset += sz;

    return buf;
  },
  test(value): value is ArrayBuffer {
    return value instanceof ArrayBuffer;
  },
};

export const number: Bicoder<number> = {
  encode(stream, value) {
    stream.data.setFloat64(stream.offset, value);
    stream.offset += 8;
  },
  decode(stream) {
    const value = stream.data.getFloat64(stream.offset);
    stream.offset += 8;
    return value;
  },
  test(value): value is number {
    return typeof value === "number";
  },
};

export const string: Bicoder<string> = {
  encode(stream, value) {
    buffer.encode(stream, new TextEncoder().encode(value).buffer);
  },
  decode(stream) {
    return new TextDecoder().decode(buffer.decode(stream));
  },
  test(value): value is string {
    return typeof value === "string";
  },
};

export const boolean: Bicoder<boolean> = {
  encode(stream, value) {
    stream.data.setUint8(stream.offset, value ? 1 : 0);
    stream.offset++;
  },
  decode(stream) {
    const byte = stream.data.getUint8(stream.offset);
    stream.offset++;
    return byte !== 1; // TODO: Be strict
  },
  test(value): value is boolean {
    return typeof value === "boolean";
  },
};

export const null_: Bicoder<null> = {
  encode(_stream, _value) {},
  decode(_stream) {
    return null;
  },
  test(value): value is null {
    return value === null;
  },
};

export const undefined_: Bicoder<undefined> = {
  encode(_stream, _value) {},
  decode(_stream) {
    return undefined;
  },
  test(value): value is undefined {
    return value === undefined;
  },
};

export function array<T>(element: Bicoder<T>): Bicoder<T[]> {
  return {
    encode(stream, value) {
      size.encode(stream, value.length);

      for (const el of value) {
        element.encode(stream, el);
      }
    },
    decode(stream) {
      const sz = size.decode(stream);
      const value: T[] = [];

      for (let i = 0; i < sz; i++) {
        value.push(element.decode(stream));
      }

      return value;
    },
    test(value): value is T[] {
      return Array.isArray(value) && value.every((v) => element.test(v));
    },
  };
}

export function object<T extends Record<string, unknown>>(
  elements: {
    [K in keyof T]: Bicoder<T[K]>;
  },
): Bicoder<T> {
  return {
    encode(stream, value) {
      for (const [k, v] of Object.entries(value)) {
        elements[k].encode(stream, v as T[typeof k]);
      }
    },
    decode(stream) {
      const value: Record<string, unknown> = {};

      for (const k of Object.keys(elements)) {
        value[k] = elements[k].decode(stream);
      }

      return value as T;
    },
    test(value): value is T {
      return (
        typeof value === "object" &&
        value !== null &&
        Object.keys(elements).every(
          (k) => elements[k].test((value as Record<string, unknown>)[k]),
        )
      );
    },
  };
}

export type StringMap<T> = { [key in string]?: T };

export function stringMap<T>(
  element: Bicoder<T>,
): Bicoder<StringMap<T>> {
  return {
    encode(stream, value) {
      const entries = Object.entries(value).filter(([, v]) => v !== undefined);
      size.encode(stream, entries.length);

      for (const [k, v] of entries) {
        string.encode(stream, k);
        element.encode(stream, v as Exclude<typeof v, undefined>);
      }
    },
    decode(stream) {
      const sz = size.decode(stream);
      const result: StringMap<T> = {};

      for (let i = 0; i < sz; i++) {
        const key = string.decode(stream);
        const value = element.decode(stream);
        result[key] = value;
      }

      return result;
    },
    test(value): value is StringMap<T> {
      return (
        typeof value === "object" &&
        value !== null &&
        Object.values(value).every((v) => v === undefined || element.test(v))
      );
    },
  };
}

type BicoderTargetsImpl<T> = (
  T extends [Bicoder<infer First>, ...infer Rest]
    ? [First, ...BicoderTargetsImpl<Rest>]
    : []
);

type BicoderTargets<T extends Bicoder<unknown>[]> = BicoderTargetsImpl<T>;

export function tuple<T extends Bicoder<unknown>[]>(
  ...elements: T
): Bicoder<BicoderTargets<T>> {
  return {
    encode(stream, value) {
      for (let i = 0; i < elements.length; i++) {
        elements[i].encode(stream, value[i]);
      }
    },
    decode(stream) {
      const results: unknown[] = [];

      for (const element of elements) {
        results.push(element.decode(stream));
      }

      return results as BicoderTargets<T>;
    },
    test(value): value is BicoderTargets<T> {
      return (
        Array.isArray(value) &&
        value.length === elements.length &&
        elements.every((element, i) => element.test(value[i]))
      );
    },
  };
}

export type TypeOf<B extends Bicoder<unknown>> = B extends Bicoder<infer T> ? T
  : never;

type UnionOf<T extends unknown[]> = T extends [infer First, ...infer Rest]
  ? First | UnionOf<Rest>
  : never;

export function union<T extends Bicoder<unknown>[]>(
  ...options: T
): Bicoder<UnionOf<BicoderTargets<T>>> {
  return {
    encode(stream, value) {
      for (let i = 0; i < options.length; i++) {
        const option = options[i];

        // TODO: For large structures, this might be inefficient because
        // substructures may get retested many times.
        // Possible solutions:
        // - Memoization
        // - Get clever about testing distinctions rather than full values
        // - Use generators for incremental testing, and stop incremental
        //   testing when all but one option has been eliminated
        if (option.test(value)) {
          size.encode(stream, i);
          option.encode(stream, value);
          return;
        }
      }

      throw new Error(`Could not encode ${value}`);
    },
    decode(stream) {
      const optionIndex = size.decode(stream);
      return options[optionIndex].decode(stream) as UnionOf<BicoderTargets<T>>;
    },
    test(value): value is UnionOf<BicoderTargets<T>> {
      for (let i = 0; i < options.length; i++) {
        if (options[i].test(value)) {
          return true;
        }
      }

      return false;
    },
  };
}

export function defer<T extends Bicoder<unknown>>(fn: () => T): T {
  return {
    encode: (stream, value) => fn().encode(stream, value),
    decode: (stream) => fn().decode(stream),
    test: (value): value is TypeOf<T> => fn().test(value),
  } as T;
}
