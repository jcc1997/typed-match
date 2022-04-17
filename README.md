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
        undefined: () => undefined,
        boolean: v => !v
    });
    return result;
}
test({ __type: 'Foo', foo: 'hello' }); // hello
```

也可以使用下面这种方式使用类的声明

```typescript
class Foo extends TypeClass<'Foo'> {
    __type: 'Foo' = 'Foo'
    foo: string
    constructor ({ foo }: { foo: string }) {
        super();
        this.foo = foo;
    }
}
```

对于值匹配，需要使用另外的函数

```typescript
const tests = Symbol('test');
function test (x: 123 | typeof tests | undefined) {
    const result = matchValue(x)({
        [tests]: (v) => 'symbol',
        123: (v) => '123',
        DEFAULT: (v) => { throw new Error('unexpected value'); }
    });
}
```

需要明确参数可能的取值，以下形式会引起错误

```typescript
const tests = Symbol('test');
function test (x: number | string | typeof tests | undefined) {
    const result = matchValue(x)({
        [tests]: (v) => 'symbol',
        123: (v) => '123',
        DEFAULT: (v) => 'other'
    });
}
```

但是目前支持

```typescript
const tests = Symbol('test');
function test (x: number | typeof tests | undefined) {
    const result = matchValue(x)({
        [tests]: (v) => 'symbol',
        123: (v) => '123',
        DEFAULT: (v) => 'other'
    });
}
// or
function test (x: string | typeof tests | undefined) {
    const result = matchValue(x)({
        [tests]: (v) => 'symbol',
        123: (v) => '123',
        DEFAULT: (v) => 'other'
    });
}
```

## 注意

**必须在 `tsconfig` 设置 `"strictNullChecks": true` 否则无法进行正确的类型推断**。

`match` 参数不允许类型为 `null` 。考虑到 `undefined` 与 `null` 在开发期间对应的处理函数是一致的，而实现方式导致入参联合类型及匹配必须一一对应，同时 `typeof undefined === 'undefined'` 而 `typeof null === 'object'`，为了实现的简洁，所以选择只允许 `undefined`。
