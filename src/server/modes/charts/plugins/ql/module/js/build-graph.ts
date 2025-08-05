import type {
    FeatureConfig,
    Field,
    IChartEditor,
    Palette,
    QlConfig,
    ServerChartsConfig,
    ServerVisualization,
} from '../../../../../../../shared';
import {
    AxisMode,
    DATASET_FIELD_TYPES,
    DatasetFieldType,
    Feature,
    PlaceholderId,
    VISUALIZATION_IDS,
    isMonitoringOrPrometheusChart,
} from '../../../../../../../shared';
import {isChartSupportMultipleColors} from '../../../../../../../shared/modules/colors/common-helpers';
import {mapQlConfigToLatestVersion} from '../../../../../../../shared/modules/config/ql';
import prepareSingleResult from '../../../datalens/js/helpers/misc/prepare-single-result';
import type {ChartPlugin} from '../../../datalens/types';
import {extractColorPalettesFromData} from '../../../helpers/color-palettes';
import {getFieldList} from '../../../helpers/misc';
import type {QLConnectionTypeMap} from '../../utils/connection';
import {
    doesQueryContainOrderBy,
    getColumnsAndRows,
    log,
    visualizationCanHaveContinuousAxis,
} from '../../utils/misc-helpers';

import prepareLine from './../../preparers/line';
import prepareLineTime from './../../preparers/line-time';
import prepareMetric from './../../preparers/metric';
import preparePie from './../../preparers/pie';
import preparePreviewTable from './../../preparers/preview-table';
import prepareTable from './../../preparers/table';
import {LINEAR_VISUALIZATIONS, PIE_VISUALIZATIONS} from './../../utils/constants';
import {
    mapItems,
    mapVisualizationPlaceholdersItems,
    migrateOrAutofillVisualization,
} from './../../utils/visualization-utils';

type BuildGraphArgs = {
    shared: QlConfig;
    ChartEditor: IChartEditor;
    features: FeatureConfig;
    palettes: Record<string, Palette>;
    qlConnectionTypeMap: QLConnectionTypeMap;
    plugin?: ChartPlugin;
};

// eslint-disable-next-line complexity
export function buildGraph(args: BuildGraphArgs) {
    const {shared, ChartEditor, features, palettes, qlConnectionTypeMap, plugin} = args;
    const data = ChartEditor.getLoadedData();

    log('LOADED DATA:', data);

    let tablePreviewData;
    let prepare;
    let result;

    const config = mapQlConfigToLatestVersion(shared, {i18n: ChartEditor.getTranslation});
    const {colorPalettes: loadedColorPalettes, loadedData} = extractColorPalettesFromData(data);

    const {columns, rows} = getColumnsAndRows({
        chartType: config.chartType,
        ChartEditor,
        queries: config.queries,
        connectionType: config.connection.type,
        data: loadedData,
        qlConnectionTypeMap,
    });

    if (
        typeof columns === 'undefined' ||
        columns.length === 0 ||
        typeof rows === 'undefined' ||
        rows.length === 0
    ) {
        return {};
    }

    log('RECOGNIZED COLUMNS:', columns);
    log('RECOGNIZED ROWS:', rows);

    const sharedVisualization = config.visualization as ServerVisualization;
    const {
        colors: sharedColors,
        labels: sharedLabels,
        shapes: sharedShapes,
        order: sharedOrder,
    } = config;

    if (sharedVisualization?.placeholders) {
        // Branch for actual ql charts

        const order: {
            datasetId: string;
            title: string;
        }[] = [];

        const resultData = {
            data: rows,
            order,
            totals: [],
        };

        const datasetId = 'ql-mocked-dataset';

        const orderedColumns = [...columns].sort((columnA, columnB) => {
            return columnA.name > columnB.name ? 1 : -1;
        });

        const columnNames = new Set();

        // Converting dashsql columns to wizard fields
        const fields = columns.map((column) => {
            const guessedType = (column.biType ||
                DATASET_FIELD_TYPES.STRING) as DATASET_FIELD_TYPES;

            let fieldGuid;

            if (columnNames.has(column.name)) {
                const orderedIndex = orderedColumns.findIndex(
                    (orderedColumn) => orderedColumn.name === column.name,
                );

                fieldGuid = `${column.name}-${orderedIndex}`;
            } else {
                columnNames.add(column.name);

                fieldGuid = column.name;
            }

            return {
                guid: fieldGuid,
                title: column.name,
                datasetId,
                data_type: guessedType,
                cast: guessedType,
                type: DatasetFieldType.Dimension,
                calc_mode: 'direct',

                inspectHidden: true,
                formulaHidden: true,
                noEdit: true,
            };
        }) as unknown as Field[];

        // Adding pseudo column named "Column names"
        if (
            fields.length > 1 &&
            fields.findIndex(({type}) => type === DatasetFieldType.Pseudo) === -1
        ) {
            fields.push({
                title: 'Column Names',
                type: DatasetFieldType.Pseudo,
                data_type: DATASET_FIELD_TYPES.STRING,

                inspectHidden: true,
                formulaHidden: true,
                noEdit: true,
                guid: '',
                datasetId: '',
                cast: DATASET_FIELD_TYPES.STRING,
                calc_mode: 'direct',
            } as unknown as Field);
        }

        const distincts: Set<string>[] = [];

        // Generating distincts from data
        rows.forEach((row) => {
            row.forEach((value, j) => {
                if (!distincts[j]) {
                    distincts[j] = new Set();
                }

                if (!distincts[j].has(value)) {
                    distincts[j].add(String(value));
                }
            });
        });

        const resultDistincts: Record<string, string[]> = {};

        fields.forEach((column, i) => {
            if (distincts[i]) {
                resultDistincts[column.guid] = Array.from(distincts[i]).sort();
            }
        });

        const idToTitle: Record<string, string> = {};
        const idToDataType: Record<string, DATASET_FIELD_TYPES> = {};
        const datasetsIds: string[] = [];

        fields.forEach((column) => {
            idToTitle[column.guid] = column.title;
            idToDataType[column.guid] = column.data_type;
            order.push({
                datasetId,
                title: column.title,
            });
        });

        let newColors = sharedColors;
        let newLabels = sharedLabels;
        let newShapes = sharedShapes;
        let newVisualization: ServerVisualization = sharedVisualization;

        const visualizationIsEmpty = sharedVisualization.placeholders.every(
            (placeholder) => placeholder.items.length === 0,
        );

        if (visualizationIsEmpty) {
            const isMultipleDistinctsAvailable =
                features[Feature.MultipleColorsInVisualization] &&
                isChartSupportMultipleColors(config.chartType, sharedVisualization.id);
            // Visualization is empty, so we need to autofill it
            const {colors, visualization} = migrateOrAutofillVisualization({
                visualization: sharedVisualization,
                fields,
                rows,
                order: sharedOrder,
                colors: sharedColors,
                distinctsMap: isMultipleDistinctsAvailable ? resultDistincts : undefined,
            });

            if (colors) {
                newColors = colors;
            }

            if (visualization) {
                newVisualization = visualization;
            }
        } else {
            newVisualization = mapVisualizationPlaceholdersItems({
                visualization: sharedVisualization,
                fields,
            });

            newColors = mapItems({
                fields,
                items: sharedColors,
            });

            newLabels = mapItems({
                fields,
                items: sharedLabels,
            });

            newShapes = mapItems({
                fields,
                items: sharedShapes,
            });
        }

        const available = [...(fields as unknown as Field[])];

        const disableDefaultSorting = doesQueryContainOrderBy(shared.queryValue);

        const prepareSingleResultArgs = {
            resultData,
            shared: {
                ...config,
                available,
                colors: newColors,
                labels: newLabels,
                shapes: newShapes,
                sort: [],
                sharedData: {},
            } as unknown as ServerChartsConfig,
            visualization: newVisualization,
            idToTitle,
            idToDataType,
            ChartEditor,
            datasetsIds,
            loadedColorPalettes,
            disableDefaultSorting,
            palettes,
            features,
            plugin,
        };

        result = prepareSingleResult(prepareSingleResultArgs);

        if (config.preview) {
            result.tablePreviewData = preparePreviewTable({
                shared: config,
                columns,
                rows,
                ChartEditor,
            });
        }

        if (visualizationCanHaveContinuousAxis(newVisualization)) {
            const targetPlaceholderId = [
                VISUALIZATION_IDS.BAR,
                VISUALIZATION_IDS.BAR_100P,
            ].includes(newVisualization.id)
                ? PlaceholderId.Y
                : PlaceholderId.X;

            const targetPlaceholder = newVisualization.placeholders.find(
                ({id}) => id === targetPlaceholderId,
            );

            if (targetPlaceholder && targetPlaceholder.items[0]) {
                if (disableDefaultSorting) {
                    targetPlaceholder.settings = {
                        axisModeMap: {
                            [targetPlaceholder.items[0].guid]: AxisMode.Discrete,
                        },
                        disableAxisMode: true,
                    };
                } else {
                    targetPlaceholder.settings = {
                        disableAxisMode: false,
                    };
                }
            }
        }

        if (Array.isArray(result) && result[0]) {
            result[0].metadata = {
                visualization: newVisualization,
                available,
                colors: newColors,
                labels: newLabels,
                shapes: newShapes,
                distincts: resultDistincts,
            };
        } else {
            result.metadata = {
                visualization: newVisualization,
                available,
                colors: newColors,
                labels: newLabels,
                shapes: newShapes,
                distincts: resultDistincts,
            };

            if (result.graphs) {
                const pointConflict = result.graphs.some((graph: any) => graph.pointConflict);

                if (pointConflict) {
                    result.metadata.pointConflict = pointConflict;
                }
            }
        }

        ChartEditor.setExtra('datasets', [
            {
                id: datasetId,
                fieldsList: getFieldList(fields, newVisualization.placeholders),
            },
        ]);

        log('RESULT:', result);

        return result;
    } else if (isMonitoringOrPrometheusChart(config.chartType)) {
        // Branch for older ql charts of promql type
        // Deprecated
        // Works only for old-saved charts from dashboards

        if (config.preview) {
            tablePreviewData = preparePreviewTable({shared: config, columns, rows, ChartEditor});
        }

        const {id} = config.visualization;
        if (LINEAR_VISUALIZATIONS.has(id)) {
            prepare = prepareLineTime;
        } else if (PIE_VISUALIZATIONS.has(id)) {
            prepare = preparePie;
        } else if (id === VISUALIZATION_IDS.METRIC) {
            prepare = prepareMetric;
        } else if (id === VISUALIZATION_IDS.TABLE) {
            prepare = prepareTable;
        }
    } else {
        // Branch for older ql charts of sql type
        // Deprecated
        // Works only for old-saved charts from dashboards

        if (config.preview) {
            tablePreviewData = preparePreviewTable({shared: config, columns, rows, ChartEditor});
        }

        const {id} = config.visualization;

        let rowsLimit;

        switch (id) {
            case VISUALIZATION_IDS.LINE:
            case VISUALIZATION_IDS.AREA:
            case VISUALIZATION_IDS.AREA_100P:
            case VISUALIZATION_IDS.COLUMN:
            case VISUALIZATION_IDS.COLUMN_100P:
            case VISUALIZATION_IDS.BAR:
            case VISUALIZATION_IDS.BAR_100P:
                prepare = prepareLine;
                rowsLimit = 75000;
                break;

            case VISUALIZATION_IDS.PIE:
            case VISUALIZATION_IDS.DONUT:
                prepare = preparePie;
                rowsLimit = 1000;
                break;

            case VISUALIZATION_IDS.METRIC:
                prepare = prepareMetric;
                rowsLimit = 1000;
                break;

            case VISUALIZATION_IDS.TABLE:
                prepare = prepareTable;
                rowsLimit = 100000;
                break;

            default:
                return {};
        }

        if (rows.length > rowsLimit) {
            ChartEditor._setError({
                code: 'ERR.CHARTS.ROWS_NUMBER_OVERSIZE',
                details: {
                    rowsLength: rows.length,
                    rowsLimit: rowsLimit,
                },
            });

            return {};
        }
    }

    if (prepare) {
        result = prepare({shared: config, columns, rows, ChartEditor, tablePreviewData});
    }

    log('RESULT:', result);

    return result;
}
