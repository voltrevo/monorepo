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

type Bicoder<T> = Encoder<T> & Decoder<T>;

// deno-lint-ignore no-namespace
namespace bicoders {
  const size: Bicoder<number> = {
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

      while (true) {
        const byte = stream.data.getUint8(stream.offset);
        stream.offset++;

        const more = byte >= 128;

        if (!more) {
          return value + byte;
        }

        value += byte - 128;
        value *= 128;
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
}
