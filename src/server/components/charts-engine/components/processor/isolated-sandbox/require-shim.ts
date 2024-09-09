declare const datalensV3prepareAdapter: string;
declare const controlV1prepareAdapter: string;
declare const datasetV2prepareAdapter: string;
declare const qlChartV1prepareAdapter: string;
declare const __modules: Record<string, any>;

export const requireShim = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName === 'libs/datalens/v3') {
        if (__modules['bundledLibraries']) {
            return __modules['bundledLibraries']['dist'].datalensModule;
        } else {
            return datalensV3prepareAdapter;
        }
    } else if (lowerName === 'libs/control/v1') {
        if (__modules['bundledLibraries']) {
            return __modules['bundledLibraries']['dist'].controlModule;
        } else {
            return controlV1prepareAdapter;
        }
    } else if (lowerName === 'libs/qlchart/v1') {
        return qlChartV1prepareAdapter;
    } else if (lowerName === 'libs/dataset/v2') {
        if (__modules['bundledLibraries']) {
            return __modules['bundledLibraries']['dist'].datasetModule;
        } else {
            return datasetV2prepareAdapter;
        }
    } else if (__modules[lowerName]) {
        return __modules[lowerName];
    } else {
        throw new Error(`Module "${lowerName}" is not resolved`);
    }
};
