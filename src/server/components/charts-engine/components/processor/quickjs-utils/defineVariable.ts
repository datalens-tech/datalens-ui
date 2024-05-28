import {QuickJSContext, QuickJSHandle} from 'quickjs-emscripten';

export function defineVariable(value: unknown, context: QuickJSContext): QuickJSHandle {
    if (typeof value === 'string') {
        return context.newString(value);
    }
    if (typeof value === 'number') {
        return context.newNumber(value);
    }
    if (typeof value === 'boolean') {
        return value ? context.true : context.false;
    }
    if (value === undefined) {
        return context.undefined;
    }
    if (value === null) {
        return context.null;
    }
    if (Array.isArray(value)) {
        const arrayHandle = context.newArray();
        value.forEach((v, i) => {
            defineVariable(v, context).consume((handle) => context.setProp(arrayHandle, i, handle));
        });
        return arrayHandle;
    }
    if (typeof value === 'object') {
        const obj = context.newObject();
        Object.entries(value).forEach(([key, v]) => {
            defineVariable(v, context).consume((handle) => context.setProp(obj, key, handle));
        });
        return obj;
    }
    return context.undefined;
}
