declare const __modules: Record<string, any>;

export const requireShim = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName === 'libs/datalens/v3') {
        return __modules['bundledLibraries']['dist'].datalensModule;
    } else if (lowerName === 'libs/control/v1') {
        return __modules['bundledLibraries']['dist'].controlModule;
    } else if (lowerName === 'libs/qlchart/v1') {
        return __modules['bundledLibraries']['dist'].qlModule;
    } else if (lowerName === 'libs/dataset/v2') {
        return __modules['bundledLibraries']['dist'].datasetModule;
    } else if (__modules[lowerName]) {
        return __modules[lowerName];
    } else {
        throw new Error(`Module "${lowerName}" is not resolved`);
    }
};
