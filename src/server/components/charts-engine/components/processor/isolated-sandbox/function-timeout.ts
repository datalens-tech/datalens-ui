import vm from 'node:vm';

import {isObject} from 'lodash';

const script = new vm.Script('returnValue = functionToRun()');

type Options = {
    timeout?: number;
};

export default function functionTimeout<T extends Function>(
    function_: T,
    {timeout}: Options = {},
): T {
    const wrappedFunction = (...args: [unknown]) => {
        const context = vm.createContext();
        context.functionToRun = () => function_(...args);
        script.runInNewContext(context, {timeout});
        return context.returnValue;
    };

    Object.defineProperty(wrappedFunction, 'name', {
        value: `functionTimeout(${function_.name || '<anonymous>'})`,
        configurable: true,
    });

    return wrappedFunction;
}

export function isTimeoutError(error: unknown) {
    return isObject(error) && 'code' in error && error?.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT';
}
