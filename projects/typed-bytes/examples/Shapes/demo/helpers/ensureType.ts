export default function ensureType<T>(): <Type extends T>(value: Type) => Type {
  return (value) => value;
}
