import {DEFAULT_FORMATTING} from '../../../../constants';
import type {
    Field,
    V3ChartsConfig,
    V3Label,
    V4ChartsConfig,
    V4Formatting,
    V4Label,
    V4Visualization,
} from '../../../../types';
import {ChartsConfigVersion, DATASET_FIELD_TYPES, DatasetFieldType} from '../../../../types';
import {getDefaultFormatting} from '../../../wizard-helpers';

const createV4LabelFromV3 = (v3Label: V3Label): V4Label => {
    return (Object.keys(v3Label) as Array<keyof V3Label>).reduce((v4Label, key) => {
        switch (key) {
            case 'labelMode':
                return {
                    ...v4Label,
                    formatting: {
                        ...v4Label.formatting,
                        labelMode: v3Label.labelMode || DEFAULT_FORMATTING.labelMode,
                    },
                };
            case 'formatting':
                return {
                    ...v4Label,
                    formatting: {
                        ...v4Label.formatting,
                        ...(v3Label?.formatting || {}),
                    } as V4Formatting,
                };
            default:
                return {...v4Label, [key]: v3Label[key]};
        }
    }, {} as V4Label);
};

export const mapV3LabelsToV4Labels = (v3Label: V3Label): V4Label => {
    if (v3Label.type === DatasetFieldType.Pseudo) {
        return {
            ...v3Label,
            formatting: undefined,
        };
    }
    const v4Label = createV4LabelFromV3(v3Label);

    const formatting: V4Formatting = {
        ...getDefaultFormatting(v4Label as Field),
        ...(v4Label.formatting || {}),
    };

    return {
        ...v4Label,
        formatting,
    };
};

export const mapV3ConfigToV4 = (config: V3ChartsConfig): V4ChartsConfig => {
    const v4Labels: V4Label[] = (config.labels || []).map(mapV3LabelsToV4Labels);

    const v4Visualization: V4Visualization = {
        ...config.visualization,
        layers: config.visualization.layers?.map((layer) => {
            const commonPlaceholders = layer.commonPlaceholders;
            const v3Labels = commonPlaceholders.labels;
            const v4LayerLabels = v3Labels.map(mapV3LabelsToV4Labels);

            return {
                ...layer,
                commonPlaceholders: {
                    ...commonPlaceholders,
                    labels: v4LayerLabels,
                },
            };
        }),
    } as V4Visualization;

    return {
        ...config,
        visualization: v4Visualization,
        labels: v4Labels,
        version: ChartsConfigVersion.V4,
    } as V4ChartsConfig;
};

const mutateFieldDatetime = (field: any): void => {
    if (field.data_type === 'datetime') {
        field.data_type = DATASET_FIELD_TYPES.GENERICDATETIME;
    }

    if (field.cast === 'datetime') {
        field.cast = DATASET_FIELD_TYPES.GENERICDATETIME;
    }
};

export const migrateDatetime = (config: V4ChartsConfig): void => {
    config.visualization.placeholders?.forEach((placeholder) => {
        placeholder.items?.forEach(mutateFieldDatetime);
    });

    config.visualization.layers?.forEach((layer) => {
        layer.placeholders?.forEach((placeholder) => {
            placeholder.items?.forEach(mutateFieldDatetime);
        });

        layer.commonPlaceholders.colors?.forEach(mutateFieldDatetime);
        layer.commonPlaceholders.filters?.forEach(mutateFieldDatetime);
        layer.commonPlaceholders.labels?.forEach(mutateFieldDatetime);
        layer.commonPlaceholders.sort?.forEach(mutateFieldDatetime);
        layer.commonPlaceholders.tooltips?.forEach(mutateFieldDatetime);
    });

    config.colors?.forEach(mutateFieldDatetime);
    config.labels?.forEach(mutateFieldDatetime);
    config.filters?.forEach(mutateFieldDatetime);
    config.shapes?.forEach(mutateFieldDatetime);
    config.sort?.forEach(mutateFieldDatetime);
    config.segments?.forEach(mutateFieldDatetime);

    config.updates?.forEach((update) => {
        if (update.field) {
            mutateFieldDatetime(update.field);
        }
    });
};
