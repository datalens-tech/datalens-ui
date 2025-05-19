import type {Request} from '@gravity-ui/expresskit';
import forIn from 'lodash/forIn';
import isArray from 'lodash/isArray';

import {getEntryNameByKey} from '../../../shared';
import {
    TRANSFER_UNKNOWN_ENTRY_ID,
    TransferErrorCode,
} from '../../../shared/constants/workbook-transfer';
import type {EntryFields} from '../../../shared/schema';
import {
    EntryScope,
    EntryUpdateMode,
    type TransferIdMapping,
    type TransferNotification,
} from '../../../shared/types';
import {type ChartTemplates, chartGenerator} from '../charts-engine/components/chart-generator';

import {
    criticalTransferNotification,
    warningTransferNotification,
} from './create-transfer-notifications';

type MappingWarnings = {missedMapping: boolean};

type MatchCallback = (value: string, obj: Record<string, any>, key: string | number) => string;

type TransferChartDataOptions = {
    data: {
        shared: Record<string, any>;
    };
    type: string;
    key?: string;
    name: string;
};

const validateChartShared = (chartOptions: TransferChartDataOptions) => {
    const requiredChartOptionsKeys: Array<keyof TransferChartDataOptions> = [
        'data',
        'name',
        'type',
    ];

    requiredChartOptionsKeys.forEach((key) => {
        if (!(key in chartOptions)) {
            throw new Error('Invalid chart options');
        }
    });

    if (typeof chartOptions.data.shared !== 'object') {
        throw new Error('Invalid chart chared object');
    }
};

const traverseDatasetFields = (obj: any, matchCallback: MatchCallback) => {
    const {result_schema, sources} = obj || {};

    // Legacy dataset properties placeholder replacer
    if (result_schema && Array.isArray(result_schema)) {
        for (let i = 0; i <= result_schema.length; i++) {
            const item = result_schema[i];

            if (item?.datasetId) {
                item.datasetId = matchCallback(item.datasetId, item, 'datasetId');
            }
        }
    }

    // This is v1 field schema but saved and cause we are not migrating wizard charts
    // we need to migrate this fields before export\import
    if (sources && Array.isArray(sources)) {
        for (let i = 0; i <= sources.length; i++) {
            const item = sources[i];

            if (item?.connection_id) {
                item.connection_id = matchCallback(item.connection_id, item, 'connection_id');
            }
        }
    }
};

const traverseWizardFieldsRecursive = (obj: any, matchCallback: MatchCallback) => {
    forIn(obj, (val, key) => {
        if (key === 'datasetId' && typeof val === 'string') {
            // Array<{datasetId: string}>
            obj[key] = matchCallback(val, obj, key);
        } else if (key === 'datasets' && Array.isArray(val)) {
            // datasets: [{id: string}]
            for (let i = 0; i <= val.length; i++) {
                const item = val[i];
                if (item.id) {
                    item.id = matchCallback(item.id, item, 'id');
                }

                traverseDatasetFields(item, matchCallback);
            }
        } else if (key === 'dataset' && typeof val === 'object' && typeof val.id === 'string') {
            // dataset: {id: string}
            val.id = matchCallback(val.id, val, 'id');

            traverseDatasetFields(val, matchCallback);
        } else if (typeof val === 'object') {
            traverseWizardFieldsRecursive(val, matchCallback);
        }
    });
};

const traverseWizardFields = (obj: any, idMapping: TransferIdMapping) => {
    const warnings: MappingWarnings = {missedMapping: false};

    const matchCallback: MatchCallback = (val, obj, key) => {
        const mappedValue = idMapping[val];
        if (mappedValue) {
            obj[key] = mappedValue;
            return mappedValue;
        }

        warnings.missedMapping = true;
        return TRANSFER_UNKNOWN_ENTRY_ID;
    };
    // datasetsIds: string[]
    if ('datasetsIds' in obj && isArray(obj.datasetsIds)) {
        const {datasetsIds} = obj;

        obj.datasetsIds = (datasetsIds as string[]).map((id, index, list) => {
            return matchCallback(id, list, index);
        });
    }

    traverseWizardFieldsRecursive(obj, matchCallback);

    return warnings;
};

const traverseQlFields = (obj: any, idMapping: TransferIdMapping) => {
    const connection = (obj as any).connection;
    const warnings: MappingWarnings = {missedMapping: false};

    const entryId = connection?.entryId;
    if (connection?.entryId) {
        if (idMapping[entryId]) {
            connection.entryId = idMapping[entryId];
        } else {
            warnings.missedMapping = true;
        }
    }

    return warnings;
};

export const prepareImportChartData = async (
    chartOptions: TransferChartDataOptions,
    req: Request,
    idMapping: TransferIdMapping,
) => {
    const {ctx} = req;

    const defaults = {
        key: chartOptions.key,
        name: chartOptions.name,
        data: null,
        links: {},
        scope: EntryScope.Widget,
        mode: EntryUpdateMode.Publish,
    };
    const notifications: TransferNotification[] = [];

    let template;
    let chartTemplate;
    let shared: Record<string, any> = {};
    let warnings: MappingWarnings | null = null;

    try {
        shared = chartOptions.data.shared;

        const chartTemplateObj = chartGenerator.identifyChartTemplate({ctx, shared});

        template = chartTemplateObj.type;
        chartTemplate = chartTemplateObj.chartTemplate;

        validateChartShared(chartOptions);
    } catch (err) {
        return {
            widget: null,
            notifications: [
                criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData, {
                    error: (err as Error).message,
                }),
            ],
        };
    }

    switch (template) {
        case 'datalens':
            warnings = traverseWizardFields(shared, idMapping);
            break;
        case 'ql':
            warnings = traverseQlFields(shared, idMapping);
            break;
        default:
            return {
                widget: null,
                notifications: [
                    criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData),
                ],
            };
    }

    if (warnings && warnings.missedMapping) {
        notifications.push(
            warningTransferNotification(TransferErrorCode.TransferMissingLinkedEndtry),
        );
    }

    try {
        const links = chartGenerator.gatherChartLinks({
            req,
            shared,
            chartTemplate,
        });
        const serializedData = chartGenerator.serializeShared({
            ctx,
            shared,
            links,
        });

        return {
            widget: {
                ...defaults,
                data: serializedData,
                type: chartOptions.type,
                links,
            },
            notifications,
        };
    } catch (err) {
        return {
            widget: null,
            notifications: [
                criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData, {
                    error: (err as Error).message,
                }),
            ],
        };
    }
};

export const prepareExportChartData = async (entry: EntryFields, idMapping: TransferIdMapping) => {
    let data;

    const {key, type} = entry;
    const name = getEntryNameByKey({key});

    const widget = {
        data,
        name,
        type,
    };

    const notifications: TransferNotification[] = [];
    let warnings: MappingWarnings | null = null;
    let shared: Record<string, any> = {};

    try {
        shared = JSON.parse((entry.data?.shared || '') as string);
        const template = (shared?.type || '') as keyof ChartTemplates;

        switch (template) {
            case 'datalens':
                warnings = traverseWizardFields(shared, idMapping);
                break;
            case 'ql':
                warnings = traverseQlFields(shared, idMapping);
                break;
            default:
                return {
                    widget: null,
                    notifications: [
                        criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData),
                    ],
                };
        }
    } catch (err) {
        return {
            widget: null,
            notifications: [
                criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData, {
                    error: (err as Error).message,
                }),
            ],
        };
    }

    if (warnings && warnings.missedMapping) {
        notifications.push(
            warningTransferNotification(TransferErrorCode.TransferMissingLinkedEndtry),
        );
    }

    return {
        widget: {
            ...widget,
            data: {shared},
        },
        notifications,
    };
};
