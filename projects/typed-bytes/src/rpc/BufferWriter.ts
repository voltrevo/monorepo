type BufferWriter = {
  write(buffer: ArrayBuffer): Promise<void>;
};

export default BufferWriter;
