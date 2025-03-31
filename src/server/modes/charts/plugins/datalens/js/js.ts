import moment from 'moment';

import type {
    ApiV2RequestField,
    ApiV2ResultDataRow,
    ApiV2ResultField,
    ChartsInsight,
    ColorPalette,
    FeatureConfig,
    IChartEditor,
    Palette,
    ServerChartsConfig,
    ServerField,
    ServerFieldFormatting,
    ServerLink,
    ServerShape,
    ServerVisualization,
    ServerVisualizationLayer,
    Shared,
} from '../../../../../../shared';
import {
    DATASET_FIELD_TYPES,
    MAX_SEGMENTS_NUMBER,
    WizardVisualizationId,
    isDateType,
    isMarkupField,
    isMarkupItem,
    markupToRawString,
} from '../../../../../../shared';
import {extractColorPalettesFromData} from '../../helpers/color-palettes';
import {getDatasetIdAndLayerIdFromKey, getFieldList} from '../../helpers/misc';
import prepareBackendPivotTableData from '../preparers/backend-pivot-table';
import type {PivotData} from '../preparers/backend-pivot-table/types';
import {prepareD3BarX, prepareHighchartsBarX} from '../preparers/bar-x';
import {prepareD3BarY, prepareHighchartsBarY} from '../preparers/bar-y';
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
import {prepareD3Treemap, prepareHighchartsTreemap} from '../preparers/treemap';
import type {
    LayerChartMeta,
    PrepareFunction,
    PrepareFunctionArgs,
    PrepareFunctionDataRow,
    PrepareFunctionResultData,
    ResultDataOrderItem,
} from '../preparers/types';
import {mapChartsConfigToServerConfig} from '../utils/config-helpers';
import {LAT, LONG} from '../utils/constants';
import {preprocessHierarchies} from '../utils/hierarchy-helpers';
import {getServerDateFormat, log} from '../utils/misc-helpers';

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

function getValueForCompare(
    value: string | null,
    field: {dataType?: string} | undefined,
    otherField: {dataType?: string} | undefined,
) {
    if (
        field?.dataType === DATASET_FIELD_TYPES.DATETIMETZ ||
        (field?.dataType && isDateType(field.dataType) && field.dataType !== otherField?.dataType)
    ) {
        return moment.utc(value).valueOf();
    }

    if (isMarkupField({data_type: String(field?.dataType)}) && isMarkupItem(value)) {
        return markupToRawString(value);
    }

    return value;
}

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
        if (!resultDataRows.length) {
            return;
        }

        const legends = resultDataRows.map((el) => el.legend);
        const resultFields = data[key].fields as ApiV2ResultField[];

        const lastResultRow = resultDataRows[resultDataRows.length - 1];

        const resultContainsTotals = lastResultRow?.legend.some((legendItemId: number) => {
            const field = resultFields.find((field: any) => field.legend_item_id === legendItemId);

            return field?.role_spec?.role === 'total';
        });

        let isEmptyPlaceholder = false;
        const currentOrder: {guid: string; title: string; dataType: string}[] = [];

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

            // Merge all values
            resultDataRows.forEach((row: {data: any[]; legend: number[]}, i: number) => {
                mergedRows[i] = [...row.data];
                mergedLegends[i] = [...row.legend];
            });

            const rowLegendIds = resultDataRows[0]?.legend || [];
            rowLegendIds.forEach((legendId) => {
                const field = resultFields.find((f) => f.legend_item_id === legendId);
                if (field) {
                    mergedOrder.push({
                        datasetId: currentDatasetId,
                        title: field.title,
                        dataType: field.data_type,
                    });
                }
            });
        } else {
            // If this is not the first dataset, then we will merge the values by connections
            // We record the order of the fields in the current dataset
            // First we write down the original types

            const rowLegendIds = resultDataRows[0]?.legend || [];
            rowLegendIds.forEach((legendId: number) => {
                const field = resultFields.find((field) => field.legend_item_id === legendId);
                if (field) {
                    currentOrder.push({
                        guid: field.id,
                        title: field.title,
                        dataType: field.data_type,
                    });
                }
            });

            // We write out the order of the fields from the wizard and the current dataset
            const fieldsInMaster = mergedOrder.map((entries) => {
                const entry = Array.isArray(entries) ? entries[0] : entries;
                return {
                    title: entry.title,
                    dataType: entry.dataType,
                };
            });

            // We find the necessary connections between the current dataset and the master
            const neededLinks = links.filter((link) => {
                return link.fields[currentDatasetId] && link.fields[masterDatasetId];
            });
            const indexInMasterByIndexInCurrent: Record<number, number> = {};
            const indexInCurrentByLinkIndex: Record<number, number> = {};
            neededLinks.forEach((link, linkIndex) => {
                const current = link.fields[currentDatasetId].field;
                const currentFieldData =
                    mergedData.fields.find((field) => field.guid === current.guid) || current;

                const master = link.fields[masterDatasetId].field;
                const masterFieldData =
                    mergedData.fields.find((field) => field.guid === master.guid) || master;

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
                const resultOrderItem = {
                    datasetId: currentDatasetId,
                    title: currentOrder[i].title,
                    dataType: currentOrder[i].dataType,
                };

                if (typeof indexInMaster === 'undefined') {
                    mergedOrder.push(resultOrderItem);
                } else {
                    const currentOrderItem = mergedOrder[indexInMaster];
                    if (!Array.isArray(currentOrderItem)) {
                        mergedOrder[indexInMaster] = [currentOrderItem];
                    }

                    (mergedOrder[indexInMaster] as ResultDataOrderItem[]).push(resultOrderItem);
                }
            });

            const linkOrder = neededLinks.map((link) => {
                const left = mergedOrder.findIndex((item) => {
                    const orderItem = Array.isArray(item) ? item[0] : item;
                    return orderItem.title === link.fields[masterDatasetId]?.field.title;
                });
                const right = currentOrder.findIndex((item) => {
                    return item.title === link.fields[currentDatasetId]?.field.title;
                });

                return [left, right];
            });

            const sourceDataMap: Record<string, PrepareFunctionDataRow> = {};
            mergedRows.forEach((row) => {
                const joinBy = linkOrder
                    .map(([left, right]) => {
                        const orderItems = mergedOrder[left];
                        const field = Array.isArray(orderItems) ? orderItems[0] : orderItems;

                        return getValueForCompare(row[left], field, currentOrder[right]);
                    })
                    .join();

                sourceDataMap[joinBy] = row;
            });

            const newMergedRows: PrepareFunctionDataRow[] = [];
            const rows: ApiV2ResultDataRow[] = data[key].result_data[0].rows;
            rows.forEach((row: ApiV2ResultDataRow) => {
                const joinBy = linkOrder
                    .map(([left, right]) => {
                        const orderItem = mergedOrder[left];
                        const otherField = Array.isArray(orderItem) ? orderItem[0] : orderItem;

                        return getValueForCompare(row.data[right], currentOrder[right], otherField);
                    })
                    .join();
                let targetRow = sourceDataMap[joinBy];

                const possibleTargetRow: PrepareFunctionDataRow = [];
                linkOrder.forEach(([left, right]) => {
                    possibleTargetRow[left] = row.data[right];
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
    palettes: Record<string, Palette>;
    loadedColorPalettes: Record<string, ColorPalette>;
    layerChartMeta?: LayerChartMeta;
    usedColors?: (string | undefined)[];
    features: FeatureConfig;
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
    palettes,
    features,
}: PrepareSingleResultArgs) {
    const isVisualizationWithLayers = Boolean(
        (visualization as ServerVisualizationLayer).layerSettings,
    );
    const commonPlaceholders = (visualization as ServerVisualizationLayer).commonPlaceholders;

    preprocessHierarchies({
        visualizationId: visualization.id,
        placeholders: visualization.placeholders,
        params: ChartEditor.getParams(),
        sharedData: shared.sharedData,
        colors: isVisualizationWithLayers ? commonPlaceholders.colors : shared.colors,
        shapes: (isVisualizationWithLayers ? commonPlaceholders.shapes : shared.shapes) || [],
        segments: shared.segments || [],
    });

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
        const currentDrillDownField = drillDownData.fields[drillDownData.level];
        ChartEditor.updateConfig({
            drillDown: {
                breadcrumbs: drillDownData.breadcrumbs,
                dateFormat: getServerDateFormat(currentDrillDownField?.data_type || ''),
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

        case WizardVisualizationId.Bar:
        case WizardVisualizationId.Bar100p: {
            prepare = prepareHighchartsBarY;
            rowsLimit = 75000;
            break;
        }

        case WizardVisualizationId.BarYD3:
        case WizardVisualizationId.BarY100pD3: {
            prepare = prepareD3BarY;
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
        case 'pie3d':
        case 'donut':
            prepare = prepareHighchartsPie;
            rowsLimit = 1000;
            break;

        case WizardVisualizationId.PieD3:
        case WizardVisualizationId.DonutD3:
            prepare = prepareD3Pie;
            rowsLimit = 1000;
            break;

        case 'metric':
            prepare = prepareMetricData;
            rowsLimit = 1000;
            break;

        case 'treemap':
            prepare = prepareHighchartsTreemap;
            rowsLimit = 800;
            break;

        case WizardVisualizationId.TreemapD3:
            prepare = prepareD3Treemap;
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
        tooltipConfig,
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
            tooltipConfig,
        } = (visualization as ServerVisualizationLayer).commonPlaceholders);
    }

    const chartColorsConfig = getChartColorsConfig({
        loadedColorPalettes,
        colorsConfig,
        availablePalettes: palettes,
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
        tooltipConfig,
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
        features,
    };

    return (prepare as PrepareFunction)(prepareFunctionArgs);
}

type V1ServerResponse = any;

export const buildGraphPrivate = (args: {
    shared: Shared | ServerChartsConfig;
    ChartEditor: IChartEditor;
    data: any;
    palettes: Record<string, Palette>;
    features: FeatureConfig;
}) => {
    const {shared: chartSharedConfig, ChartEditor, data, palettes, features} = args;

    log('LOADED DATA:');
    log(data);

    const shared = mapChartsConfigToServerConfig(chartSharedConfig);

    const {colorPalettes: loadedColorPalettes, loadedData} = extractColorPalettesFromData(data);

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
                palettes,
                features,
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
            palettes,
            features,
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
