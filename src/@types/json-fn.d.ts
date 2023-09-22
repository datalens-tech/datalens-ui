declare module 'json-fn' {
    export function stringify(
        value: any,
        replacer?: (this: any, key: string, value: any) => any,
        space?: string | number,
    ): string;

    export function parse(text: string, reviver?: (this: any, key: string, value: any) => any): any;
}
