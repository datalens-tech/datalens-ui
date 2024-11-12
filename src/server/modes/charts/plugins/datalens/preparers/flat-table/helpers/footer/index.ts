import type {BarTableCell, ServerField, TableCommonCell} from '../../../../../../../../../shared';
import {isDateField, isMarkupField, isStringField} from '../../../../../../../../../shared';
import {TABLE_TOTALS_STYLES} from '../../../../../constants/misc';
import {
    findIndexInOrder,
    getTimezoneOffsettedTime,
    isNumericalDataType,
    isTableBarsSettingsEnabled,
} from '../../../../utils/misc-helpers';
import {getBarSettingsValue} from '../../../helpers/barsSettings';

import type {GetFooterArgs, GetFooterCellWithStylesArgs, PrepareFooterValueArgs} from './types';

export const getTotalTitle = (
    value: string | number | undefined,
    i18n: (label: string, params?: Record<string, string | number>) => string,
) => {
    return value ? i18n('label_total-value', {value}) : i18n('label_total');
};

export const prepareFooterValue = (
    args: PrepareFooterValueArgs,
): {column: ServerField; value: string | number} => {
    const {column, params} = args;

    const {idToTitle, totals, order, columnIndex, idToDataType, i18n} = params;

    const columnTitle = idToTitle[column.guid];
    const index = findIndexInOrder(order, column, columnTitle);
    const total = totals[index];
    const itemDataType = idToDataType[column.guid] || column.data_type;

    let value: number | string | undefined;

    if (total === null || total === '' || typeof total === 'undefined') {
        value = '';
    } else if (isMarkupField({data_type: itemDataType})) {
        value = total;
    } else if (isNumericalDataType(itemDataType)) {
        value = Number(total);
    } else if (isDateField({data_type: itemDataType})) {
        const date = new Date(total);
        value = getTimezoneOffsettedTime(date);
    } else if (isStringField({data_type: itemDataType})) {
        value = total;
    }

    if (columnIndex === 0) {
        value = getTotalTitle(value, i18n);
    }

    if (typeof value === 'undefined') {
        value = '';
    }

    return {value, column};
};

export const getFooterCellWithStyles = (args: GetFooterCellWithStylesArgs) => {
    const {column, value, columnValuesByColumn, colorsConfig} = args;

    const cell: TableCommonCell | BarTableCell = {
        value,
        css: TABLE_TOTALS_STYLES,
    };
    if (isTableBarsSettingsEnabled(column)) {
        const columnValues = columnValuesByColumn[column.guid];

        const barCellProperties = getBarSettingsValue({
            rowValue: String(value),
            field: column,
            columnValues,
            isTotalCell: true,
            loadedColorPalettes: colorsConfig.loadedColorPalettes,
        });

        cell.value = barCellProperties.value;
        cell.formattedValue = barCellProperties.formattedValue;
        (cell as BarTableCell).barColor = barCellProperties.barColor;
        (cell as BarTableCell).showBar = Boolean(column.barsSettings.showBarsInTotals);
    }

    return cell;
};

export const getFooter = (args: GetFooterArgs) => {
    const {
        columns,
        idToTitle,
        order,
        totals,
        ChartEditor,
        idToDataType,
        columnValuesByColumn,
        colorsConfig,
    } = args;

    const i18n = (key: string, params?: Record<string, string | number>) =>
        ChartEditor.getTranslation('wizard.prepares', key, params);

    const valuesWithColumns = columns.map((column, columnIndex) => {
        return prepareFooterValue({
            column,
            params: {columnIndex, totals, order, idToTitle, idToDataType, i18n},
        });
    });

    const cells = valuesWithColumns.map(({value, column}) => {
        return getFooterCellWithStyles({column, value, columnValuesByColumn, colorsConfig});
    });

    return [
        {
            cells,
        },
    ];
};
