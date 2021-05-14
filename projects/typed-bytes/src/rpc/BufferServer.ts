import BufferIO from "./BufferIO.ts";

type BufferServer = {
  accept(): Promise<BufferIO>;
};

export default BufferServer;
