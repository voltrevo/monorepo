import Bicoder from "./Bicoder.ts";
import type {
  AnyBicoder,
  BicoderTargets,
  Primitive,
  StringMap,
  UnionOf,
} from "./types.ts";

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

export const number = new Bicoder<number>({
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

export const string = new Bicoder<string>({
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
    return stream.readByte() !== 1; // TODO: Be strict
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

export function array<T>(element: Bicoder<T>): Bicoder<T[]> {
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
      return Array.isArray(value) && value.every((v) => element.test(v));
    },
  });
}

export function object<T extends Record<string, unknown>>(
  elements: {
    [K in keyof T]: Bicoder<T[K]>;
  },
): Bicoder<T> {
  return new Bicoder<T>({
    write(stream, value) {
      for (const [k, v] of Object.entries(value)) {
        stream.write(elements[k], v as T[typeof k]);
      }
    },
    read(stream) {
      const value: Record<string, unknown> = {};

      for (const k of Object.keys(elements)) {
        value[k] = stream.read(elements[k]);
      }

      return value as T;
    },
    test(value) {
      const keys = Object.keys(elements);

      return (
        typeof value === "object" &&
        value !== null &&
        keys.length === Object.keys(value).length &&
        keys.every(
          (k) => elements[k].test((value as Record<string, unknown>)[k]),
        )
      );
    },
  });
}

export function stringMap<T>(
  element: Bicoder<T>,
): Bicoder<StringMap<T>> {
  return new Bicoder<StringMap<T>>({
    write(stream, value) {
      const entries = Object.entries(value).filter(([, v]) => v !== undefined);
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
        Object.values(value).every((v) => v === undefined || element.test(v))
      );
    },
  });
}

export function tuple<T extends AnyBicoder[]>(
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
        Array.isArray(value) &&
        value.length === elements.length &&
        elements.every((element, i) => element.test(value[i]))
      );
    },
  });
}

export function union<T extends AnyBicoder[]>(
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
  });
}

export function defer<T>(fn: () => Bicoder<T>): Bicoder<T> {
  return new Bicoder<T>({
    write: (stream, value) => stream.write(fn(), value),
    read: (stream) => stream.read(fn()),
    test: (value) => fn().test(value),
  });
}

export function exact<T extends Primitive>(exactValue: T): Bicoder<T> {
  return new Bicoder<T>({
    write(_stream, _value) {},
    read(_stream) {
      return exactValue;
    },
    test(value) {
      return value === exactValue;
    },
  });
}

export function enum_<T extends Primitive[]>(
  ...args: T
): Bicoder<UnionOf<T>> {
  return union(...args.map(exact)) as unknown as Bicoder<UnionOf<T>>;
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

export function optional<T>(element: Bicoder<T>): Bicoder<T | null> {
  return union(null_, element);
}
