type Encoder<T> = {
  encode(value: T): ArrayBuffer;
};

type Decoder<T> = {
  decode(buffer: ArrayBuffer): T;
};

type Bicoder<T> = Encoder<T> & Decoder<T>;

// deno-lint-ignore no-namespace
namespace bicoders {
  export const number: Bicoder<number> = {
    encode(value) {
      const buf = new ArrayBuffer(8);
      new Float64Array(buf)[0] = value;
      return buf;
    },
    decode(buf) {
      return new Float64Array(buf)[0];
    },
  };

  export const string: Bicoder<string> = {
    encode(value) {
      return new TextEncoder().encode(value).buffer;
    },
    decode(buf) {
      return new TextDecoder().decode(buf);
    },
  };

  export const boolean: Bicoder<boolean> = {
    encode(value) {
      const buf = new ArrayBuffer(1);
      new Uint8Array(buf)[0] = value ? 1 : 0;
      return buf;
    },
    decode(buf) {
      return new Uint8Array(buf)[0] === 1;
    },
  };

  export const null_: Bicoder<null> = {
    encode(_value) {
      return new ArrayBuffer(0);
    },
    decode(_buf) {
      return null;
    },
  };
}
