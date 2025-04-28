import {ZoomMode, isDateField} from '../../../../../../shared';
import {GEO_MAP_LAYERS_LEVEL} from '../utils/constants';
import {
    colorizeGeoByGradient,
    colorizeGeoByPalette,
    getLayerAlpha,
    getMapBounds,
    getMapState,
} from '../utils/geo-helpers';
import {findIndexInOrder, formatDate, isGradientMode} from '../utils/misc-helpers';

import type {PrepareFunctionArgs, PrepareFunctionDataRow, ResultDataOrder} from './types';

type YMapItemConfig = {
    feature: {
        geometry: {
            type: string;
            coordinates: string[] | string[][];
            radius?: number;
        };
        properties?: {
            radius?: number;
            value?: string;
            data?: {
                color?: string;
                text?: string;
            }[];
        };
    };
    options?: {
        geoObjectId?: string;
        strokeWidth?: number;
        opacity?: number | string;
        fillColor?: string;
        strokeColor?: string;
        iconColor?: string;
        preset?: string;
        zIndex?: number;
    };
};

const DEFAULT_GROUP = 'DEFAULT_GROUP';

type FieldData = {
    title: string;
    value: string | null;
};

type CoordsData = {
    title: string;
    value: string[];
};

type MappedRowData = {
    coords: CoordsData;
    measures: FieldData[];
    sort?: FieldData;
    color?: FieldData;
};

const getFieldData = (
    fields: {
        title: string;
        guid: string;
        datasetId: string;
    }[],
    dataRow: PrepareFunctionDataRow,
    order: ResultDataOrder,
    idToTitle: Record<string, string>,
): FieldData[] => {
    return fields.reduce((acc: FieldData[], measureField) => {
        const labelTitle = measureField.title || idToTitle[measureField.guid];
        const index = findIndexInOrder(order, measureField, labelTitle);

        if (index !== -1) {
            acc.push({
                title: labelTitle,
                value: dataRow[index],
            });
        }

        return acc;
    }, []);
};

const preparePolyline = (options: PrepareFunctionArgs) => {
    const {shared, ChartEditor} = options;
    const i18n = (key: string, params?: Record<string, string | string[]>) =>
        ChartEditor.getTranslation('wizard.prepares', key, params);

    const {idToDataType} = options;

    const {data, order} = options.resultData;
    const [color] = options.colors;
    const colorsConfig = options.colorsConfig;
    const colorFieldDataType = color ? idToDataType[color.guid] : null;

    const gradientMode =
        color &&
        colorFieldDataType &&
        isGradientMode({colorField: color, colorFieldDataType, colorsConfig});

    const ALPHA = getLayerAlpha(options.layerSettings || {});
    let leftBot: undefined | [number, number];
    let rightTop: undefined | [number, number];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const groupingFields = options.placeholders.find(
        (placeholder) => placeholder.id === 'grouping',
    )!.items;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const measures = options.placeholders.find(
        (placeholder) => placeholder.id === 'measures',
    )!.items;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const polylinePlaceholder = options.placeholders.find(
        (placeholder) => placeholder.id === 'polyline',
    )!;
    const [polylineField] = polylinePlaceholder.items;

    const sort = options.sort;
    const [sortField] = sort;

    const showPoints =
        (polylinePlaceholder.settings as Record<string, any>).polylinePoints === 'on';

    const groups = data.reduce(
        (acc: Record<string, PrepareFunctionDataRow[]>, dataRow: PrepareFunctionDataRow) => {
            const point = JSON.parse(dataRow[0] as string);
            if (point === null) {
                return acc;
            }

            const groupingObjects = getFieldData(groupingFields, dataRow, order, options.idToTitle);
            [leftBot, rightTop] = getMapBounds({
                leftBot,
                rightTop,
                current: point,
            });

            const group = groupingObjects.map((item) => `${item.title}: ${item.value}`).join(', ');

            if (!acc[group || DEFAULT_GROUP]) {
                acc[group || DEFAULT_GROUP] = [];
            }

            acc[group || DEFAULT_GROUP].push(dataRow);

            return acc;
        },
        {},
    );

    const children: YMapItemConfig[] = [];

    let colorData: Record<string, {backgroundColor?: string}> | undefined;

    if (color) {
        // CHARTS-1961

        const hashTable = data.reduce(
            (acc: any, dataRow: PrepareFunctionDataRow, valuesIndex: number) => {
                const colorsObjects = getFieldData(
                    options.colors,
                    dataRow,
                    order,
                    options.idToTitle,
                );

                acc[`points-${valuesIndex}`] = colorsObjects.map((el) => {
                    return {
                        [String(el.value)]: el.value,
                    };
                });

                return acc;
            },
            {},
        );

        if (gradientMode) {
            colorData = colorizeGeoByGradient(hashTable, colorsConfig).colorData;
        } else {
            colorData = colorizeGeoByPalette(hashTable, colorsConfig, color?.guid).colorData;
        }
    }

    const mapOptions: Record<string, any> = {
        opacity: ALPHA,
    };

    if (options.layerSettings.id) {
        mapOptions.geoObjectId = options.layerSettings.id;
    }

    Object.entries(groups).forEach(([groupName, groupDataRows]) => {
        const mappedRowData = groupDataRows.reduce(
            (acc: MappedRowData[], row: PrepareFunctionDataRow) => {
                const coords = getFieldData([polylineField], row, order, options.idToTitle)[0];
                let sortData;
                if (sortField) {
                    sortData = getFieldData(sort, row, order, options.idToTitle)[0];

                    if (isDateField(sortField)) {
                        sortData.value = formatDate({
                            valueType: sortField.data_type,
                            value: sortData.value,
                            format: sortField.format,
                        });
                    }
                }
                const colorsObjects = getFieldData(options.colors, row, order, options.idToTitle);

                acc.push({
                    coords: {
                        title: coords.title,
                        value: JSON.parse(String(coords.value)),
                    },
                    measures: getFieldData(measures, row, order, options.idToTitle),
                    sort: sortData,
                    color: colorsObjects[0],
                });

                return acc;
            },
            [],
        );

        for (let i = 1; i < mappedRowData.length; i++) {
            const prev = mappedRowData[i - 1];
            const current = mappedRowData[i];
            const color =
                colorData && prev.color && colorData[String(prev.color.value)].backgroundColor;

            const tooltipData = [];

            if (groupName !== DEFAULT_GROUP) {
                tooltipData.push({
                    text: i18n('label_line', {value: groupName}),
                });
            }

            tooltipData.push({
                text: i18n('label_segment', {
                    value: `${prev.coords.value} → ${current.coords.value}`,
                }),
            });

            if (prev.sort && current.sort) {
                tooltipData.push({
                    text: i18n('label_order', {
                        value: `${prev.sort.value} → ${current.sort.value}`,
                    }),
                });
            }

            if (color && prev.color) {
                tooltipData.push({
                    color,
                    text: i18n('label_color', {
                        value: `${prev.color.title}: ${prev.color.value}`,
                    }),
                });
            }

            tooltipData.push(
                ...prev.measures.map((measure, index) => {
                    const currentMeasure = current.measures[index];
                    return {
                        text: `${measure.title}: ${measure.value} → ${currentMeasure.value}`,
                    };
                }),
            );

            children.push({
                feature: {
                    geometry: {
                        type: 'LineString',
                        coordinates: [prev.coords.value, current.coords.value],
                    },
                    properties: {
                        data: tooltipData,
                    },
                },
                options: {
                    strokeWidth: 6,
                    strokeColor:
                        colorData &&
                        prev.color &&
                        colorData[String(prev.color.value)].backgroundColor,
                    zIndex: GEO_MAP_LAYERS_LEVEL.POLYLINE,
                },
            });
        }

        if (showPoints) {
            mappedRowData.forEach((item) => {
                const tooltipData = [];

                tooltipData.push({
                    text: i18n('label_point', {value: item.coords.value}),
                });

                if (groupName !== DEFAULT_GROUP) {
                    tooltipData.push({
                        text: i18n('label_line', {value: groupName}),
                    });
                }

                if (colorData && item.color) {
                    tooltipData.push({
                        color: colorData[String(item.color.value)].backgroundColor,
                        text: i18n('label_color', {
                            value: `${item.color.title}: ${item.color.value}`,
                        }),
                    });
                }

                tooltipData.push(
                    ...item.measures.map((item) => {
                        return {
                            text: `${item.title}: ${item.value}`,
                        };
                    }),
                );

                children.push({
                    feature: {
                        geometry: {
                            type: 'Point',
                            coordinates: item.coords.value,
                        },
                        properties: {
                            radius: 1.5,
                            data: tooltipData,
                        },
                    },
                    options: {
                        preset: 'chartkit#chips',
                        iconColor:
                            colorData &&
                            item.color &&
                            colorData[String(item.color.value)].backgroundColor,
                    },
                });
            });
        }
    });

    const shouldSetBounds =
        shared?.extraSettings?.zoomMode !== ZoomMode.Manual &&
        shared?.extraSettings?.mapCenterMode !== ZoomMode.Manual;
    const {zoom, center} = getMapState(shared, [leftBot, rightTop]);

    ChartEditor?.updateHighchartsConfig({state: {zoom, center}});

    return [
        {
            collection: {
                children,
            },
            options: mapOptions,
            bounds: shouldSetBounds ? [leftBot, rightTop] : undefined,
        },
    ];
};

export default preparePolyline;
