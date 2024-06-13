import datasetModule from '../../../../../../../modes/charts/plugins/dataset/v2';

import type {LibsInterop} from './types';

const NAMESPACE = '__libsDatasetV2';

export const libsDatasetV2Interop: LibsInterop = {
    prepareAdapter: `{
        buildSources: (arg) => JSON.parse(${NAMESPACE}_buildSources(JSON.stringify(arg))),
        processTableData: (...args) =>
            JSON.parse(${NAMESPACE}_processTableData(JSON.stringify(args))),
        processData: (...args) => JSON.parse(${NAMESPACE}_processData(JSON.stringify(args))),
        OPERATIONS: JSON.parse(${NAMESPACE}_OPERATIONS),
        ORDERS: JSON.parse(${NAMESPACE}_ORDERS),
    }`,

    setPrivateApi: ({jail, chartEditorApi}) => {
        jail.setSync(`${NAMESPACE}_buildSources`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof datasetModule.buildSource>[0];
            const result = datasetModule.buildSource(parsedArg);
            return JSON.stringify(result);
        });

        jail.setSync(`${NAMESPACE}_processTableData`, (params: string) => {
            const parsedParams = JSON.parse(params) as Parameters<
                typeof datasetModule.processTableData
            >;
            const result = datasetModule.processTableData(...parsedParams);
            return JSON.stringify(result);
        });
        jail.setSync(`${NAMESPACE}_processData`, (params: string) => {
            const parsedParams = JSON.parse(params) as Parameters<typeof datasetModule.processData>;
            const result = datasetModule.processData(
                parsedParams[0],
                parsedParams[1],
                chartEditorApi,
                parsedParams[2],
            );
            return JSON.stringify(result);
        });
        jail.setSync(`${NAMESPACE}_OPERATIONS`, JSON.stringify(datasetModule.OPERATIONS));
        jail.setSync(`${NAMESPACE}_ORDERS`, JSON.stringify(datasetModule.ORDERS));

        return jail;
    },
};
