import {
    DATASET_FIELD_TYPES,
    DatasetFieldType,
    Field,
    IChartEditor,
    QLEntryDataShared,
    ServerChartsConfig,
    ServerVisualization,
    VISUALIZATION_IDS,
    isYAGRVisualization,
} from '../../../../../shared';
import prepareSingleResult from '../datalens/js/helpers/misc/prepare-single-result';
import {getFieldList} from '../helpers/misc';

import prepareLine from './preparers/line';
import prepareLineTime from './preparers/line-time';
import prepareMetric from './preparers/metric';
import preparePie from './preparers/pie';
import preparePreviewTable from './preparers/preview-table';
import prepareTable from './preparers/table';
import {LINEAR_VISUALIZATIONS, PIE_VISUALIZATIONS} from './utils/constants';
import {getColumnsAndRows, log} from './utils/misc-helpers';
import {
    mapVisualizationPlaceholdersItems,
    migrateOrAutofillVisualization,
} from './utils/visualization-utils';

// eslint-disable-next-line complexity
export default ({shared, ChartEditor}: {shared: QLEntryDataShared; ChartEditor: IChartEditor}) => {
    const data = ChartEditor.getLoadedData();

    log('LOADED DATA:', data);

    let tablePreviewData;
    let prepare;
    let result;

    const {columns, rows} = getColumnsAndRows({
        chartType: shared.chartType,
        ChartEditor,
        queries: shared.queries,
        connectionType: shared.connection.type,
        data,
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

    const sharedVisualization = shared.visualization as ServerVisualization;
    const {colors: sharedColors, order: sharedOrder} = shared;

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

        // Converting dashsql columns to wizard fields
        const fields = columns.map((column, i) => {
            const guessedType = (column.biType ||
                DATASET_FIELD_TYPES.STRING) as DATASET_FIELD_TYPES;

            return {
                guid: `${column.name}-${i}`,
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
                    distincts[j].add(value);
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

        let newColors: Field[] = sharedColors || [];
        let newVisualization: ServerVisualization = sharedVisualization;

        const visualizationIsEmpty = sharedVisualization.placeholders.every(
            (placeholder) => placeholder.items.length === 0,
        );

        if (visualizationIsEmpty) {
            // Visualization is empty, so we need to autofill it
            const {colors, visualization} = migrateOrAutofillVisualization({
                fields,
                order: sharedOrder,
                visualization: sharedVisualization,
                colors: sharedColors,
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
        }

        const available = [...(fields as unknown as Field[])];

        const prepareSingleResultArgs = {
            resultData,
            shared: {
                ...shared,
                available,
                colors: newColors,
                sort: [],
                sharedData: {},
            } as unknown as ServerChartsConfig,
            visualization: newVisualization,
            idToTitle,
            idToDataType,
            ChartEditor,
            datasetsIds,
            loadedColorPalettes: {},
        };

        result = prepareSingleResult(prepareSingleResultArgs);

        if (shared.preview) {
            result.tablePreviewData = preparePreviewTable({shared, columns, rows, ChartEditor});
        }

        if (Array.isArray(result) && result[0]) {
            result[0].metadata = {
                visualization: newVisualization,
                available,
                colors: newColors,
                distincts: resultDistincts,
            };
        } else {
            result.metadata = {
                visualization: newVisualization,
                available,
                colors: newColors,
                distincts: resultDistincts,
            };
        }

        ChartEditor.setExtra('datasets', [
            {
                id: datasetId,
                fieldsList: getFieldList(fields, newVisualization.placeholders),
            },
        ]);

        log('RESULT:', result);

        return result;
    } else if (isYAGRVisualization(shared.chartType)) {
        // Branch for older ql charts of promql type
        // Deprecated
        // Works only for old-saved charts from dashboards

        if (shared.preview) {
            tablePreviewData = preparePreviewTable({shared, columns, rows, ChartEditor});
        }

        const {id} = shared.visualization;
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

        if (shared.preview) {
            tablePreviewData = preparePreviewTable({shared, columns, rows, ChartEditor});
        }

        const {id} = shared.visualization;

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
        result = prepare({shared, columns, rows, ChartEditor, tablePreviewData});
    }

    log('RESULT:', result);

    return result;
};
