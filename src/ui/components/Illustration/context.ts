const CONTEXT_KEY_RE = /^\.\/(light|dark)\/(.+)\.(.+)$/;

function parseContextKey(key: string) {
    const match = key.match(CONTEXT_KEY_RE);

    if (match) {
        const [, theme, name, ext] = match;
        return {theme, name, ext};
    }

    return null;
}

export function importContext(context: __WebpackModuleApi.RequireContext) {
    const store: Record<string, Record<string, any>> = {};

    if (context) {
        context.keys().forEach((key) => {
            const keyData = parseContextKey(key);

            if (!keyData) {
                return;
            }

            const module = context(key);
            store[keyData.theme] = store[keyData.theme] || {};
            store[keyData.theme][keyData.name] = module.default || module;
        });
    }

    return store;
}

export function isContext(context: any): context is __WebpackModuleApi.RequireContext {
    return (
        typeof context === 'function' &&
        typeof context.keys === 'function' &&
        typeof context.resolve === 'function'
    );
}
