import { Type, match, TypeClass } from './index';

class Foo extends TypeClass('Foo') {
    foo: string
    constructor ({ foo }: { foo: string }) {
        super();
        this.foo = foo;
    }
}
const inst = new Foo({ foo: 'hello' });

type Bar = Type<'Bar', {
    bar: number
}>;

function test2 (x?: Foo | Bar | boolean) {
    // 自动推断 result 类型
    // const result: string | number | undefined
    const result = match(x)({
        // 此处会提示补全所有匹配
        Foo: foo => foo.foo,
        Bar: bar => bar.bar,
        boolean: b => !b,
        empty: (nullOrUndefined) => undefined,
    });

    return result;
}

test2(inst); // hello
