import type {
    DATASET_FIELD_TYPES,
    FeatureConfig,
    IChartEditor,
    Palette,
    ServerChartsConfig,
    ServerLink,
    ServerVisualization,
    Shared,
} from '../../../../../../shared';
import {extractColorPalettesFromData} from '../../helpers/color-palettes';
import {getDatasetIdAndLayerIdFromKey} from '../../helpers/misc';
import type {PrepareFunctionDataRow, PrepareFunctionResultData} from '../preparers/types';
import {mapChartsConfigToServerConfig} from '../utils/config-helpers';
import {LAT, LONG} from '../utils/constants';
import {log} from '../utils/misc-helpers';

import prepareSingleResult from './helpers/misc/prepare-single-result';

type MergedData = {
    result: PrepareFunctionResultData;
    fields: any[];
    fieldsByDataset: Record<string, any>;
};

type MergeDataArgs = {
    data: any;
    links: ServerLink[];
};

function mergeData({data, links}: MergeDataArgs) {
    const mergedData: MergedData = {
        result: {
            data: [],
            order: [],
            totals: [],
        },
        fields: [],
        fieldsByDataset: {},
    };

    let masterDatasetId: string;

    const mergedOrder: PrepareFunctionResultData['order'] = [];

    Object.keys(data).forEach((key) => {
        // We get the key of the current dataset
        const [currentDatasetId] = getDatasetIdAndLayerIdFromKey(key);

        if (data[key].pivot_data) {
            mergedData.result = data[key];
            mergedData.fields = data[key].fields;
            mergedData.fieldsByDataset[currentDatasetId] = data[key].fields;

            return;
        }

        mergedData.fields = mergedData.fields.concat(data[key].result.fields);
        mergedData.fieldsByDataset[currentDatasetId] = data[key].result.fields;
        mergedData.result.totals = mergedData.result.totals.concat(data[key].result.totals || []);

        const mergedRows = mergedData.result.data;

        // If this is the first dataset, then this is the master dataset
        if (mergedRows.length === 0) {
            masterDatasetId = currentDatasetId;

            if (data[key].result.data.Data.length) {
                let targetRow;

                // Merge all values
                data[key].result.data.Data.forEach((row: any[], i: number) => {
                    targetRow = mergedRows[i] = [];

                    row.forEach((value) => {
                        targetRow.push(value);
                    });
                });

                // Merge all types
                data[key].result.data.Type[1][1].forEach((type: [string]) => {
                    mergedOrder.push({
                        datasetId: currentDatasetId,
                        title: type[0],
                    });
                });
            }
        } else if (data[key].result.data.Data.length) {
            // If this is not the first dataset, then we will merge the values by connections
            // We record the order of the fields in the current dataset
            const currentOrder: string[][] = [];

            // First we write down the original types
            data[key].result.data.Type[1][1].forEach((type: string[]) => {
                currentOrder.push(type);
            });

            // We find the necessary connections between the current dataset and the master
            const neededLinks = links.filter((link) => {
                return link.fields[currentDatasetId] && link.fields[masterDatasetId];
            });

            // We write out the order of the fields from the wizard and the current dataset
            const fieldsInMaster = mergedOrder.map((entry) =>
                Array.isArray(entry) ? entry[0].title : entry.title,
            );
            const fieldsInCurrent = currentOrder.map((entry) => entry[0]);

            const indexInMasterByIndexInCurrent: Record<number, number> = {};
            const indexInCurrentByLinkIndex: Record<number, number> = {};

            // Merge the order
            neededLinks.forEach((link, linkIndex) => {
                const current = link.fields[currentDatasetId].field;
                const master = link.fields[masterDatasetId].field;

                const masterFieldData =
                    mergedData.fields.find((field) => field.guid === master.guid) || master;
                const currentFieldData =
                    mergedData.fields.find((field) => field.guid === current.guid) || current;

                const indexInMaster = fieldsInMaster.findIndex(
                    (title) => title === masterFieldData.title,
                );
                const indexInCurrent = fieldsInCurrent.findIndex(
                    (title) => title === currentFieldData.title,
                );

                indexInCurrentByLinkIndex[linkIndex] = indexInCurrent;
                indexInMasterByIndexInCurrent[indexInCurrent] = indexInMaster;
            });

            fieldsInCurrent.forEach((_title, i) => {
                const indexInMaster = indexInMasterByIndexInCurrent[i];

                if (typeof indexInMaster === 'undefined') {
                    mergedOrder.push({
                        datasetId: currentDatasetId,
                        title: currentOrder[i][0],
                    });
                } else {
                    const currentOrderItem = mergedOrder[indexInMaster];

                    const newOrderItem = {
                        datasetId: currentDatasetId,
                        title: currentOrder[i][0],
                    };

                    if (Array.isArray(currentOrderItem)) {
                        currentOrderItem.push(newOrderItem);
                    } else {
                        mergedOrder[indexInMaster] = [currentOrderItem, newOrderItem];
                    }
                }
            });

            const newMergedRows: PrepareFunctionDataRow[] = [];

            // Merge values
            const rows: PrepareFunctionDataRow[] = data[key].result.data.Data;

            rows.forEach((row: PrepareFunctionDataRow) => {
                let possibleTargetRows: PrepareFunctionDataRow[];
                const possibleTargetRow: PrepareFunctionDataRow = [];

                neededLinks.forEach((_link, linkIndex) => {
                    const indexInCurrent = indexInCurrentByLinkIndex[linkIndex];
                    const indexInMaster = indexInMasterByIndexInCurrent[indexInCurrent];

                    const targetValue = row[indexInCurrent];

                    possibleTargetRows = (possibleTargetRows || mergedRows).filter(
                        (someRow: PrepareFunctionDataRow) => {
                            return someRow[indexInMaster] === targetValue;
                        },
                    );

                    possibleTargetRow[indexInMaster] = targetValue;
                });

                const unlinkedFields: PrepareFunctionDataRow = [];

                // Merge unlinked indicators
                // TODO here it will still be necessary to check that this is an indicator when there is a type in fields
                row.forEach((value, i) => {
                    // If the field is not merged yet
                    if (typeof indexInMasterByIndexInCurrent[i] === 'undefined') {
                        unlinkedFields.push(value);
                    }
                });

                let targetRow = possibleTargetRows![0];

                if (!targetRow || targetRow.length + unlinkedFields.length > mergedOrder.length) {
                    targetRow = possibleTargetRow;

                    newMergedRows.push(targetRow);
                }

                while (mergedOrder.length > targetRow.length + unlinkedFields.length) {
                    targetRow.push(null);
                }

                unlinkedFields.forEach((field) => {
                    targetRow.push(field);
                });
            });

            mergedData.result.data = [...mergedRows, ...newMergedRows];
        }
    });

    mergedData.result.order = mergedOrder;

    return mergedData;
}

type V1ServerResponse = any;

export type JSTabOptions =
    | [{shared: Shared | ServerChartsConfig; ChartEditor: IChartEditor; data: any}]
    | [any, Shared | ServerChartsConfig, IChartEditor];

export const fallbackJSFunctionPrivate = ({
    options,
    features,
    palettes,
    defaultColorPaletteId,
}: {
    options: JSTabOptions;
    features: FeatureConfig;
    palettes: Record<string, Palette>;
    defaultColorPaletteId: string;
}) => {
    let data: any;
    let shared: Shared | ServerChartsConfig;
    let ChartEditor: IChartEditor;

    if ('shared' in options[0]) {
        data = options[0].data;
        shared = options[0].shared as Shared | ServerChartsConfig;
        ChartEditor = options[0].ChartEditor as IChartEditor;
    } else {
        data = options[0];
        shared = options[1] as Shared | ServerChartsConfig;
        ChartEditor = options[2] as IChartEditor;
    }

    shared = mapChartsConfigToServerConfig(shared);

    log('LOADED DATA:');
    log(data);

    const {colorPalettes: loadedColorPalettes, loadedData} = extractColorPalettesFromData(data);

    log('LINKS:');
    log(shared.links);

    Object.entries(loadedData).forEach(([key, value]: [string, V1ServerResponse]) => {
        if (value.result && value.result.query) {
            // For the inspector in ChartKit, we report the original request for data
            ChartEditor.setDataSourceInfo(key, {query: value.result.query});
        }

        if (value.result && value.result.data_export_forbidden) {
            // Hiding the data export button in the ChartKit menu
            ChartEditor.setExtra?.('dataExportForbidden', true);
        }
    });

    const newParams: Record<string, any> = {};
    const idToTitle: Record<string, string> = {};
    const idToDataType: Record<string, DATASET_FIELD_TYPES> = {};

    const layers = (shared as ServerChartsConfig).visualization.layers;
    let datasetsMeta: (
        | {
              id: string;
              fields: Record<string, string>;
              fieldsList: {
                  title: string;
                  guid: string;
                  dataType: string;
              }[];
          }
        | []
    )[] = [];
    let mergedData: MergedData[];
    const datasetsSchemaFields = shared.datasetsPartialFields;
    const datasetsIds = shared.datasetsIds;

    // If we have layers, then for each layer we get 1 set of confused data
    // If we don 't have layers , then we get 1 set of confused data according to the classics
    if (layers) {
        mergedData = [];

        layers.forEach((layer) => {
            const layerData: Record<string, any> = {};
            Object.keys(loadedData).forEach((key) => {
                const [_datasetId, layerId] = getDatasetIdAndLayerIdFromKey(key);
                if (layer.layerSettings?.id === layerId) {
                    layerData[key.replace(layerId, '')] = loadedData[key];
                }
            });

            const layerMergedData = mergeData({
                data: layerData,
                links: shared.links,
            });

            const datasetFields = layerMergedData.fields;

            datasetFields.forEach((field) => {
                const fieldId = field.guid || field.id;

                newParams[fieldId] = [];
                idToTitle[fieldId] = field.title;
                idToDataType[fieldId] = field.data_type;
            });

            mergedData.push(layerMergedData);

            datasetsMeta = datasetsIds.map((id, datasetIndex) => {
                if (datasetsMeta[datasetIndex]) {
                    return datasetsMeta[datasetIndex];
                }

                if (!layerMergedData.fieldsByDataset[id]) {
                    return [];
                }

                const fields: Record<string, string> = {};

                const schema = datasetsSchemaFields[datasetIndex];

                schema.forEach((item) => {
                    fields[item.guid] = idToTitle[item.guid];
                });

                const fieldsList = layerMergedData.fieldsByDataset[id].map(
                    (item: {guid: string; id: string}) => {
                        const fieldId = item.guid || item.id;

                        return {
                            title: idToTitle[fieldId],
                            guid: fieldId,
                            dataType: idToDataType[fieldId],
                        };
                    },
                );

                return {
                    id,
                    fields,
                    fieldsList,
                };
            });
        });
    } else {
        mergedData = [
            mergeData({
                data: loadedData,
                links: shared.links,
            }),
        ];

        const datasetFields = mergedData[0].fields;

        datasetFields.forEach((field) => {
            const fieldId = field.guid || field.id;

            newParams[fieldId] = [];
            idToTitle[fieldId] = field.title;
            idToDataType[fieldId] = field.data_type;
        });

        datasetsMeta = datasetsIds.map((id, datasetIndex) => {
            if (!mergedData[0].fieldsByDataset[id]) {
                return [];
            }

            const fields: Record<string, string> = {};

            const schema = datasetsSchemaFields[datasetIndex];

            schema.forEach((item) => {
                fields[item.guid] = idToTitle[item.guid];
            });

            const fieldsList = mergedData[0].fieldsByDataset[id].map(
                (item: {guid: string; id: string}) => {
                    const fieldId = item.guid || item.id;

                    return {
                        title: idToTitle[fieldId],
                        guid: fieldId,
                        dataType: idToDataType[fieldId],
                    };
                },
            );

            return {
                id,
                fields,
                fieldsList,
            };
        });
    }

    ChartEditor.updateParams(newParams);
    ChartEditor.setExtra('datasets', datasetsMeta);

    log('MERGED DATA:');
    log(mergedData);

    let result: any = [];

    if (layers) {
        let bounds: null | any = null;

        layers.forEach((layer, layerIndex) => {
            const resultData = mergedData[layerIndex].result;

            const localResult = prepareSingleResult({
                resultData,
                shared: shared as ServerChartsConfig,
                visualization: layer,
                idToTitle,
                idToDataType,
                ChartEditor,
                datasetsIds,
                loadedColorPalettes,
                palettes,
                features,
                defaultColorPaletteId,
            });

            if (localResult && localResult[0] && localResult[0].bounds) {
                const {bounds: localBounds} = localResult[0];

                const boundExists = Boolean(bounds && bounds[0] && bounds[1]);
                const localBoundExists = Boolean(localBounds && localBounds[0] && localBounds[1]);

                if (boundExists && localBoundExists) {
                    if (localBounds[0][LAT] < bounds[0][LAT]) {
                        bounds[0][LAT] = localBounds[0][LAT];
                    }

                    if (localBounds[0][LONG] < bounds[0][LONG]) {
                        bounds[0][LONG] = localBounds[0][LONG];
                    }

                    if (localBounds[1][LAT] > bounds[1][LAT]) {
                        bounds[1][LAT] = localBounds[1][LAT];
                    }

                    if (localBounds[1][LONG] > bounds[1][LONG]) {
                        bounds[1][LONG] = localBounds[1][LONG];
                    }
                } else if (localBoundExists) {
                    bounds = [...localBounds];
                }
            }

            if (Array.isArray(localResult)) {
                result = [...result, ...localResult];
            }
        });

        if (ChartEditor && bounds) {
            ChartEditor.updateHighchartsConfig({
                state: {
                    bounds,
                },
            });
        }
    } else {
        const resultData = mergedData[0].result;

        result = prepareSingleResult({
            resultData,
            shared: shared as ServerChartsConfig,
            visualization: shared.visualization as ServerVisualization,
            idToTitle,
            idToDataType,
            ChartEditor,
            datasetsIds,
            loadedColorPalettes,
            palettes,
            features,
            defaultColorPaletteId,
        });

        if (result && result[0] && result[0].bounds) {
            ChartEditor.updateHighchartsConfig({
                state: {
                    bounds: result[0].bounds,
                },
            });
        }
    }

    log('RESULT:');
    log(result);

    return result;
};
