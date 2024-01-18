export const makeFunctionTemplate = <T>(options?: {isReduxThunkActionTemplate?: boolean}): T => {
    return (options?.isReduxThunkActionTemplate ? () => () => {} : () => {}) as T;
};
