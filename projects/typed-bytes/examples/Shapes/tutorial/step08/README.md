## Step 8: Meta Shapes

Look, I drew a house:

![Drawing 1](./drawing_1.png)

[Code](./step08_1.ts)

(If you're an artist, I'm really very sorry. Please see
[CONTRIBUTING.md](../../../../CONTRIBUTING.md) 😄.)

Isn't it great? We should make lots of houses just like this.

It only takes up 314 bytes, but do we really want to pay 314 bytes for each
house? Nah. Besides, grouping things together will have other benefits.

We like shapes, so let's put shapes in our shapes:

```ts
const MetaShape = tb.object({
  type: tb.exact("meta"),
  shapes: tb.array(Shape),
});
```

And add this to our `Shape` definition...

```diff
-const Shape = tb.union(Circle, Triangle, Square);
+const Shape = tb.union(Circle, Triangle, Square, MetaShape);
```

... uh oh, `MetaShape` needed to be defined after `Shape` but now `Shape` needs
to refer to `MetaShape`.

Introducing `tb.defer`. This utility allows you to create *recursive* bicoders:

```ts
// It's ok to have this before defining Shape
const ShapeReference = tb.defer(() => Shape);
```

Now we can just use `ShapeReference` as we would `Shape`:

```diff
 const MetaShape = tb.object({
   type: tb.exact("meta"),
-  shapes: tb.array(Shape),
+  shapes: tb.array(ShapeReference),
 });
```

and then we define `Shape` last as before:

```ts
const Shape = tb.union(Circle, Triangle, Square, MetaShape);
```

One more problem though. When you use `tb.defer`, you need to specify the type
explicitly, otherwise you'll get a type error like this:

```
'ShapeReference' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
```

It's kinda fair enough. In principle it may be possible for TypeScript to infer
the recursive type, but I imagine that could lead to some very confusing edge
cases (for users of TypeScript I mean, though I assume it would be tricky for
the TypeScript team to implement too).

Anyway, we'll need some duplication between our structure definitions and some
explicit typing. Only in this recursive interaction between `MetaShape` and
`Shape` though, we can still use the inferred types for `Circle`, `Square`, and
`Triangle`:

```ts
type MetaShape = {
  type: "meta";
  shapes: Shape[];
};

type Shape =
  | Circle
  | Triangle
  | Square
  | MetaShape;
```

```diff
-const ShapeReference = tb.defer(() => Shape);
+const ShapeReference: tb.Bicoder<Shape> = tb.defer(() => Shape);
```
