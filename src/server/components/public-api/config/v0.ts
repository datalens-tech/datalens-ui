import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';

import {
    deleteConnectionArgsSchema,
    deleteConnectionResultSchema,
} from '../../../../shared/schema/bi/schemas/connections';
import {
    createDatasetArgsSchema,
    createDatasetResultSchema,
    deleteDatasetArgsSchema,
    deleteDatasetResultSchema,
    getDatasetByVersionArgsSchema,
    getDatasetByVersionResultSchema,
    updateDatasetArgsSchema,
    updateDatasetResultSchema,
} from '../../../../shared/schema/bi/schemas/datasets';
import {
    createDashArgsSchema,
    createDashResultSchema,
    deleteDashArgsSchema,
    deleteDashResultSchema,
    getDashArgsSchema,
    getDashResultSchema,
    updateDashArgsSchema,
    updateDashResultSchema,
} from '../../../../shared/schema/mix/schemas/dash';
import {
    deleteEditorChartArgsSchema,
    deleteEditorChartResultSchema,
} from '../../../../shared/schema/mix/schemas/editor';
import {
    deleteWizardChartArgsSchema,
    deleteWizardChartResultSchema,
} from '../../../../shared/schema/mix/schemas/wizard';
import {ApiTag} from '../constants';
import type {PublicApiVersionConfig} from '../types';
import {makeAction} from '../utils/make-action';

export const PUBLIC_API_V0_CONFIG = {
    openApi: {
        registry: new OpenAPIRegistry(),
    },

    actions: {
        // Connection
        deleteConnection: makeAction({
            schemas: {
                args: deleteConnectionArgsSchema,
                result: deleteConnectionResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.bi.deleteConnection(args);

                return responseData;
            },
            openApi: {
                summary: 'Delete connection',
                tags: [ApiTag.Connection],
            },
        }),

        // Dataset
        getDataset: makeAction({
            schemas: {
                args: getDatasetByVersionArgsSchema,
                result: getDatasetByVersionResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.bi.getDatasetByVersion(args);

                return responseData;
            },
            openApi: {
                summary: 'Get dataset',
                tags: [ApiTag.Dataset],
            },
        }),
        updateDataset: makeAction({
            schemas: {
                args: updateDatasetArgsSchema,
                result: updateDatasetResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.bi.updateDataset(args);

                return responseData;
            },
            openApi: {
                summary: 'Update dataset',
                tags: [ApiTag.Dataset],
            },
        }),
        createDataset: makeAction({
            schemas: {
                args: createDatasetArgsSchema,
                result: createDatasetResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.bi.createDataset(args);

                return responseData;
            },
            openApi: {
                summary: 'Create dataset',
                tags: [ApiTag.Dataset],
            },
        }),
        deleteDataset: makeAction({
            schemas: {
                args: deleteDatasetArgsSchema,
                result: deleteDatasetResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.bi.deleteDataset(args);

                return responseData;
            },
            openApi: {
                summary: 'Delete dataset',
                tags: [ApiTag.Dataset],
            },
        }),

        // Wizard
        deleteWizardChart: makeAction({
            schemas: {
                args: deleteWizardChartArgsSchema,
                result: deleteWizardChartResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.mix.__deleteWizardChart__(args);

                return responseData;
            },
            openApi: {
                summary: 'Delete wizard chart',
                tags: [ApiTag.Wizard],
            },
        }),

        // Editor
        deleteEditorChart: makeAction({
            schemas: {
                args: deleteEditorChartArgsSchema,
                result: deleteEditorChartResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.mix.__deleteEditorChart__(args);

                return responseData;
            },
            openApi: {
                summary: 'Delete editor chart',
                tags: [ApiTag.Editor],
            },
        }),

        // Dashboard
        getDashboard: makeAction({
            schemas: {
                args: getDashArgsSchema,
                result: getDashResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.mix.__getDashboard__(args);

                return responseData;
            },
            openApi: {
                summary: 'Get dashboard',
                tags: [ApiTag.Dashboard],
            },
        }),
        updateDashboard: makeAction({
            schemas: {
                args: updateDashArgsSchema,
                result: updateDashResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.mix.__updateDashboard__(args);

                return responseData;
            },
            openApi: {
                summary: 'Update dashboard',
                tags: [ApiTag.Dashboard],
            },
        }),
        createDashboard: makeAction({
            schemas: {
                args: createDashArgsSchema,
                result: createDashResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.mix.__createDashboard__(args);

                return responseData;
            },
            openApi: {
                summary: 'Create dashboard',
                tags: [ApiTag.Dashboard],
            },
        }),
        deleteDashboard: makeAction({
            schemas: {
                args: deleteDashArgsSchema,
                result: deleteDashResultSchema,
            },
            resolve: (api) => async (args) => {
                const {responseData} = await api.mix.__deleteDashboard__(args);

                return responseData;
            },
            openApi: {
                summary: 'Delete dashboard',
                tags: [ApiTag.Dashboard],
            },
        }),
    },
} satisfies PublicApiVersionConfig;
