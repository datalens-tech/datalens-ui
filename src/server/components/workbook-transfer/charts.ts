import type {Request} from '@gravity-ui/expresskit';
import forIn from 'lodash/forIn';
import isArray from 'lodash/isArray';

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
import type {ChartTemplates} from '../charts-engine/components/chart-generator';
import type {ChartDataOptions} from '../charts-engine/controllers/charts';
import {prepareChartData} from '../charts-engine/controllers/charts';

import {
    criticalTransferNotification,
    warningTransferNotification,
} from './create-transfer-notifications';

type MappingWarnings = {missedMapping: boolean};

type MatchCallback = (value: string, obj: Record<string, any>, key: string | number) => string;

type TransferChartDataOptions = {
    data: ReturnType<typeof prepareChartData>['chart'] & ChartDataOptions['data'];
    template: keyof ChartTemplates;
    type: string;
    key?: string;
    name: string;
};

const validateChart = (chartOptions: TransferChartDataOptions) => {
    const requiredChartOptionsKeys: Array<keyof TransferChartDataOptions> = [
        'data',
        'name',
        'template',
        'type',
    ];

    requiredChartOptionsKeys.forEach((key) => {
        if (!(key in chartOptions)) {
            throw new Error('Invalid chart options');
        }
    });
};

const traverseWizardFieldsRecursive = (obj: any, matchCallback: MatchCallback) => {
    forIn(obj, (val, key) => {
        if (typeof val === 'object') {
            traverseWizardFieldsRecursive(val, matchCallback);
            // Array<{datasetId: string}>
        } else if (key === 'datasetId' && typeof val === 'string') {
            obj[key] = matchCallback(val, obj, key);
            // dataset.id
        } else if (key === 'dataset' && typeof val.id === 'string') {
            val.id = matchCallback(val.id, val, 'id');
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
    const {type} = chartOptions.data;
    const defaults = {
        key: chartOptions.key,
        name: chartOptions.name,
        data: null,
        type: '',
        links: {},
        scope: EntryScope.Widget,
        mode: EntryUpdateMode.Publish,
    };
    const notifications: TransferNotification[] = [];
    let warnings: MappingWarnings | null = null;

    try {
        validateChart(chartOptions);
    } catch (err) {
        return {
            widget: null,
            notifications: [
                criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData),
            ],
        };
    }

    switch (type) {
        case 'datalens':
            warnings = traverseWizardFields(chartOptions.data, idMapping);
            break;
        case 'ql':
            warnings = traverseQlFields(chartOptions.data, idMapping);
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
        notifications.push(warningTransferNotification(TransferErrorCode.TransferMissingMappingId));
    }

    try {
        const preparedChartData = prepareChartData(chartOptions, req);

        if (preparedChartData.error) {
            return {
                widget: null,
                notifications: [
                    criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData),
                ],
            };
        }

        return {
            widget: {
                ...defaults,
                type: preparedChartData.type || '',
                links: preparedChartData.links || {},
                data: preparedChartData.chart,
                template: preparedChartData.template,
            },
            notifications,
        };
    } catch (err) {
        return {
            widget: null,
            notifications: [
                criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData),
            ],
        };
    }
};

export const prepareExportChartData = async (entry: EntryFields, idMapping: TransferIdMapping) => {
    let data;

    const {key, type} = entry;
    const nameParts = key.split('/');
    const name = nameParts[nameParts.length - 1];

    const widget = {
        data,
        name,
        type,
    };

    const notifications: TransferNotification[] = [];
    let warnings: MappingWarnings | null = null;

    try {
        data = JSON.parse((entry.data?.shared || '') as string);

        switch (data.type as keyof ChartTemplates) {
            case 'datalens':
                warnings = traverseWizardFields(data, idMapping);
                break;
            case 'ql':
                warnings = traverseQlFields(data, idMapping);
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
                criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData),
            ],
        };
    }

    if (warnings && warnings.missedMapping) {
        notifications.push(warningTransferNotification(TransferErrorCode.TransferMissingMappingId));
    }

    return {
        widget: {
            ...widget,
            data,
            template: data.type,
        },
        notifications,
    };
};
