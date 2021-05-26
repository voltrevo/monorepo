type BufferWriter = {
  write(buffer: Uint8Array): Promise<void>;
};

export default BufferWriter;
