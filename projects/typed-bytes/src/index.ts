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

export type Bicoder<T> = Encoder<T> & Decoder<T>;

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
};

export const string: Bicoder<string> = {
  encode(stream, value) {
    buffer.encode(stream, new TextEncoder().encode(value).buffer);
  },
  decode(stream) {
    return new TextDecoder().decode(buffer.decode(stream));
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
};

export const null_: Bicoder<null> = {
  encode(_stream, _value) {},
  decode(_stream) {
    return null;
  },
};

export function Array_<T>(element: Bicoder<T>): Bicoder<T[]> {
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
  };
}

export function Object_<T extends Record<string, unknown>>(
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
  };
}
