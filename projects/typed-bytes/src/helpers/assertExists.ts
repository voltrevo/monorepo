export default function assertExists<T>(
  x: T,
  msg = "Failed not-null assertion",
): Exclude<T, null | undefined> {
  if (x === null || x === undefined) {
    throw new Error(msg);
  }

  return x as Exclude<T, null | undefined>;
}
