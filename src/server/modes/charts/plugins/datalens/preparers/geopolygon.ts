import {
    DATASET_FIELD_TYPES,
    MINIMUM_FRACTION_DIGITS,
    ServerFieldFormatting,
    ServerTooltip,
    VisualizationLayerShared,
} from '../../../../../../shared';
import {hexToRgb} from '../utils/color-helpers';
import {GEO_MAP_LAYERS_LEVEL} from '../utils/constants';
import {
    Coordinate,
    colorizeGeoByGradient,
    colorizeGeoByPalette,
    getFlattenCoordinates,
    getGradientMapOptions,
    getLayerAlpha,
    getMapBounds,
} from '../utils/geo-helpers';
import {
    chartKitFormatNumberWrapper,
    getTitleInOrder,
    isGradientMode,
    isNumericalDataType,
} from '../utils/misc-helpers';

import {PrepareFunctionArgs} from './types';

type GeopolygonConfig = {
    geometry: {
        type: 'Polygon';
        coordinates: Coordinate[][];
    };
    options: {
        strokeWidth?: number;
        iconColor?: string;
        strokeColor?: string;
        zIndex?: number;
        fillColor?: string;
        fillColorDefault?: string;
    };
    columnIndex?: number;
    feature?: string;

    type?: string;

    properties: {
        rawText?: boolean;
        colorIndex?: number | null;
        data?: {
            text: string;
            color?: string;
        }[];
    };
};

type GeopolygonMapOptions = {
    fillOpacity?: number;
    fillOpacityHover?: number;
    fillColorEmptyPolygon?: string;
    strokeColorHover?: string;
    strokeWidthHover?: number;
    radius?: number;
    dissipating?: boolean;
    opacity?: number;
    intensityOfMidpoint?: number;
    gradient?: Record<string, string>;
    showLegend?: boolean;
    showCustomLegend?: boolean;
    colorTitle?: string;
    geoObjectId?: string;
    layerTitle?: string;
    strokeWidth?: number;
    colorDictionary?: Record<string, string>;
    mode?: string;
};

type MeasureColorData = Record<
    string,
    {
        backgroundColor: string;
        color: string;
        value: number | null;
    }
>;

type DimensionColorData = Record<
    string,
    {
        backgroundColor?: string | undefined;
        colorIndex?: number | undefined;
    }
>;

type SomeColorData = MeasureColorData | DimensionColorData;

function prepareFormattedValue(args: {
    dataType: string | undefined;
    value: number | string | any;
    formatting: ServerFieldFormatting | undefined;
}) {
    const {dataType, formatting, value} = args;

    if (dataType && isNumericalDataType(dataType)) {
        return chartKitFormatNumberWrapper(Number(value), {
            lang: 'ru',
            ...(formatting ?? {
                precision: dataType === 'float' ? MINIMUM_FRACTION_DIGITS : 0,
            }),
        });
    }

    if (dataType === DATASET_FIELD_TYPES.MARKUP) {
        return `<a href="${value.url}" target="_blank">${value.content.content}</a>`;
    }

    return value;
}

// eslint-disable-next-line complexity
function prepareGeopolygon(options: PrepareFunctionArgs) {
    const DEFAULT_COLOR = 'rgb(77, 162, 241)';

    const {
        colors,
        colorsConfig,
        tooltips,
        placeholders,
        resultData: {data, order},
        idToTitle,
        shared,
        idToDataType,
    } = options;
    const layerSettings = (options.layerSettings ||
        {}) as VisualizationLayerShared['visualization']['layerSettings'];

    const allPolygons: Record<string, GeopolygonConfig[]> = {};
    const hashTable: Record<string, string[] | {[x: string]: string}[]> = {};

    const color = colors[0];
    const colorFieldDataType = color ? idToDataType[color.guid] : null;
    const coordinates = placeholders[0].items;

    const gradientMode =
        color &&
        colorFieldDataType &&
        isGradientMode({colorField: color, colorFieldDataType, colorsConfig});

    let colorizedResult:
        | ReturnType<typeof colorizeGeoByGradient>
        | ReturnType<typeof colorizeGeoByPalette>;

    let colorData = {},
        leftBot: Coordinate | undefined,
        rightTop: Coordinate | undefined;
    let colorDictionary: Record<string, string> = {};

    const getPolygonConfig = ({
        coordinates,
        colorData,
        columnIndex,
        key,
    }: {
        coordinates: Coordinate[][];
        colorData: SomeColorData;
        columnIndex: number;
        key: string;
    }): GeopolygonConfig => {
        const options: GeopolygonConfig['options'] = {};
        const properties: {colorIndex?: number | null; rawText?: boolean} = {};

        options.strokeColor = '#FFF';
        options.zIndex = GEO_MAP_LAYERS_LEVEL.POLYGON;

        if (colorData && colorData[key]) {
            if (gradientMode) {
                options.fillColor = colorData[key].backgroundColor;
                options.fillColorDefault = colorData[key].backgroundColor;

                properties.colorIndex = (colorData as MeasureColorData)[key].value;
            } else {
                const {r, g, b} = hexToRgb((colorData as MeasureColorData)[key].backgroundColor);
                options.fillColor = `rgb(${r}, ${g}, ${b})`;
                options.fillColorDefault = `rgb(${r}, ${g}, ${b})`;
                properties.colorIndex = (colorData as DimensionColorData)[key].colorIndex;
            }

            if (colorsConfig.polygonBorders === 'hide') {
                options.strokeWidth = 0;
            }

            options.iconColor = colorData[key] ? colorData[key].backgroundColor : DEFAULT_COLOR;
        }

        return {
            geometry: {
                type: 'Polygon',
                coordinates,
            },
            properties,
            options,
            columnIndex,
        };
    };

    const setPolygonTooltip = ({
        polygon,
        text,
        tooltipIndex,
    }: {
        polygon: GeopolygonConfig | undefined;
        text: string;
        tooltipIndex: number;
    }) => {
        if (!polygon) {
            return;
        }

        const tooltip = tooltips[tooltipIndex];
        const formattedText = prepareFormattedValue({
            dataType: tooltip.data_type,
            formatting: tooltip.formatting,
            value: text,
        });
        const tooltipText = `${tooltip.fakeTitle || tooltip.title}: ${formattedText}`;

        if (tooltip?.data_type === DATASET_FIELD_TYPES.MARKUP) {
            polygon.properties.rawText = true;
        }

        if (gradientMode) {
            if (!polygon.properties.data) {
                polygon.properties.data = [];
            }

            if (
                !polygon.properties.data.some((entry: {text: string}) => entry.text === tooltipText)
            ) {
                polygon.properties.data[tooltipIndex] = {
                    text: tooltipText,
                };
            }
        } else {
            if (!polygon.properties.data) {
                polygon.properties.data = [];
            }

            polygon.properties.data[tooltipIndex] = {
                text: tooltipText,
            };
        }
    };

    if (color) {
        data.forEach((values, valuesIndex) => {
            hashTable[`polygons-${valuesIndex}`] = [];

            values.forEach((columnData, columnIndex) => {
                if (columnData === 'null' || columnData === null) {
                    return;
                }

                const dataTitle = getTitleInOrder(order, columnIndex, coordinates);

                if (coordinates.findIndex(({title}) => title === dataTitle) !== -1) {
                    (hashTable[`polygons-${valuesIndex}`] as string[]).push(columnData);
                }

                if (color.title === dataTitle) {
                    hashTable[`polygons-${valuesIndex}`] = (
                        hashTable[`polygons-${valuesIndex}`] as string[]
                    ).map((_coord: string, coordIndex: number) => {
                        return {[`polygons-${valuesIndex}-${coordIndex}`]: columnData};
                    });
                }
            });
        });

        if (gradientMode) {
            colorizedResult = colorizeGeoByGradient(hashTable, colorsConfig);

            colorData = colorizedResult.colorData;
        } else {
            colorizedResult = colorizeGeoByPalette(hashTable, colorsConfig, color.guid);

            colorData = colorizedResult.colorData;
            colorDictionary = colorizedResult.colorDictionary;
        }
    }

    const getTooltipIndex = ({
        tooltips,
        dataTitle,
    }: {
        tooltips: ServerTooltip[];
        dataTitle: string;
    }) => {
        if (!tooltips || tooltips.length === 0) {
            return -1;
        }

        return tooltips.findIndex((tooltip) => tooltip.title === dataTitle);
    };

    data.forEach((values, valuesIndex) => {
        allPolygons[`polygons-${valuesIndex}`] = [];

        values.forEach((columnData, columnIndex) => {
            if (columnData === 'null' || columnData === null) {
                return;
            }

            const dataTitle = getTitleInOrder(order, columnIndex, coordinates);

            if (coordinates.findIndex(({title}) => title === dataTitle) !== -1) {
                const polygonCoordinates: Coordinate[][] = JSON.parse(columnData);
                const flattenCoordinates = getFlattenCoordinates(
                    polygonCoordinates,
                ) as Coordinate[];

                // we go through the points of the polygon and adjust the boundaries of the map
                flattenCoordinates.forEach((current: Coordinate) => {
                    [leftBot, rightTop] = getMapBounds({leftBot, rightTop, current});
                });

                allPolygons[`polygons-${valuesIndex}`].push(
                    getPolygonConfig({
                        colorData,
                        columnIndex,
                        coordinates: polygonCoordinates,
                        key: `polygons-${valuesIndex}-${columnIndex}`,
                    }),
                );
            }

            const tooltipIndex = getTooltipIndex({tooltips, dataTitle});
            const polygons = allPolygons[`polygons-${valuesIndex}`];
            if (tooltipIndex !== -1 && polygons && polygons.length) {
                polygons.forEach((polygon) => {
                    setPolygonTooltip({
                        polygon,
                        text: columnData,
                        tooltipIndex,
                    });
                });

                if (tooltipIndex === 0) {
                    polygons![0]!.properties!.data![0].color =
                        polygons[0].options.iconColor || DEFAULT_COLOR;
                }
            }
        });
    });

    const polygons = {
        type: 'FeatureCollection',
        features: getFlattenCoordinates(Object.values(allPolygons)).map((item) => {
            (item as GeopolygonConfig).type = 'Feature';

            return item;
        }),
    };

    const fillOpacity = getLayerAlpha(layerSettings);
    let fillOpacityHover = fillOpacity + 0.1;

    fillOpacityHover = fillOpacityHover > 1 ? 1 : fillOpacityHover;

    let mapOptions: GeopolygonMapOptions = {
        fillOpacity,
        fillOpacityHover,
        fillColorEmptyPolygon: DEFAULT_COLOR,
        strokeColorHover: '#FFF',
        strokeWidthHover: 2,
        showCustomLegend: true,
    };

    if (shared.extraSettings && shared.extraSettings.legendMode === 'hide') {
        mapOptions.showLegend = false;
        mapOptions.showCustomLegend = false;
    }

    if (layerSettings.id) {
        mapOptions.geoObjectId = layerSettings.id;
    }

    mapOptions.layerTitle =
        layerSettings.name ||
        options.ChartEditor.getTranslation('wizard.prepares', 'label_new-layer');

    if (colorsConfig.polygonBorders === 'hide') {
        mapOptions.strokeWidth = 0;
    }

    if (gradientMode) {
        const colorTitle = color.fakeTitle || idToTitle[color.guid] || color.title;

        mapOptions = {
            ...mapOptions,
            ...getGradientMapOptions(
                colorsConfig,
                colorTitle,
                colorizedResult! as ReturnType<typeof colorizeGeoByGradient>,
            ),
        };

        return [
            {
                polygonmap: {
                    polygons,
                },
                options: mapOptions,
                bounds: [leftBot, rightTop],
            },
        ];
    } else {
        if (color) {
            mapOptions = {
                ...mapOptions,
                colorDictionary,
                mode: 'dictionary',
                colorTitle: color.fakeTitle || idToTitle[color.guid] || color.title,
            };
        }

        return [
            {
                polygonmap: {
                    polygons,
                },
                options: mapOptions,
                bounds: [leftBot, rightTop],
            },
        ];
    }
}

export default prepareGeopolygon;
