import type {
    InterruptHandler,
    QuickJSContext,
    QuickJSHandle,
    QuickJSRuntime,
    QuickJSWASMModule,
    VmCallResult,
} from 'quickjs-emscripten';

type UiSandboxRuntimeProps = {
    fn: string;
    fnArgs: unknown[];
    fnContext: unknown;
    globalApi: object;
    libs: string;
};

export class UiSandboxRuntime {
    private runtime: QuickJSRuntime;
    private vm: QuickJSContext;
    private pending: QuickJSHandle[];

    constructor(props: {sandbox: QuickJSWASMModule; interruptHandler: InterruptHandler}) {
        const {sandbox, interruptHandler} = props;

        this.runtime = sandbox.newRuntime();
        this.runtime.setInterruptHandler(interruptHandler);
        this.vm = this.runtime.newContext();

        this.pending = [];
    }

    callFunction(props: UiSandboxRuntimeProps) {
        const {fn, fnContext, fnArgs, globalApi, libs} = props;

        this.defineVmArguments(fnArgs);
        this.defineVmContext(fnContext);
        this.defineVmApi(globalApi);
        const result = this.vm.evalCode(
            `
            ${libs}
            (${fn}).call(JSON.parse(context), ...(args.length
                ? JSON.parse(args).map((arg) => {
                    if(typeof arg === "string" && arg.startsWith('function')) {
                        let fn;
                        eval('fn = ' + arg);
                        return fn;
                    }
                    return arg;
                })
                : []))`,
        );

        if (result.error) {
            const errorMsg = this.vm.dump(result.error);
            result.error.dispose();
            throw errorMsg;
        }

        const value = this.vm.dump(result.value);

        result.value.dispose();
        this.dispose();

        return value;
    }

    private defineVmContext(context: unknown) {
        let stringifiedContext = '';
        try {
            stringifiedContext = JSON.stringify(context);
        } catch (e) {
            console.error(e, {context});
        }

        const vmFunctionContext = this.vm.newString(stringifiedContext);
        this.vm.setProp(this.vm.global, 'context', vmFunctionContext);
        vmFunctionContext.dispose();
    }

    private defineVmArguments(args: unknown[]) {
        let stringifiedArgs = '[]';
        try {
            stringifiedArgs = JSON.stringify(args);
        } catch (e) {
            console.error(e, {args});
        }

        const vmArgs = this.vm.newString(stringifiedArgs);
        this.vm.setProp(this.vm.global, 'args', vmArgs);

        vmArgs.dispose();
    }

    private defineVmApi(api: object) {
        if (!api) {
            return;
        }

        const items: QuickJSHandle[] = [];

        let timeoutId: number;
        const setItem = (item: object, parent: QuickJSHandle) => {
            Object.entries(item).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    const objHandle = this.vm.newObject();
                    this.vm.setProp(parent, String(key), objHandle);
                    items.push(objHandle);

                    setItem(value, objHandle);
                } else if (typeof value === 'function') {
                    const fnHandle = this.vm.newFunction(key, (...fnArgs) => {
                        let callEnded = false;
                        const nativeArgs = fnArgs.map((fnArg) => {
                            const result = this.vm.dump(fnArg);

                            if (isFunction(result)) {
                                const longLivedCallbackHandle = fnArg.dup();
                                this.pending.push(longLivedCallbackHandle);

                                return (...args: unknown[]) => {
                                    const fnContext = this.vm.newObject();
                                    const mappedArgs = args.map((a) => this.toHandle(a));
                                    const fnResult = this.vm.callFunction(
                                        longLivedCallbackHandle,
                                        fnContext,
                                        ...mappedArgs,
                                    );
                                    const fnResult2 = this.getFunctionResult(fnResult);
                                    fnContext.dispose();
                                    mappedArgs.forEach((arg) => arg.dispose());

                                    clearTimeout(timeoutId);
                                    timeoutId = window.setTimeout(() => {
                                        if (callEnded) {
                                            if (longLivedCallbackHandle.alive) {
                                                longLivedCallbackHandle.dispose();
                                            }
                                            this.dispose();
                                        }
                                    }, 0);

                                    return fnResult2;
                                };
                            }

                            return result;
                        });
                        const result = value(...nativeArgs);
                        callEnded = true;
                        return this.toHandle(result);
                    });
                    this.vm.setProp(parent, key, fnHandle);
                    items.push(fnHandle);
                }
            });
        };

        setItem(api, this.vm.global);

        items.forEach((item) => item.dispose());
    }

    private getFunctionResult(result: VmCallResult<QuickJSHandle>) {
        if (result.error) {
            const errorMsg = this.vm.dump(result.error);
            result.error.dispose();
            throw errorMsg;
        }

        const value = this.vm.dump(result.value);
        result.value.dispose();

        return value;
    }

    private toHandle(value: unknown): QuickJSHandle {
        if (typeof value === 'number') {
            return this.vm.newNumber(value);
        }

        if (typeof value === 'object') {
            const result = this.vm.evalCode('(' + JSON.stringify(value) + ')');
            return result.error ?? result.value;
        }

        return this.vm.newString(String(value));
    }

    private dispose() {
        if (!this.pending.some((handle) => handle.alive)) {
            this.vm.dispose();
            this.runtime.dispose();
        }
    }
}

function isFunction(value: unknown) {
    return typeof value === 'string' && (value.startsWith('function') || isArrowFunction(value));
}

function isArrowFunction(value: string) {
    const val = value.replace(' ', '');
    return val.startsWith('(') && val.includes(')=>');
}
