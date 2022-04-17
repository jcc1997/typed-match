// 将形如 { a: 1 } & { b: 2 } 的 Intersection Type 转换为 { a: 1, b: 2 }
// change Intersection Type like { a: 1 } & { b: 2 } into Record like { a: 1, b: 2 }
type IntersectionToRecord<T> = { [K in keyof T]: T[K] };

/**
 * 定义一个 Discriminated unions 的 type
 * define a Discriminated unions type with tag
 */
export type Type<T extends string = string, Others extends {} = {}> = IntersectionToRecord<{
    __type: T
} & Others>

// 仿照UnionToIntersection 将形如 Foo | Bar 这样的类型转化为 { Foo: Foo, Bar: Bar }
type TypeUnionToRecordIntersection<U> = (
    U extends Type ? (arg: { [x in U['__type']]: U }) => 0 : never
) extends (arg: infer I) => 0 ? I : never
type TypeUnionToRecord<T> = IntersectionToRecord<TypeUnionToRecordIntersection<T>>

// 基本类型
type BasicType = string | number | bigint | boolean | symbol | undefined | null;
// 将形如 number | boolean 这样的类型转化为 { number: number, boolean: boolean }
type BasicTypeUnionToRecord<T> =
    IntersectionToRecord<
        (string extends T ? { string: string } : {}) &
        (number extends T ? { number: number } : {}) &
        (bigint extends T ? { bigint: bigint } : {}) &
        (boolean extends T ? { boolean: boolean } : {}) &
        (undefined extends T ? { empty: undefined | null } : {}) &
        (null extends T ? { empty: undefined | null } : {}) &
        (symbol extends T ? { symbol: symbol } : {})>;

// 基本类型
type EmptyType = undefined | null;
// 将形如 number | boolean 这样的类型转化为 { number: number, boolean: boolean }
type EmptyTypeUnionToRecord<T> =
    IntersectionToRecord<
        (undefined extends T ? { empty: undefined | null } : {}) &
        (null extends T ? { empty: undefined | null } : {})>;


// match 函数的第二个入参
// 范型参数为 BasicTypeUnionToRecord 或 TypeUnionToRecord
type Choices<T extends { [x in string]: any }> = { [ K in keyof T ]: (cases: T[K]) => any };

/**
 * 判断是否为基础类型
 */
function _isBasicType (x: unknown) {
    return ['boolean', 'number', 'string', 'symbol'].includes(typeof x) || _isEmptyType(x);
}

function _isEmptyType (x: unknown) {
    return x === undefined || x === null;
}

/**
 * matchType(value)({ Foo: foo => foo.foo, Bar: bar => bar.bar })
 * @param value 入参
 * @param choices 模式匹配对象
 * @returns choices 中所有函数的返回值的Union
 */
// export function matchType<T extends Type | EmptyType > (value: T):
// <Cs extends Choices<TypeUnionToRecord<T>> & Choices<EmptyTypeUnionToRecord<T>>>(choices: Cs) => ReturnType<Cs[keyof Cs]> {
//     return (choices) => {
//         if (_isEmptyType(value)) {
//             return (choices as any)['empty'](value);
//         } else if ((value as any).__type) {
//             return (choices as any)[(value as Type).__type](value);
//         }
//         throw new Error('match error: no matcher for input: ' + value);
//     };
// }

/**
 * match(value)({ Foo: foo => foo.foo, Bar: bar => bar.bar })
 * @param value 入参
 * @param choices 模式匹配对象
 * @returns choices 中所有函数的返回值的Union
 */
export function match<T extends Type | BasicType > (value: T):
<Cs extends Choices<TypeUnionToRecord<T>> & Choices<BasicTypeUnionToRecord<T>>>(choices: Cs) => ReturnType<Cs[keyof Cs]> {
    return (choices) => {
        if (_isBasicType(value)) {
            const key = typeof value;
            return (choices as any)[key](value);
        } else if ((value as any).__type) {
            const __value = value as Type;
            return (choices as any)[__value.__type](value);
        }
        throw new Error('unexpected input');
    };
}

/**
 * 通过类的方式声明符合 type Type 约定的类也可以使用本match函数
 * 可以避免手动赋值 __type
 * usage:
class Foo extends TypeClass('Foo') {
    foo: string
    constructor ({ foo }: { foo: string }) {
        super();
        this.foo = foo;
    }
}
const inst = new Foo({ foo: 'foo' });
 */
export function TypeClass<T extends string> (type: T) {
    return class TypeClass implements Type {
        __type = type;
    };
}

// type ValueUnionToRecordIntersection<U> = (
//     U extends string | number | symbol ? (arg: { [x in U]?: U }) => 0 : never
// ) extends (arg: infer I) => 0 ? I : never
// type ValueUnionToRecord<T> = IntersectionToRecord<ValueUnionToRecordIntersection<T> & (undefined extends T ? { DEFAULT: T } : {})>

/**
 * matchValue 函数 支持 number string symbol 基本类型参数
 * @param value 入参
 * @param choices 匹配对象
 * @returns choices 中所有函数的返回值的Union
 * example:
const tests = Symbol('test');
function test (x: 123 | typeof tests | undefined) {
    const result = matchValue(x)({
        [tests]: (v) => 'symbol',
        123: (v) => '123',
        DEFAULT: (v) => { throw new Error('unexpected value'); }
    });
}
 */
// export function matchValue<T extends string | number | symbol | undefined> (value: T):
// <Cs extends Choices<ValueUnionToRecord<T>>>(choices: Cs) => ReturnType<Cs[keyof Cs]> {
//     return (choices) => {
//         if (value === 'DEFAULT') console.error('@cj97/match matchValue: value \'DEFAULT\' will cause unexpected match');
//         if (value in choices) {
//             return (choices as any)[value](value);
//         } else {
//             const DEFAULT = (choices as any).DEFAULT;
//             return DEFAULT && DEFAULT(value);
//         }
//     };
// }
