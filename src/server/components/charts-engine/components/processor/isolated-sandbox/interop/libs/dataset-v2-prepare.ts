import type datasetModule from '../../../../../../../modes/charts/plugins/dataset/v2';

import type {
    LibsDatasetV2BuildSource,
    LibsDatasetV2Operations,
    LibsDatasetV2Orders,
    LibsDatasetV2ProcessData,
    LibsDatasetV2ProcessTableData,
} from './dataset-v2';

declare const __libsDatasetV2_buildSource: LibsDatasetV2BuildSource;
declare const __libsDatasetV2_processTableData: LibsDatasetV2ProcessTableData;
declare const __libsDatasetV2_processData: LibsDatasetV2ProcessData;
declare const __libsDatasetV2_OPERATIONS: LibsDatasetV2Operations;
declare const __libsDatasetV2_ORDERS: LibsDatasetV2Orders;

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const datasetV2prepareAdapter: typeof datasetModule = {
    buildSource: (arg) => JSON.parse(__libsDatasetV2_buildSource(JSON.stringify(arg))),
    processTableData: (...args) =>
        JSON.parse(__libsDatasetV2_processTableData(JSON.stringify(args))),
    processData: (...args) => JSON.parse(__libsDatasetV2_processData(JSON.stringify(args))),
    OPERATIONS: JSON.parse(__libsDatasetV2_OPERATIONS),
    ORDERS: JSON.parse(__libsDatasetV2_ORDERS),
};
