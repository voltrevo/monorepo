import type BufferReader from "./BufferReader.ts";
import type BufferWriter from "./BufferWriter.ts";

type BufferIO = BufferReader & BufferWriter;

export default BufferIO;
