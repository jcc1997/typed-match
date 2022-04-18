# typescript 模式匹配

模仿其他语言的模式匹配而在 typescript 上的不完整实现

## 使用

```typescript
import { match, Type } from '@cj97/match';

type Foo = Type<'Foo', {
    foo: string
}>;

type Bar = Type<'Bar', {
    bar: number
}>;

function test (x: Foo | Bar | undefined | boolean) {
    // const result: string | number | boolean | undefined
    // 自动推断 result 类型
    const result = match(x)({
        // 此处会提示补全所有匹配
        Foo: foo => foo.foo,
        Bar: bar => bar.bar,
        empty: () => undefined,
        boolean: v => !v
    });
    return result;
}
test({ __type: 'Foo', foo: 'hello' }); // hello
```

也可以使用下面这种方式使用类的声明

```typescript
class Foo extends TypeClass('Foo') {
    foo: string
    constructor ({ foo }: { foo: string }) {
        super();
        this.foo = foo;
    }
}
```

## 注意

**必须在 `tsconfig` 设置 `"strictNullChecks": true` 否则无法进行正确的类型推断**。

`match` 参数不允许类型为 `null` 。考虑到 `undefined` 与 `null` 在开发期间对应的处理函数是一致的，而实现方式导致入参联合类型及匹配必须一一对应，同时 `typeof undefined === 'undefined'` 而 `typeof null === 'object'`，为了实现的简洁，所以选择只允许 `undefined`。
