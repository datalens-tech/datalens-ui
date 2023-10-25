import isEmpty from 'lodash/isEmpty';
import moment from 'moment';

import {
    CommonNumberFormattingOptions,
    DATASET_FIELD_TYPES,
    MINIMUM_FRACTION_DIGITS,
    ServerColor,
    ServerField,
    ServerPlaceholder,
    ServerPointSizeConfig,
    SortParams,
    StringParams,
    formatNumber as chartKitFormatNumber,
    isDateField,
} from '../../../../../../shared';
import {ChartKitFormatSettings, ResultDataOrder} from '../preparers/types';
import {
    ServerFieldWithBackgroundSettings,
    ServerFieldWithBarsSettings,
    ServerFieldWithColumnWidthSettings,
} from '../types';

import {
    DEFAULT_DATETIME_FORMAT,
    DEFAULT_DATE_FORMAT,
    DEFAULT_MAX_POINT_RADIUS,
    DEFAULT_MIN_POINT_RADIUS,
    LOG_INFO,
    LOG_TIMING,
    SORT_ORDER,
} from './constants';

let currentConsole: {log: Function} = console;

function setConsole(newConsole: {log: Function}) {
    currentConsole = newConsole;
}

function log(...data: unknown[]) {
    return LOG_INFO && currentConsole.log(...data);
}

function logTiming(...data: unknown[]) {
    return LOG_TIMING && currentConsole.log(...data);
}

const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
const numericCollator = (a: number, b: number) => (a > b ? 1 : -1);
const numericStringCollator = (a: string, b: string) => {
    return Number(a) > Number(b) ? 1 : -1;
};

function isNumericalDataType(dataType: string) {
    return (
        dataType === DATASET_FIELD_TYPES.FLOAT ||
        dataType === DATASET_FIELD_TYPES.INTEGER ||
        dataType === DATASET_FIELD_TYPES.UINTEGER
    );
}

function isFloatDataType(dataType: string) {
    return dataType === DATASET_FIELD_TYPES.FLOAT;
}

function getTimezoneOffsettedTime(value: Date) {
    return value.getTime() - value.getTimezoneOffset() * 60 * 1000;
}

export function getDefaultDateFormat(valueType?: string | null) {
    return valueType === 'datetime' || valueType === 'genericdatetime'
        ? DEFAULT_DATETIME_FORMAT
        : DEFAULT_DATE_FORMAT;
}

function formatDate({
    valueType,
    value,
    format,
    utc = false,
}: {
    valueType?: string | null;
    value: string | number | Date | null;
    format?: string;
    utc?: boolean;
}) {
    const createDate = utc ? moment.utc : moment;

    if (format) {
        return createDate(value).format(format.replace('hh', 'HH'));
    }

    return createDate(value).format(getDefaultDateFormat(valueType));
}

function formatNumber(value: number, minimumFractionDigits = MINIMUM_FRACTION_DIGITS) {
    const numberFormat = new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits,
        maximumFractionDigits: minimumFractionDigits,
    });

    return numberFormat.format(value);
}

// This function is needed in order to format numbers in the Russian locale
// since the environment in which this script works only knows about the EN locale
// TODO: ^ so it needs to be done at the front, not here
function customFormatNumber({
    value,
    minimumFractionDigits,
    locale = 'ru-RU',
}: {
    value: number;
    minimumFractionDigits: number;
    locale: string;
}) {
    switch (locale) {
        case 'ru-RU':
        default: {
            const formattedValue = formatNumber(value, minimumFractionDigits);

            return formattedValue.replace(/,/g, ' ').replace(/\./g, ',');
        }
    }
}

const chartKitFormatNumberWrapper: typeof chartKitFormatNumber = (value, options) => {
    return chartKitFormatNumber(value, options);
};

function getTitleInOrder(order: ResultDataOrder, index: number, coordinates: ServerField[]) {
    const orderItem = order[index];

    if (Array.isArray(orderItem)) {
        const orderItemIndex = orderItem.findIndex((orderItem) => {
            return coordinates.find(
                (field) =>
                    (field.fakeTitle === orderItem.title || field.title === orderItem.title) &&
                    orderItem.datasetId === field.datasetId,
            );
        });

        return orderItem[orderItemIndex === -1 ? 0 : orderItemIndex].title;
    }

    return orderItem.title;
}

function findIndexInOrder(order: ResultDataOrder, field: {datasetId: string}, title: string) {
    return order.findIndex((entry) => {
        if (Array.isArray(entry)) {
            const neededEntry = entry.find(
                (entryEntry) => entryEntry.datasetId === field.datasetId,
            );

            return neededEntry ? neededEntry.title === title : false;
        } else {
            return entry.title === title && entry.datasetId === field.datasetId;
        }
    });
}

function getAllPlaceholderItems(placeholders: ServerPlaceholder[]) {
    let items: ServerPlaceholder['items'] = [];

    placeholders.forEach((placeholder) => {
        items = [...items, ...placeholder.items];
    });

    return items;
}

export function getSortedColumnId(value: SortParams['columnId'], isPivotTable?: boolean) {
    if (!value) {
        return undefined;
    }

    // eslint-disable-next-line security/detect-unsafe-regex
    const columnId = value.match(/(?<=_id=)(.*?)(?=_name=)/)?.[0];

    if (isPivotTable && columnId) {
        // eslint-disable-next-line security/detect-unsafe-regex
        return columnId.match(/(?<=fieldId=)(.*?)(?=__index)/)?.[0];
    }

    return columnId;
}

function getSortOrder(value: SortParams['order']) {
    if (!value) {
        return undefined;
    }

    return value === SORT_ORDER.ASCENDING.NUM
        ? SORT_ORDER.ASCENDING.STR
        : SORT_ORDER.DESCENDING.STR;
}

function getSortData(params: SortParams, isPivotTable?: boolean) {
    const columnId = getSortedColumnId(params.columnId, isPivotTable);
    const order = getSortOrder(params.order);

    return {columnId, order};
}

function getDrillDownLevel(params: StringParams) {
    return Number((params.drillDownLevel || ['0'])[0]);
}

function getDrillDownFilters(params: StringParams): string[] | undefined {
    let filters = params.drillDownFilters;

    if (!Array.isArray(filters)) {
        return;
    }

    filters = filters.map(String);

    if (filters.some(Boolean)) {
        return filters;
    }

    return;
}

function getDrillDownData(params: StringParams) {
    return {
        drillDownLevel: getDrillDownLevel(params),
        drillDownFilters: getDrillDownFilters(params),
    };
}

function getPointRadius({
    current,
    min,
    max,
    geopointsConfig,
}: {
    current: number;
    min: number;
    max: number;
    geopointsConfig: ServerPointSizeConfig;
}) {
    const minRadius = geopointsConfig.minRadius || DEFAULT_MIN_POINT_RADIUS;
    const maxRadius = geopointsConfig.maxRadius || DEFAULT_MAX_POINT_RADIUS;
    const coeff = (maxRadius - minRadius) / (max - min || 1);
    return minRadius + (current - min) * (Number.isNaN(coeff) ? 0 : coeff);
}

function isNeedToCalcClosestPointManually(
    visualizationId: string,
    placeholders: ServerPlaceholder[] | undefined,
    colors: ServerColor[],
) {
    let placeholderId: string | undefined;

    switch (visualizationId) {
        case 'column':
            placeholderId = 'x';
            break;
        case 'bar':
            placeholderId = 'y';
            break;
    }

    if (!placeholderId) {
        return false;
    }
    const placeholderItem = placeholders?.find((pl) => pl.id === placeholderId)?.items?.[0];

    if (!placeholderItem) {
        return false;
    }

    const colorItem = colors?.[0];

    return Boolean(colorItem && isDateField(placeholderItem));
}

function getOriginalTitleOrTitle(field: {title: string; originalTitle?: string}) {
    return field.originalTitle || field.title;
}

function getFieldTitle(field: ServerField | undefined): string {
    if (!field) {
        return '';
    }

    return field.fakeTitle || field.originalTitle || field.title;
}

function isTableBarsSettingsEnabled(field: ServerField): field is ServerFieldWithBarsSettings {
    return Boolean(field.barsSettings?.enabled);
}

function isTableFieldBackgroundSettingsEnabled(
    field: ServerField | undefined,
): field is ServerFieldWithBackgroundSettings {
    return Boolean(field && field.backgroundSettings?.enabled);
}

function isColumnSettingsWidthEnabled(
    field: ServerField,
): field is ServerFieldWithColumnWidthSettings {
    return Boolean(field.columnSettings?.width);
}

function getFormatOptionsFromFieldFormatting(
    formatting: CommonNumberFormattingOptions | undefined,
    dataType: string,
): ChartKitFormatSettings {
    let chartKitPrecision = 0;
    if (dataType === 'float') {
        chartKitPrecision =
            typeof formatting?.precision === 'number'
                ? formatting.precision
                : MINIMUM_FRACTION_DIGITS;
    }

    return typeof formatting === 'undefined' || isEmpty(formatting)
        ? {
              chartKitFormatting: true,
              chartKitPrecision,
          }
        : {
              chartKitFormatting: true,
              chartKitPrecision,
              chartKitPrefix: formatting.prefix,
              chartKitPostfix: formatting.postfix,
              chartKitUnit: formatting.unit,
              chartKitFormat: formatting.format,
              chartKitLabelMode: formatting.labelMode,
              chartKitShowRankDelimiter: formatting.showRankDelimiter,
          };
}

export {
    setConsole,
    log,
    logTiming,
    collator,
    numericCollator,
    isNumericalDataType,
    isFloatDataType,
    getTimezoneOffsettedTime,
    formatDate,
    formatNumber,
    customFormatNumber,
    findIndexInOrder,
    chartKitFormatNumberWrapper,
    getAllPlaceholderItems,
    getSortData,
    getDrillDownData,
    getPointRadius,
    isNeedToCalcClosestPointManually,
    getTitleInOrder,
    getOriginalTitleOrTitle,
    isTableBarsSettingsEnabled,
    numericStringCollator,
    getFormatOptionsFromFieldFormatting,
    isTableFieldBackgroundSettingsEnabled,
    isColumnSettingsWidthEnabled,
    getSortOrder,
    getFieldTitle,
};
