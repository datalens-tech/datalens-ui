import {isEqual} from 'lodash';
import moment from 'moment';

import {
    ApiV2RequestField,
    ApiV2ResultDataRow,
    ApiV2ResultField,
    ChartsInsight,
    ColorPalette,
    DATASET_FIELD_TYPES,
    IChartEditor,
    MAX_SEGMENTS_NUMBER,
    ServerChartsConfig,
    ServerField,
    ServerFieldFormatting,
    ServerLink,
    ServerShape,
    ServerVisualization,
    ServerVisualizationLayer,
    Shared,
    WizardVisualizationId,
    isDateType,
    isMarkupField,
} from '../../../../../../shared';
import {getDatasetIdAndLayerIdFromKey, getFieldList} from '../../helpers/misc';
import prepareBackendPivotTableData from '../preparers/backend-pivot-table';
import {PivotData} from '../preparers/backend-pivot-table/types';
import {prepareD3BarX, prepareHighchartsBarX} from '../preparers/bar-x';
import {prepareHighchartsBarY} from '../preparers/bar-y';
import prepareFlatTableData from '../preparers/flat-table';
import prepareGeopointData from '../preparers/geopoint';
import prepareGeopointWithClusterData from '../preparers/geopoint-with-cluster';
import prepareGeopolygonData from '../preparers/geopolygon';
import prepareHeatmapData from '../preparers/heatmap';
import {prepareD3Line, prepareHighchartsLine} from '../preparers/line';
import prepareMetricData from '../preparers/metric';
import preparePivotTableData from '../preparers/old-pivot-table/old-pivot-table';
import {prepareD3Pie, prepareHighchartsPie} from '../preparers/pie';
import preparePolylineData from '../preparers/polyline';
import {prepareD3Scatter, prepareHighchartsScatter} from '../preparers/scatter';
import prepareTreemapData from '../preparers/treemap';
import {
    LayerChartMeta,
    PrepareFunction,
    PrepareFunctionArgs,
    PrepareFunctionDataRow,
    PrepareFunctionResultData,
} from '../preparers/types';
import {mapChartsConfigToServerConfig} from '../utils/config-helpers';
import {LAT, LONG} from '../utils/constants';
import {log} from '../utils/misc-helpers';

import {OversizeErrorType} from './constants/errors';
import {getChartColorsConfig} from './helpers/colors';
import {getOversizeError} from './helpers/errors/oversize-error';
import {
    isBackendPivotCellsOversizeError,
    isBackendPivotColumnsOversizeError,
    isDefaultOversizeError,
    isSegmentsOversizeError,
} from './helpers/errors/oversize-error/utils';
import {
    extendCombinedChartGraphs,
    getLayerChartMeta,
    mergeResultForCombinedCharts,
} from './helpers/layer-chart';
import {prepareNotifications} from './helpers/notifications';
import {getMergedTotals} from './helpers/totals';

const fallbackJSFuntion = require('./js-v1.5');

type MergedData = {
    result: PrepareFunctionResultData;
    fields: any[];
    fieldsByDataset: Record<string, any>;
    notifications: ChartsInsight[];
};

type MergeDataArgs = {
    data: any;
    links: ServerLink[];
};

type LoadedField = {
    title: string;
    legend_item_id: number;
};

function mergeData({data, links}: MergeDataArgs) {
    const mergedData: MergedData = {
        result: {
            data: [],
            legend: [],
            order: [],
            totals: [],
        },
        fields: [],
        notifications: [],
        fieldsByDataset: {},
    };

    let masterDatasetId: string;

    const mergedOrder: PrepareFunctionResultData['order'] = [];

    Object.keys(data).forEach((key) => {
        // We get the key of the current dataset
        const [currentDatasetId] = getDatasetIdAndLayerIdFromKey(key);

        const mappedFields = data[key].fields.map((item: any) => ({...item, guid: item.id}));

        if (data[key].pivot_data) {
            mergedData.result = data[key];
            mergedData.fields = mappedFields;
            mergedData.notifications = mergedData.notifications.concat(
                data[key].notifications || [],
            );
            mergedData.fieldsByDataset[currentDatasetId] = mappedFields;

            return;
        }

        mergedData.fields = mergedData.fields.concat(mappedFields);
        mergedData.fieldsByDataset[currentDatasetId] = mappedFields;
        mergedData.notifications = mergedData.notifications.concat(data[key].notifications || []);

        const mergedRows = mergedData.result.data;
        const mergedLegends = mergedData.result.legend || ([] as number[][]);

        const resultDataRows = data[key].result_data[0].rows as ApiV2ResultDataRow[];
        const legends = resultDataRows.map((el) => el.legend);
        const resultFields = data[key].fields as ApiV2ResultField[];

        const lastResultRow = resultDataRows[resultDataRows.length - 1];

        const resultContainsTotals = lastResultRow?.legend.some((legendItemId: number) => {
            const field = resultFields.find((field: any) => field.legend_item_id === legendItemId);

            return field?.role_spec?.role === 'total';
        });

        let isEmptyPlaceholder = false;
        const currentOrder: {title: string; dataType: string}[] = [];

        if (lastResultRow?.legend.length === 1) {
            const field = resultFields.find(
                (field) => field.legend_item_id === lastResultRow?.legend[0],
            );

            // A case where multi-datasets are used and the only thing that lies in the last row with data is an empty row
            // Occurs when only a Dimension is used in one of the datasets and the role: template is specified for it in the request
            // This placeholder then breaks the visualization if you don't get rid of it.
            // Therefore, we are looking for a field and if it is a template, we delete it from the array of strings.

            isEmptyPlaceholder = field?.role_spec?.role === 'template';
        }

        if (resultContainsTotals || isEmptyPlaceholder) {
            resultDataRows.pop();
        }

        // If this is the first dataset, then this is the master dataset
        const isFirstDataset = mergedRows.length === 0;

        if (isFirstDataset) {
            masterDatasetId = currentDatasetId;

            if (resultDataRows.length) {
                let targetRow;
                let targetLegend: number[];

                // Merge all values
                resultDataRows.forEach((row: {data: any[]; legend: number[]}, i: number) => {
                    targetRow = mergedRows[i] = [];
                    targetLegend = mergedLegends[i] = [];

                    row.data.forEach((value) => {
                        targetRow.push(value);
                    });

                    row.legend.forEach((value) => {
                        targetLegend.push(value);
                    });
                });

                const rowLegendIds = resultDataRows[0].legend || [];

                rowLegendIds.forEach((legendId: number) => {
                    const field = resultFields.find(
                        (field: LoadedField) => field.legend_item_id === legendId,
                    )!;

                    mergedOrder.push({
                        datasetId: currentDatasetId,
                        title: field.title,
                        dataType: field.data_type,
                    });
                });
            }
        } else if (resultDataRows.length) {
            // If this is not the first dataset, then we will merge the values by connections
            // We record the order of the fields in the current dataset
            // First we write down the original types

            const rowLegendIds = resultDataRows[0].legend || [];

            rowLegendIds.forEach((legendId: number) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const field = resultFields.find(
                    (field: LoadedField) => field.legend_item_id === legendId,
                )!;

                currentOrder.push({title: field.title, dataType: field.data_type});
            });

            // We find the necessary connections between the current dataset and the master
            const neededLinks = links.filter((link) => {
                return link.fields[currentDatasetId] && link.fields[masterDatasetId];
            });

            // We write out the order of the fields from the wizard and the current dataset
            const fieldsInMaster = mergedOrder.map((entry) => {
                return Array.isArray(entry)
                    ? {
                          title: entry[0].title,
                          dataType: entry[0].dataType,
                      }
                    : {
                          title: entry.title,
                          dataType: entry.dataType,
                      };
            });

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
                    ({title}) => title === masterFieldData.title,
                );
                const indexInCurrent = currentOrder.findIndex(
                    ({title}) => title === currentFieldData.title,
                );

                indexInCurrentByLinkIndex[linkIndex] = indexInCurrent;
                indexInMasterByIndexInCurrent[indexInCurrent] = indexInMaster;
            });

            currentOrder.forEach((_title, i) => {
                const indexInMaster = indexInMasterByIndexInCurrent[i];

                if (typeof indexInMaster === 'undefined') {
                    mergedOrder.push({
                        datasetId: currentDatasetId,
                        title: currentOrder[i].title,
                        dataType: currentOrder[i].dataType,
                    });
                } else {
                    const currentOrderItem = mergedOrder[indexInMaster];

                    const newOrderItem = {
                        datasetId: currentDatasetId,
                        title: currentOrder[i].title,
                        dataType: currentOrder[i].dataType,
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
            const rows: ApiV2ResultDataRow[] = data[key].result_data[0].rows;

            rows.forEach((row: ApiV2ResultDataRow) => {
                let possibleTargetRows: PrepareFunctionDataRow[];
                const possibleTargetRow: PrepareFunctionDataRow = [];

                neededLinks.forEach((_link, linkIndex) => {
                    const indexInCurrent = indexInCurrentByLinkIndex[linkIndex];
                    const indexInMaster = indexInMasterByIndexInCurrent[indexInCurrent];

                    const targetValue = row.data[indexInCurrent];
                    const mergedOrderMaster = mergedOrder[indexInMaster];

                    const currentDataType = currentOrder[indexInCurrent]?.dataType;
                    let masterDataType: string | undefined;

                    if (Array.isArray(mergedOrderMaster)) {
                        masterDataType = mergedOrderMaster?.[0]?.dataType;
                    } else {
                        masterDataType = mergedOrderMaster?.dataType;
                    }

                    // need moment object comparison only for datetime with timezone or for dates with different types
                    const needCompareAsDates =
                        currentOrder[indexInCurrent] &&
                        mergedOrderMaster &&
                        (currentDataType === DATASET_FIELD_TYPES.DATETIMETZ ||
                            (isDateType(currentDataType) && masterDataType !== currentDataType));

                    const needCompareAsMarkup =
                        currentOrder[indexInCurrent] &&
                        isMarkupField({data_type: currentDataType}) &&
                        masterDataType === currentDataType;

                    if (needCompareAsDates) {
                        possibleTargetRows = (possibleTargetRows || mergedRows).filter(
                            (someRow: PrepareFunctionDataRow) => {
                                const someRowValue = someRow[indexInMaster];

                                return (
                                    moment.utc(someRowValue).valueOf() ===
                                    moment.utc(targetValue).valueOf()
                                );
                            },
                        );
                    } else if (needCompareAsMarkup) {
                        possibleTargetRows = (possibleTargetRows || mergedRows).filter(
                            (someRow: PrepareFunctionDataRow) => {
                                return isEqual(someRow[indexInMaster], targetValue);
                            },
                        );
                    } else {
                        possibleTargetRows = (possibleTargetRows || mergedRows).filter(
                            (someRow: PrepareFunctionDataRow) => {
                                return someRow[indexInMaster] === targetValue;
                            },
                        );
                    }

                    possibleTargetRow[indexInMaster] = targetValue;
                });

                const unlinkedFields: PrepareFunctionDataRow = [];

                // Merge unlinked indicators
                // TODO here it will still be necessary to check that this is an indicator when there is a type in fields
                row.data.forEach((value, i) => {
                    // If the field is not merged yet
                    if (typeof indexInMasterByIndexInCurrent[i] === 'undefined') {
                        unlinkedFields.push(value);
                    }
                });

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
            mergedData.result.legend = [...mergedLegends, ...legends];
        }

        if (resultContainsTotals) {
            mergedData.result.totals = getMergedTotals({
                isFirstDataset,
                mergedOrder,
                lastResultRow,
                totals: mergedData.result.totals,
                currentOrder,
                resultDataRows,
            }) as string[];
        }
    });

    mergedData.result.order = mergedOrder;

    return mergedData;
}

type PrepareSingleResultArgs = {
    resultData: PrepareFunctionResultData;
    fields: ApiV2RequestField[];
    notifications: ChartsInsight[];
    visualization: ServerVisualization;
    shared: ServerChartsConfig;
    idToTitle: Record<string, string>;
    idToDataType: Record<string, DATASET_FIELD_TYPES>;
    ChartEditor: IChartEditor;
    datasetsIds: string[];
    loadedColorPalettes: Record<string, ColorPalette>;
    layerChartMeta?: LayerChartMeta;
    usedColors?: (string | undefined)[];
};

// eslint-disable-next-line complexity
function prepareSingleResult({
    resultData,
    fields,
    notifications,
    visualization,
    shared,
    idToTitle,
    idToDataType,
    ChartEditor,
    datasetsIds,
    loadedColorPalettes,
    layerChartMeta,
    usedColors,
}: PrepareSingleResultArgs) {
    const {
        sharedData: {drillDownData},
    } = shared;

    let rowsLength: undefined | number;

    let cellsCount: number | undefined;
    let columnsCount: number | undefined;

    if ((resultData as any)?.pivot_data) {
        const pivotData = (resultData as any).pivot_data as PivotData;

        const rows = pivotData.rows || [];
        const columns = pivotData.columns || [];

        const rowsValues = rows[0]?.values || [];

        cellsCount = rows.length * rowsValues.length;
        columnsCount = columns.length;
    } else {
        rowsLength = resultData.data && resultData.data.length;
    }

    if (notifications.length) {
        notifications = prepareNotifications(notifications, visualization);

        ChartEditor.setChartsInsights(notifications);
    }

    if (drillDownData) {
        ChartEditor.updateConfig({
            drillDown: {
                breadcrumbs: drillDownData.breadcrumbs,
            },
        });

        ChartEditor.updateParams({
            drillDownLevel: drillDownData.level,
            drillDownFilters: drillDownData.filters,
            isColorDrillDown: drillDownData.isColorDrillDown,
        });
    }

    if (rowsLength === 0) {
        return {};
    }

    let prepare;

    let rowsLimit: number | undefined;
    let cellsLimit: number | undefined;
    let columnsLimit: number | undefined;

    let shapes: ServerShape[] = [];
    let shapesConfig;

    const segments: ServerField[] = shared.segments || [];

    switch (visualization.id) {
        case 'line':
        case 'area':
        case 'area100p': {
            if (visualization.id === 'line') {
                shapes = shared.shapes || [];
                shapesConfig = shared.shapesConfig;
            }

            prepare = prepareHighchartsLine;
            rowsLimit = 75000;
            break;
        }

        case 'bar':
        case 'bar100p': {
            prepare = prepareHighchartsBarY;
            rowsLimit = 75000;
            break;
        }

        case WizardVisualizationId.LineD3: {
            shapes = shared.shapes || [];
            shapesConfig = shared.shapesConfig;
            prepare = prepareD3Line;
            rowsLimit = 75000;
            break;
        }

        case 'column':
        case 'column100p': {
            prepare = prepareHighchartsBarX;
            rowsLimit = 75000;
            break;
        }

        case 'bar-x-d3': {
            prepare = prepareD3BarX;
            rowsLimit = 75000;
            break;
        }

        case 'scatter':
            shapes = shared.shapes || [];
            shapesConfig = shared.shapesConfig;
            prepare = prepareHighchartsScatter;
            rowsLimit = 75000;
            break;

        case 'scatter-d3':
            shapes = shared.shapes || [];
            shapesConfig = shared.shapesConfig;
            prepare = prepareD3Scatter;
            rowsLimit = 75000;
            break;

        case 'pie':
        case 'donut':
            prepare = prepareHighchartsPie;
            rowsLimit = 1000;
            break;

        case 'pie-d3':
            prepare = prepareD3Pie;
            rowsLimit = 1000;
            break;

        case 'metric':
            prepare = prepareMetricData;
            rowsLimit = 1000;
            break;

        case 'treemap':
            prepare = prepareTreemapData;
            rowsLimit = 800;
            break;

        case 'flatTable':
            prepare = prepareFlatTableData;
            rowsLimit = 100000;
            break;

        case 'pivotTable': {
            const pivotFallbackEnabled = shared.extraSettings?.pivotFallback === 'on';

            if (pivotFallbackEnabled) {
                prepare = preparePivotTableData;
                rowsLimit = 40000;
            } else {
                prepare = prepareBackendPivotTableData;
                cellsLimit = 100000;
                columnsLimit = 800;
            }
            break;
        }
        case 'geopoint':
            prepare = prepareGeopointData;
            rowsLimit = 40000;
            break;
        case 'geopoint-with-cluster':
            prepare = prepareGeopointWithClusterData;
            rowsLimit = 40000;
            break;
        case 'geopolygon':
            prepare = prepareGeopolygonData;
            rowsLimit = 40000;
            break;

        case 'heatmap':
            prepare = prepareHeatmapData;
            rowsLimit = 40000;
            break;

        case 'polyline':
            prepare = preparePolylineData;
            rowsLimit = 40000;
            break;
    }

    const oversize = isDefaultOversizeError(rowsLength, rowsLimit);
    const backendPivotCellsOversize = isBackendPivotCellsOversizeError(cellsCount, cellsLimit);
    const backendPivotColumnsOversize = isBackendPivotColumnsOversizeError(
        columnsCount,
        columnsLimit,
    );
    const {segmentsOversize, segmentsNumber} = isSegmentsOversizeError({
        segments,
        idToTitle,
        order: resultData.order,
        data: resultData.data,
    });

    const isChartOversizeError =
        oversize || backendPivotCellsOversize || backendPivotColumnsOversize || segmentsOversize;

    if (isChartOversizeError) {
        let errorType;
        let limit;
        let current;
        if (backendPivotColumnsOversize) {
            errorType = OversizeErrorType.PivotTableColumns;
            limit = columnsLimit!;
            current = columnsCount!;
        } else if (backendPivotCellsOversize) {
            errorType = OversizeErrorType.PivotTableCells;
            limit = cellsLimit!;
            current = cellsCount;
        } else if (segmentsOversize) {
            errorType = OversizeErrorType.SegmentsNumber;
            limit = MAX_SEGMENTS_NUMBER;
            current = segmentsNumber;
        } else {
            errorType = OversizeErrorType.Default;
            limit = rowsLimit!;
            current = rowsLength!;
        }

        const oversizeError = getOversizeError({
            type: errorType,
            limit,
            current: current!,
        });

        ChartEditor._setError(oversizeError);

        return {};
    }

    let {
        colors = [],
        colorsConfig,
        labels = [],
        tooltips = [],
        geopointsConfig,
        sort = [],
    } = shared;

    if ((visualization as ServerVisualizationLayer).layerSettings) {
        ({
            geopointsConfig,
            colors,
            colorsConfig = {},
            labels,
            tooltips,
            sort,
            shapes = [],
            shapesConfig = {},
        } = (visualization as ServerVisualizationLayer).commonPlaceholders);
    }

    const chartColorsConfig = getChartColorsConfig({
        loadedColorPalettes,
        colorsConfig,
    });

    const prepareFunctionArgs: PrepareFunctionArgs = {
        placeholders: visualization.placeholders,
        colors,
        colorsConfig: chartColorsConfig,
        geopointsConfig,
        sort,
        visualizationId: visualization.id,
        layerSettings: (visualization as ServerVisualizationLayer).layerSettings,
        labels,
        tooltips,
        datasets: datasetsIds,

        resultData,
        fields,
        idToTitle,
        idToDataType,
        shared,
        ChartEditor,
        shapes,
        shapesConfig,
        segments,
        layerChartMeta,
        usedColors,
    };

    return (prepare as PrepareFunction)(prepareFunctionArgs);
}

type V1ServerResponse = any;

type JSTabOptions =
    | [{shared: Shared | ServerChartsConfig; ChartEditor: IChartEditor; data: any}]
    | [any, Shared | ServerChartsConfig, IChartEditor];

module.exports = (...options: JSTabOptions) => {
    let data: any;
    let shared: Shared | ServerChartsConfig;
    let ChartEditor: IChartEditor;
    let apiVersion;

    if ('shared' in options[0]) {
        data = options[0].data;
        shared = options[0].shared as Shared | ServerChartsConfig;
        ChartEditor = options[0].ChartEditor as IChartEditor;
        apiVersion = options[0].apiVersion;
    } else {
        data = options[0];
        shared = options[1] as Shared | ServerChartsConfig;
        ChartEditor = options[2] as IChartEditor;
    }

    log('LOADED DATA:');
    log(data);

    apiVersion = apiVersion || '1.5';

    if (apiVersion === '1.5') {
        return fallbackJSFuntion.apply(this, options);
    }

    shared = mapChartsConfigToServerConfig(shared);

    const loadedColorPalettes: Record<string, any> = {};
    const loadedData: Record<string, any> = {};

    Object.keys(data).forEach((key) => {
        if (key.includes('colorPalettes_')) {
            const paletteId = key.replace('colorPalettes_', '');

            loadedColorPalettes[paletteId] = data[key][0];
        } else {
            loadedData[key] = data[key];
        }
    });

    log('LINKS:');
    log(shared.links);

    Object.entries(loadedData).forEach(([key, value]: [string, V1ServerResponse]) => {
        const query = (value.blocks || [])
            .map((block: {query: string}) => block.query)
            .join('\n\n');

        if (query) {
            // For the inspector in ChartKit, we report the original request for data
            ChartEditor.setDataSourceInfo(key, {query});
        }

        if (value.data_export_forbidden) {
            // Hiding the data export button in the ChartKit menu
            ChartEditor.setExtra('dataExportForbidden', true);
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
                  formatting?: ServerFieldFormatting;
              }[];
          }
        | []
    )[] = [];
    let mergedData: MergedData[];
    const datasetsSchemaFields = shared.datasetsPartialFields;
    const datasetsIds = shared.datasetsIds;

    // If we have layers, then for each layer we get 1 set of merged data
    // If we don 't have layers , then we get 1 set of merged data according to the classics
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

                return {
                    id,
                    fields,
                    fieldsList: getFieldList(
                        layerMergedData.fieldsByDataset[id],
                        layer.placeholders,
                    ),
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

            return {
                id,
                fields,
                fieldsList: getFieldList(
                    mergedData[0].fieldsByDataset[id],
                    shared.visualization.placeholders,
                ),
            };
        });
    }

    ChartEditor.updateParams(newParams);
    ChartEditor.setExtra('datasets', datasetsMeta);

    log('MERGED DATA:');
    log(mergedData);

    let result: any = [];
    let bounds: null | any = null;

    if (layers) {
        const legendValues: Record<string, string> = {};
        const layerChartMeta = getLayerChartMeta({
            layers,
            isComboChart: shared.visualization.id === 'combined-chart',
        });
        const usedColors: (string | undefined)[] = [];
        layers.forEach((layer, layerIndex) => {
            const resultData = mergedData[layerIndex].result;
            const fields = mergedData[layerIndex].fields;
            const notifications = mergedData[layerIndex].notifications;

            const localResult = prepareSingleResult({
                resultData,
                fields,
                notifications,
                shared: shared as ServerChartsConfig,
                visualization: layer,
                idToTitle,
                idToDataType,
                ChartEditor,
                datasetsIds,
                loadedColorPalettes,
                layerChartMeta,
                usedColors,
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

            if (localResult?.graphs && shared.visualization.id === 'combined-chart') {
                extendCombinedChartGraphs({
                    graphs: localResult.graphs,
                    layer,
                    layers,
                    legendValues,
                });
                result = result.concat(localResult);
            } else if (Array.isArray(localResult)) {
                result = [...result, ...localResult];
            }
        });

        if (shared.visualization.id === 'combined-chart') {
            result = mergeResultForCombinedCharts(result);
        }
    } else {
        const resultData = mergedData[0].result;
        const fields = mergedData[0].fields;
        const notifications = mergedData[0].notifications;
        bounds = result && result[0] && result[0].bounds;

        result = prepareSingleResult({
            resultData,
            fields,
            notifications,
            shared: shared as ServerChartsConfig,
            visualization: shared.visualization as ServerVisualization,
            idToTitle,
            idToDataType,
            ChartEditor,
            datasetsIds,
            loadedColorPalettes,
        });
    }

    if (bounds) {
        ChartEditor.updateHighchartsConfig({
            ...(Boolean(bounds) && {state: {bounds}}),
        });
    }

    log('RESULT:');
    log(result);

    return result;
};
