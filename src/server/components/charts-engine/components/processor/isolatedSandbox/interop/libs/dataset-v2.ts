import fs from 'fs';
import path from 'path';

import datasetModule from '../../../../../../../modes/charts/plugins/dataset/v2';

import type {LibsInterop} from './types';

const NAMESPACE = '__libsDatasetV2';

export type LibsDatasetV2BuildSource = (arg: string) => string;
export type LibsDatasetV2ProcessTableData = (arg: string) => string;
export type LibsDatasetV2ProcessData = (arg: string) => string;
export type LibsDatasetV2Operations = string;
export type LibsDatasetV2Orders = string;

const prepare = fs.readFileSync(path.join(__dirname, 'dataset-v2-prepare.js'), 'utf-8');

export const libsDatasetV2Interop: LibsInterop = {
    prepareAdapter: prepare,

    setPrivateApi: ({jail, chartEditorApi}) => {
        jail.setSync(`${NAMESPACE}_buildSource`, ((arg) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof datasetModule.buildSource>[0];
            const result = datasetModule.buildSource(parsedArg);
            return JSON.stringify(result);
        }) satisfies LibsDatasetV2BuildSource);

        jail.setSync(`${NAMESPACE}_processTableData`, ((params) => {
            const parsedParams = JSON.parse(params) as Parameters<
                typeof datasetModule.processTableData
            >;
            const result = datasetModule.processTableData(...parsedParams);
            return JSON.stringify(result);
        }) satisfies LibsDatasetV2ProcessTableData);

        jail.setSync(`${NAMESPACE}_processData`, ((params) => {
            const parsedParams = JSON.parse(params) as Parameters<typeof datasetModule.processData>;
            const result = datasetModule.processData(
                parsedParams[0],
                parsedParams[1],
                chartEditorApi,
                parsedParams[2],
            );
            return JSON.stringify(result);
        }) satisfies LibsDatasetV2ProcessData);

        jail.setSync(
            `${NAMESPACE}_OPERATIONS`,
            JSON.stringify(datasetModule.OPERATIONS) satisfies LibsDatasetV2Operations,
        );
        jail.setSync(
            `${NAMESPACE}_ORDERS`,
            JSON.stringify(datasetModule.ORDERS) satisfies LibsDatasetV2Orders,
        );

        return jail;
    },
};
