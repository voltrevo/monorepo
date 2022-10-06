import assertExists from "./helpers/assertExists.ts";
import Bicoder from "./Bicoder.ts";
import globals from "./globals.ts";
import type {
  AnyBicoder,
  BicoderTargets,
  Primitive,
  TypeOf,
  UnionOf,
} from "./types.ts";
import type Stream from "./Stream.ts";
import BufferStream from "./BufferStream.ts";

// deno-lint-ignore no-explicit-any
type ExplicitAny = any;

export const size = new Bicoder<number>({
  write(stream, value) {
    // TODO: Check value is encodable as a size (float strangeness)

    while (true) {
      let byte = value % 128;
      value -= byte;
      value /= 128;

      if (value > 0) {
        byte += 128;
      }

      stream.writeByte(byte);

      if (value === 0) {
        break;
      }
    }
  },
  read(stream) {
    let value = 0;
    let placeValue = 1;

    while (true) {
      const byte = stream.readByte();

      const more = byte >= 128;

      if (!more) {
        return value + byte * placeValue;
      }

      value += (byte - 128) * placeValue;
      placeValue *= 128;
    }
  },
  test(value) {
    return (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0 &&
      Math.round(value) === value
    );
  },
});

export const isize = new Bicoder<number>({
  write(stream, value) {
    const sz = 2 * Math.abs(value) + (value < 0 ? 1 : 0);
    stream.write(size, sz);
  },
  read(stream) {
    const sz = stream.read(size);
    const positive = sz % 2 === 0;
    const absSize = (sz - (positive ? 0 : 1)) / 2;
    const sign = positive ? 1 : -1;

    return sign * absSize;
  },
  test(value) {
    return (
      typeof value === "number" &&
      Number.isFinite(value) &&
      Math.round(value) === value
    );
  },
});

export const buffer = new Bicoder<Uint8Array>({
  write(stream, value) {
    stream.write(size, value.length);
    stream.writeBuffer(value);
  },
  read(stream) {
    const sz = stream.read(size);
    return stream.readBuffer(sz);
  },
  test(value) {
    return value instanceof Uint8Array;
  },
});

export const byte = new Bicoder<number>({
  write(stream, value) {
    stream.writeByte(value);
  },
  read(stream) {
    return stream.readByte();
  },
  test(value) {
    return (
      typeof value === "number" &&
      Number.isFinite(value) &&
      0 <= value &&
      value < 256 &&
      value === Math.round(value)
    );
  },
});

export const number: Bicoder<number> = new Bicoder({
  write(stream, value) {
    const buf = new ArrayBuffer(8);
    new DataView(buf).setFloat64(0, value);
    stream.writeBuffer(new Uint8Array(buf));
  },
  read(stream) {
    return new DataView(stream.readBuffer(8).slice().buffer).getFloat64(0);
  },
  test(value) {
    return typeof value === "number";
  },
});

export const string: Bicoder<string> = new Bicoder<string>({
  write(stream, value) {
    stream.write(buffer, new TextEncoder().encode(value));
  },
  read(stream) {
    return new TextDecoder().decode(stream.read(buffer));
  },
  test(value) {
    return typeof value === "string";
  },
});

export const boolean = new Bicoder<boolean>({
  write(stream, value) {
    stream.writeByte(value ? 1 : 0);
  },
  read(stream) {
    return stream.readByte() !== 0; // TODO: Be strict
  },
  test(value) {
    return typeof value === "boolean";
  },
});

export const null_ = new Bicoder<null>({
  write(_stream, _value) {},
  read(_stream) {
    return null;
  },
  test(value) {
    return value === null;
  },
});

export const undefined_ = new Bicoder<undefined>({
  write(_stream, _value) {},
  read(_stream) {
    return undefined;
  },
  test(value) {
    return value === undefined;
  },
});

export function Array<T>(element: Bicoder<T>): Bicoder<T[]> {
  return new Bicoder<T[]>({
    write(stream, value) {
      stream.write(size, value.length);

      for (const el of value) {
        stream.write(element, el);
      }
    },
    read(stream) {
      const sz = stream.read(size);
      const value: T[] = [];

      for (let i = 0; i < sz; i++) {
        value.push(stream.read(element));
      }

      return value;
    },
    test(value) {
      return (
        globals.Array.isArray(value) &&
        value.every((v) => element.test(v))
      );
    },
    meta: {
      fn: Array,
      args: [element],
    },
  });
}

function Object_<T extends Record<string, AnyBicoder>>(
  elements: T,
): Bicoder<
  {
    [K in keyof T]: TypeOf<T[K]>;
  }
> {
  type Value = {
    [K in keyof T]: TypeOf<T[K]>;
  };

  return new Bicoder<Value>({
    write(stream, value) {
      for (const [k, v] of globals.Object.entries(value)) {
        stream.write(elements[k], v as T[typeof k]);
      }
    },
    read(stream) {
      const value: Record<string, unknown> = {};

      for (const k of globals.Object.keys(elements)) {
        value[k] = stream.read(elements[k]);
      }

      return value as Value;
    },
    test(value) {
      const keys = globals.Object.keys(elements);

      return (
        typeof value === "object" &&
        value !== null &&
        keys.length === globals.Object.keys(value).length &&
        keys.every(
          (k) => elements[k].test((value as Record<string, unknown>)[k]),
        )
      );
    },
    meta: {
      fn: Object_,
      args: [elements],
    },
  });
}

export { Object_ as Object };

export type StringMap<T> = { [key in string]?: T };

export function StringMap<T>(
  element: Bicoder<T>,
): Bicoder<StringMap<T>> {
  return new Bicoder<StringMap<T>>({
    write(stream, value) {
      const entries = globals.Object.entries(value)
        .filter(([, v]) => v !== undefined);

      stream.write(size, entries.length);

      for (const [k, v] of entries) {
        stream.write(string, k);
        stream.write(element, v as Exclude<typeof v, undefined>);
      }
    },
    read(stream) {
      const sz = stream.read(size);
      const result: StringMap<T> = {};

      for (let i = 0; i < sz; i++) {
        const key = stream.read(string);
        const value = stream.read(element);
        result[key] = value;
      }

      return result;
    },
    test(value) {
      return (
        typeof value === "object" &&
        value !== null &&
        globals.Object.values(value)
          .every((v) => v === undefined || element.test(v))
      );
    },
    meta: {
      fn: StringMap,
      args: [element],
    },
  });
}

export function Tuple<T extends AnyBicoder[]>(
  ...elements: T
): Bicoder<BicoderTargets<T>> {
  return new Bicoder<BicoderTargets<T>>({
    write(stream, value) {
      for (let i = 0; i < elements.length; i++) {
        stream.write(elements[i], value[i]);
      }
    },
    read(stream) {
      const results: unknown[] = [];

      for (const element of elements) {
        results.push(stream.read(element));
      }

      return results as BicoderTargets<T>;
    },
    test(value) {
      return (
        globals.Array.isArray(value) &&
        value.length === elements.length &&
        elements.every((element, i) => element.test(value[i]))
      );
    },
    meta: {
      fn: Tuple,
      args: elements,
    },
  });
}

export function Union<T extends AnyBicoder[]>(
  ...options: T
): Bicoder<UnionOf<BicoderTargets<T>>> {
  return new Bicoder<UnionOf<BicoderTargets<T>>>({
    write(stream, value) {
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
          stream.write(size, i);
          stream.write(option, value);
          return;
        }
      }

      throw new Error(`Could not encode ${value}`);
    },
    read(stream) {
      const optionIndex = stream.read(size);
      return stream.read(options[optionIndex]) as UnionOf<BicoderTargets<T>>;
    },
    test(value) {
      for (let i = 0; i < options.length; i++) {
        if (options[i].test(value)) {
          return true;
        }
      }

      return false;
    },
    meta: {
      fn: Union as ExplicitAny,
      args: options,
    },
  });
}

export function defer<T>(fn: () => Bicoder<T>): Bicoder<T> {
  return new Bicoder<T>({
    write: (stream, value) => stream.write(fn(), value),
    read: (stream) => stream.read(fn()),
    test: (value) => fn().test(value),
    meta: {
      fn: defer,
      args: [fn],
    },
  });
}

export function Exact<T>(exactValue: T): Bicoder<T> {
  return new Bicoder<T>({
    write(_stream, _value) {},
    read(_stream) {
      return exactValue;
    },
    test(value) {
      return value === exactValue;
    },
    meta: {
      fn: Exact as ExplicitAny,
      args: [exactValue],
    },
  });
}

export function Enum<T extends Primitive[]>(
  ...args: T
): Bicoder<UnionOf<T>> {
  return Union(...args.map(Exact)) as unknown as Bicoder<UnionOf<T>>;
}

export const bigint = new Bicoder<bigint>({
  write(stream, value) {
    if (value === BigInt(0)) {
      stream.writeByte(0);
      return;
    }

    const positive = value >= BigInt(0);
    const absValue = positive ? value : -value;

    const hex = absValue.toString(16);
    const sz = Math.floor((hex.length + 1) / 2);
    stream.write(size, (positive ? 0 : 1) + 2 * sz);

    let pos = 0;

    if (hex.length % 2 === 1) {
      stream.writeByte(parseInt(hex[0], 16));
      pos++;
    }

    for (; pos < hex.length; pos += 2) {
      stream.writeByte(parseInt(hex.slice(pos, pos + 2), 16));
    }
  },
  read(stream) {
    let sz = stream.read(size);

    if (sz === 0) {
      return BigInt(0);
    }

    const positive = sz % 2 === 0;
    sz = (positive ? sz : sz - 1) / 2;
    let str = "0x";

    for (let i = 0; i < sz; i++) {
      str += stream.readByte().toString(16).padStart(2, "0");
    }

    const absValue = BigInt(str);

    return positive ? absValue : -absValue;
  },
  test(value) {
    return typeof value === "bigint";
  },
});

export function Optional<T>(element: Bicoder<T>): Bicoder<T | null> {
  return Union(null_, element);
}

function createAny(...extraBicoders: AnyBicoder[]) {
  const deferredAny = defer(() => Any);

  const Any: Bicoder<ExplicitAny> = Union(
    undefined_,
    null_,
    boolean,
    number,
    string,
    bigint,
    Array(deferredAny),
    StringMap(deferredAny),
    ...extraBicoders,
  );

  return Any;
}

export const Any = createAny(defer(() => Type));

export function createType(...extraBicoders: AnyBicoder[]) {
  const bicoders: AnyBicoder[] = [
    undefined_,
    null_,
    boolean,
    number,
    string,
    bigint,
    byte,
    size,
    isize,
    Array(null_),
    Object_({}),
    StringMap(null_),
    Tuple(),
    Union(null_),
    Exact(null),
    ...extraBicoders, // TODO: Separate numbering for backwards compatibility
  ];

  function Identity(bicoder: AnyBicoder) {
    return bicoder.meta?.fn ?? bicoder;
  }

  const identities = bicoders.map(Identity);

  function IdentityIndex(bicoder: AnyBicoder) {
    const idx = identities.indexOf(Identity(bicoder));

    if (idx === -1) {
      throw new Error("Can't get identity index of bicoder");
    }

    return idx;
  }

  const Type = new Bicoder<AnyBicoder>({
    write(stream: Stream, value: AnyBicoder) {
      const Any = createAny(...extraBicoders, {
        write: writeImpl,
        test(value) {
          return value instanceof Bicoder;
        },
      } as AnyBicoder);

      const AnyArgs = Array(Any);

      const encodedTypes: Uint8Array[] = [];
      const encodedTypeMap: Map<AnyBicoder, number> = new Map();
      let nextEncodedTypeIndex = identities.length;

      function writeImpl(innerStream: Stream, value: AnyBicoder) {
        // If it's a defer, unwrap it.
        while (value.meta?.fn === defer) {
          value = value.meta?.args[0]();
        }

        if (value.meta === undefined) {
          innerStream.write(size, IdentityIndex(value));
          return;
        }

        const existingTypeIndex = encodedTypeMap.get(value);

        if (existingTypeIndex !== undefined) {
          innerStream.write(size, existingTypeIndex);
          return;
        }

        const newTypeIndex = nextEncodedTypeIndex++;
        encodedTypeMap.set(value, newTypeIndex);

        innerStream.write(size, newTypeIndex);

        const typeStream = new BufferStream();

        typeStream.write(size, IdentityIndex(value));
        typeStream.write(AnyArgs, value.meta.args);

        encodedTypes[newTypeIndex - identities.length] = typeStream.get();
      }

      const rootTypeStream = new BufferStream();
      writeImpl(rootTypeStream, value);

      stream.write(Array(buffer), encodedTypes);
      stream.writeBuffer(rootTypeStream.get());
    },
    read(stream: Stream) {
      const Any = createAny(
        { read: readImpl } as AnyBicoder,
        ...extraBicoders,
      );

      const AnyArgs = Array(Any);

      const encodedTypeMap: Map<number, AnyBicoder> = new Map();

      function readImpl(innerStream: Stream) {
        const id = innerStream.read(size);

        if (id >= identities.length) {
          return (
            encodedTypeMap.get(id) ??
              defer(() => assertExists(encodedTypeMap.get(id)))
          );
        }

        const identity = assertExists(identities[id]);

        if (identity instanceof Bicoder) {
          return identity;
        }

        const args = innerStream.read(AnyArgs);

        return identity(...args);
      }

      const encodedTypes = stream.read(Array(buffer));

      for (let i = 0; i < encodedTypes.length; i++) {
        const typeStream = new BufferStream(encodedTypes[i]);
        encodedTypeMap.set(identities.length + i, readImpl(typeStream));
      }

      return readImpl(stream);
    },
    test(value) {
      return value instanceof Bicoder;
    },
  });

  identities.push(Identity(Type));

  return Type;
}

export const Type = createType();
