import type {
  AnyBicoder,
  Bicoder,
  BicoderTargets,
  Primitive,
  StringMap,
  UnionOf,
} from "./types.ts";

export const echo = function <T>(value: T) {
  return value;
};

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

      stream.writeByte(byte);

      if (value === 0) {
        break;
      }
    }
  },
  decode(stream) {
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

  echo,
};

export const isize: Bicoder<number> = {
  encode(stream, value) {
    const sz = 2 * Math.abs(value) + (value < 0 ? 1 : 0);
    stream.write(size, sz);
  },

  decode(stream) {
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

  echo,
};

export const buffer: Bicoder<Uint8Array> = {
  encode(stream, value) {
    size.encode(stream, value.byteLength);
    stream.writeBuffer(value);
  },
  decode(stream) {
    const sz = size.decode(stream);
    return stream.readBuffer(sz);
  },
  test(value) {
    return value instanceof Uint8Array;
  },
  echo,
};

export const byte: Bicoder<number> = {
  encode(stream, value) {
    stream.writeByte(value);
  },
  decode(stream) {
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
  echo,
};

export const number: Bicoder<number> = {
  encode(stream, value) {
    const buf = new ArrayBuffer(8);
    new DataView(buf).setFloat64(0, value);
    stream.writeBuffer(new Uint8Array(buf));
  },
  decode(stream) {
    return new DataView(stream.readBuffer(8).slice().buffer).getFloat64(0);
  },
  test(value) {
    return typeof value === "number";
  },
  echo,
};

export const string: Bicoder<string> = {
  encode(stream, value) {
    buffer.encode(stream, new TextEncoder().encode(value));
  },
  decode(stream) {
    return new TextDecoder().decode(buffer.decode(stream));
  },
  test(value) {
    return typeof value === "string";
  },
  echo,
};

export const boolean: Bicoder<boolean> = {
  encode(stream, value) {
    stream.writeByte(value ? 1 : 0);
  },
  decode(stream) {
    return stream.readByte() !== 1; // TODO: Be strict
  },
  test(value) {
    return typeof value === "boolean";
  },
  echo,
};

export const null_: Bicoder<null> = {
  encode(_stream, _value) {},
  decode(_stream) {
    return null;
  },
  test(value) {
    return value === null;
  },
  echo,
};

export const undefined_: Bicoder<undefined> = {
  encode(_stream, _value) {},
  decode(_stream) {
    return undefined;
  },
  test(value) {
    return value === undefined;
  },
  echo,
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
    test(value) {
      return Array.isArray(value) && value.every((v) => element.test(v));
    },
    echo,
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
    echo,
  };
}

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
    test(value) {
      return (
        typeof value === "object" &&
        value !== null &&
        Object.values(value).every((v) => v === undefined || element.test(v))
      );
    },
    echo,
  };
}

export function tuple<T extends AnyBicoder[]>(
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
    test(value) {
      return (
        Array.isArray(value) &&
        value.length === elements.length &&
        elements.every((element, i) => element.test(value[i]))
      );
    },
    echo,
  };
}

export function union<T extends AnyBicoder[]>(
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
    test(value) {
      for (let i = 0; i < options.length; i++) {
        if (options[i].test(value)) {
          return true;
        }
      }

      return false;
    },
    echo,
  };
}

export function defer<T>(fn: () => Bicoder<T>): Bicoder<T> {
  return {
    encode: (stream, value) => fn().encode(stream, value),
    decode: (stream) => fn().decode(stream),
    test: (value) => fn().test(value),
    echo,
  };
}

export function exact<T extends Primitive>(exactValue: T): Bicoder<T> {
  return {
    encode(_stream, _value) {},
    decode(_stream) {
      return exactValue;
    },
    test(value) {
      return value === exactValue;
    },
    echo,
  };
}

export function enum_<T extends Primitive[]>(
  ...args: T
): Bicoder<UnionOf<T>> {
  return union(...args.map(exact)) as unknown as Bicoder<UnionOf<T>>;
}

export const bigint: Bicoder<bigint> = {
  encode(stream, value) {
    if (value === 0n) {
      stream.writeByte(0);
      return;
    }

    const positive = value >= 0n;
    const absValue = positive ? value : -value;

    const hex = absValue.toString(16);
    const sz = Math.floor((hex.length + 1) / 2);
    size.encode(stream, (positive ? 0 : 1) + 2 * sz);

    let pos = 0;

    if (hex.length % 2 === 1) {
      stream.writeByte(parseInt(hex[0], 16));
      pos++;
    }

    for (; pos < hex.length; pos += 2) {
      stream.writeByte(parseInt(hex.slice(pos, pos + 2), 16));
    }
  },
  decode(stream) {
    let sz = size.decode(stream);

    if (sz === 0) {
      return 0n;
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
  echo,
};

export function optional<T>(element: Bicoder<T>): Bicoder<T | null> {
  return union(null_, element);
}
