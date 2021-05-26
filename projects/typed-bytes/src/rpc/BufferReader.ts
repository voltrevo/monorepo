type BufferReader = {
  read(): Promise<Uint8Array | null>;
};

export default BufferReader;
