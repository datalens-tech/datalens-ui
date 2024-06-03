import {createContext} from 'react';

import type {SDK} from 'ui';

export interface DatasetPageContext {
    sdk: SDK;
    datasetId: string;
}

export const createDatasetPageContext = (context: DatasetPageContext) => {
    return createContext<DatasetPageContext>(context);
};
