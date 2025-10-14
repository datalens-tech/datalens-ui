import {type ServerField, type ServerPlaceholder, getFormatOptions} from '../../../../../shared';
import {
    DATASET_ID_KEY_PLACEHOLDER,
    DATASET_ID_KEY_TEMPLATE,
    DATASET_ID_LAYER_ID_KEY_TEMPLATE,
    DATASET_ID_LAYER_ID_SEPARATOR,
    LAYER_ID_KEY_PLACEHOLDER,
    LAYER_ID_KEY_TEMPLATE,
} from '../constants/misc';

export const getDatasetIdRequestKey = (datasetId: string) => {
    return DATASET_ID_KEY_TEMPLATE.replace(DATASET_ID_KEY_TEMPLATE, datasetId);
};

export const getLayerIdRequestKey = (layerId: string) => {
    return LAYER_ID_KEY_TEMPLATE.replace(LAYER_ID_KEY_TEMPLATE, layerId);
};

export const getDatasetIdAndLayerIdFromKey = (key: string): [string, string] => {
    const [datasetIdArgument, layerIdArgument = ''] = key.split(DATASET_ID_LAYER_ID_SEPARATOR);

    return [datasetIdArgument, layerIdArgument];
};

export const getDatasetIdAndLayerIdRequestKey = (datasetId: string, layerId: string): string => {
    const datasetIdKey = getDatasetIdRequestKey(datasetId);

    const key = DATASET_ID_LAYER_ID_KEY_TEMPLATE.replace(DATASET_ID_KEY_PLACEHOLDER, datasetIdKey);

    if (layerId) {
        const layerIdKey = getLayerIdRequestKey(layerId);
        return key.replace(LAYER_ID_KEY_PLACEHOLDER, layerIdKey);
    }

    return key.replace(LAYER_ID_KEY_PLACEHOLDER, '');
};

export function getFieldList(datasetFields: ServerField[], placeholders: ServerPlaceholder[]) {
    const placeholdersFields = placeholders.map((p) => p.items || []).flat(2);
    return datasetFields.map((field) => {
        const fieldId = field.guid || (field as unknown as {id: string}).id;
        const placeholdersField = placeholdersFields.find(({guid}) => guid === fieldId);

        return {
            title: field.title,
            guid: fieldId,
            dataType: field.data_type,
            formatting: placeholdersField ? getFormatOptions(placeholdersField) : undefined,
        };
    });
}
