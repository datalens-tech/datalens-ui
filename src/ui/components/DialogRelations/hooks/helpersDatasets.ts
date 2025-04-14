import type {
    DashkitMetaDataItemBase,
    DatasetsData,
    DatasetsFieldsListData,
} from 'ui/components/DashKit/plugins/types';

import type {DashkitMetaDataItemNoRelations, Datasets, DatasetsFlatListData} from '../types';

import {isControl} from './helpersControls';

const mapFieldsListGuid = (list: Array<DatasetsFieldsListData>, result: Record<string, string>) => {
    list.forEach((listItem) => {
        if (!result[listItem.guid]) {
            result[listItem.guid] = listItem.title || '';
        }
    });
};

const getDatasetItemFlatFields = (data: DatasetsData): Record<string, string> => {
    if (!data) {
        return {};
    }
    let result = {};
    if (Array.isArray(data.fields)) {
        mapFieldsListGuid(data.fields, result);
    } else {
        result = {...data.fields};
    }
    if (data.fieldsList) {
        mapFieldsListGuid(data.fieldsList, result);
    }
    return result;
};

const getDatasetsFlatItems = (
    datasets: DashkitMetaDataItemBase['datasets'],
): Record<string, string> => {
    if (!datasets) {
        return {};
    }
    let result = {};
    datasets.forEach((item) => {
        const fields = getDatasetItemFlatFields(item);
        result = {...result, ...fields};
    });
    return result;
};

const getDatasetsListWithFlatFields = (datasets: Datasets) => {
    if (!datasets) {
        return {};
    }
    const flatDatasetFields: DatasetsFlatListData = {};
    for (const [id, data] of Object.entries(datasets)) {
        flatDatasetFields[id] = data.fields.reduce(
            (result: Record<string, string>, {guid, title}) => {
                result[guid] = title;
                return result;
            },
            {},
        );
    }
    return flatDatasetFields;
};

export const getMappedConnectedControlField = ({
    item,
    datasets,
    itemDefaults,
}: {
    item: DashkitMetaDataItemNoRelations;
    datasets: Datasets;
    itemDefaults?: DashkitMetaDataItemNoRelations['defaultParams'];
}) => {
    if (!isControl(item)) {
        return null;
    }

    // map fields with the name of the field from the dataset
    if (item?.datasets?.length && !item.isQL) {
        // if it is dataset selector
        return Object.keys(itemDefaults || item.defaultParams)
            .map((paramItem) => {
                const allFields = getDatasetsFlatItems(item.datasets);
                return allFields[paramItem] || '';
            })
            .filter(Boolean);
    } else {
        // if it is dataset selector (other format)
        const datasetFlatFields = getDatasetsListWithFlatFields(datasets);
        if (datasetFlatFields && item?.datasetId && datasetFlatFields[item?.datasetId]) {
            return Object.keys(itemDefaults || item.defaultParams)
                .map(
                    (paramItem) =>
                        datasetFlatFields[item.datasetId!] &&
                        datasetFlatFields[item.datasetId!][paramItem],
                )
                .filter(Boolean);
        }
    }

    return null;
};
