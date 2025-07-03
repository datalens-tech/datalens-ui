import type {ChartsData} from './charts/types';

export const getChartType = (loadedData: ChartsData) => {
    if (loadedData?.isQL) {
        return 'ql';
    }
    if (loadedData?.isNewWizard || loadedData?.isOldWizard) {
        return 'wizard';
    }
    if (loadedData?.isEditor) {
        return 'editor';
    }

    return 'unknown';
};
