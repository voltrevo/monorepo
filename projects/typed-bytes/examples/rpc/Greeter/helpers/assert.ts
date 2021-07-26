export default function assert(
  value: boolean,
  message = "Assertion failed",
): asserts value {
  if (!value) {
    throw new Error(message);
  }
}
