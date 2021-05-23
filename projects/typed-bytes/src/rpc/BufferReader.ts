type BufferReader = {
  read(): Promise<ArrayBuffer | null>;
};

export default BufferReader;
