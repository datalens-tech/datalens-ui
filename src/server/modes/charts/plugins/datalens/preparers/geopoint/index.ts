import escape from 'lodash/escape';

import {
    Feature,
    MINIMUM_FRACTION_DIGITS,
    PointSizeConfig,
    ServerFieldFormatting,
    VisualizationLayerShared,
    isEnabledServerFeature,
} from '../../../../../../../shared';
import {registry} from '../../../../../../registry';
import {getColorsByMeasureField, getThresholdValues} from '../../utils/color-helpers';
import {GEO_MAP_LAYERS_LEVEL, getMountedColor} from '../../utils/constants';
import {
    Coordinate,
    GradientOptions,
    getExtremeValues,
    getFlattenCoordinates,
    getGradientMapOptions,
    getLayerAlpha,
    getMapBounds,
} from '../../utils/geo-helpers';
import {
    chartKitFormatNumberWrapper,
    findIndexInOrder,
    getPointRadius,
    getTitleInOrder,
    isGradientMode,
    isNumericalDataType,
} from '../../utils/misc-helpers';
import {PrepareFunctionArgs} from '../types';

import {DEFAULT_ICON_COLOR, DEFAULT_POINT_RADIUS} from './constants';
import {GeopointMapOptions, GeopointPointConfig} from './types';

type GetPointConfigArgs = {
    stringifyedCoordinates: string;
    columnIndex: number;
    geopointsConfig: PointSizeConfig;
};

const getPointConfig = ({
    stringifyedCoordinates,
    columnIndex,
    geopointsConfig,
}: GetPointConfigArgs): GeopointPointConfig => {
    const coordinates = JSON.parse(stringifyedCoordinates);

    return {
        feature: {
            geometry: {
                type: 'Point',
                coordinates,
            },
            properties: {
                radius: geopointsConfig.radius || DEFAULT_POINT_RADIUS,
                rawText: true,
            },
        },
        options: {
            iconColor: DEFAULT_ICON_COLOR,
            preset: 'chartkit#chips',
            zIndex: GEO_MAP_LAYERS_LEVEL.GEOPOINT,
        },
        columnIndex,
    };
};

const prepareValue = (
    value: number | string | any,
    valueType: string | undefined,
    formatting: ServerFieldFormatting | undefined,
) => {
    if (valueType && isNumericalDataType(valueType)) {
        return chartKitFormatNumberWrapper(value as unknown as number, {
            lang: 'ru',
            ...(formatting ?? {precision: valueType === 'float' ? MINIMUM_FRACTION_DIGITS : 0}),
        });
    }

    if (valueType === 'markup') {
        return `<a href="${value.url}" target="_blank">${value.content.content}</a>`;
    }

    return value;
};

type SetPointPropertyArgs = {
    point: GeopointPointConfig | undefined;
    propName: string;
    propValue: any;
    propType?: string;
    formatting?: ServerFieldFormatting;
};

const setPointProperty = ({
    point,
    propName,
    propValue,
    propType,
    formatting,
}: SetPointPropertyArgs) => {
    if (!point) {
        return;
    }

    point.feature.properties[propName] = prepareValue(propValue, propType, formatting);
};

type SetPointTooltipArgs = {
    index: number;
    point: GeopointPointConfig | undefined;
    propKey: string;
    propValue: any;
    propType: string;
    formatting: ServerFieldFormatting | undefined;
    shouldEscapeUserValue?: boolean;
};

const setPointTooltip = ({
    index,
    point,
    propKey,
    propValue,
    propType,
    formatting,
    shouldEscapeUserValue,
}: SetPointTooltipArgs) => {
    if (!point) {
        return;
    }

    const value = prepareValue(propValue, propType, formatting);
    const text = `${propKey}: ${value}`;
    const isFirstTooltip = index === 0;

    if (!point.feature.properties.data) {
        point.feature.properties.data = [];
    }

    point.feature.properties.data[index] = {
        ...(isFirstTooltip && {color: point.options.iconColor}),
        text: shouldEscapeUserValue ? escape(text) : text,
    };
};

// eslint-disable-next-line complexity
function prepareGeopoint(options: PrepareFunctionArgs, {isClusteredPoints = false} = {}) {
    const app = registry.getApp();
    const {
        colors,
        colorsConfig,
        tooltips,
        labels,
        placeholders,
        resultData: {data, order},
        idToTitle,
        shared,
        idToDataType,
    } = options;
    const geopointsConfig = (options.geopointsConfig || {}) as PointSizeConfig;
    const layerSettings = (options.layerSettings ||
        {}) as VisualizationLayerShared['visualization']['layerSettings'];

    const ALPHA = getLayerAlpha(layerSettings);

    const allPoints: Record<string, GeopointPointConfig[]> = {};
    const colorValues: number[] = [];

    const color = colors[0];
    const colorFieldDataType = color ? idToDataType[color.guid] : null;

    const gradientMode =
        color &&
        colorFieldDataType &&
        isGradientMode({colorField: color, colorFieldDataType, colorsConfig});

    const size = placeholders[1].items[0];
    const coordinates = placeholders[0].items;
    const updatedTooltips = [...tooltips];
    const shouldEscapeUserValue = isEnabledServerFeature(
        app.nodekit.ctx,
        Feature.EscapeUserHtmlInDefaultHcTooltip,
    );

    const label = labels[0];

    let colorData: Record<string, string> = {},
        gradientOptions: GradientOptions | null = null,
        sizeMinValue: number | undefined,
        sizeMaxValue: number | undefined,
        leftBot: Coordinate | undefined,
        rightTop: Coordinate | undefined;
    const colorDictionary: Record<string, string> = {};

    const getTooltip = (dataTitle: string) =>
        updatedTooltips.find((tooltip) => dataTitle === tooltip.title);

    // we get the min and max for the radius, as well as the gradient values
    if (size || color) {
        data.forEach((values) => {
            values.forEach((columnData, columnIndex) => {
                if (columnData === 'null' || columnData === null) {
                    return;
                }

                const dataTitle = getTitleInOrder(order, columnIndex, coordinates);

                if (size && size.title === dataTitle) {
                    const value = Number(columnData);
                    [sizeMinValue, sizeMaxValue] = getExtremeValues({
                        min: sizeMinValue,
                        max: sizeMaxValue,
                        value,
                    });
                }

                if (color && color.title === dataTitle) {
                    const colorValue = Number(columnData);
                    if (!isNaN(colorValue)) {
                        colorValues.push(colorValue);
                    }
                }
            });
        });
    }

    if (gradientMode) {
        const gradientThresholdValues = getThresholdValues(colorsConfig, colorValues);
        const {min, rangeMiddle, max} = gradientThresholdValues;
        colorData = getColorsByMeasureField({
            values: colorValues,
            colorsConfig,
            gradientThresholdValues,
        });

        gradientOptions = {
            min: min,
            mid: min + rangeMiddle,
            max: max,
        };
    }

    let colorIndex = -1;
    if (color) {
        const cTitle = idToTitle[color.guid];
        colorIndex = findIndexInOrder(order, color, cTitle);
    }

    const colorsByValue = new Map<string, string>();

    data.forEach((values, valuesIndex) => {
        // at each pass of the string, we collect the points into an array, assuming,
        // that there can be more than one pair of coordinates in a row
        allPoints[`points-${valuesIndex}`] = [];

        // eslint-disable-next-line complexity
        values.forEach((columnData, columnIndex) => {
            if (columnData === 'null' || columnData === null) {
                return;
            }

            const dataTitle = getTitleInOrder(order, columnIndex, coordinates);

            if (coordinates.findIndex(({title}) => title === dataTitle) !== -1) {
                const current = JSON.parse(columnData);

                // adjusting the borders of the map
                [leftBot, rightTop] = getMapBounds({leftBot, rightTop, current});

                allPoints[`points-${valuesIndex}`].push(
                    getPointConfig({
                        columnIndex,
                        stringifyedCoordinates: columnData,
                        geopointsConfig,
                    }),
                );
            }

            if (size && size.title === dataTitle) {
                const radius = getPointRadius({
                    current: Number(columnData),
                    min: sizeMinValue!,
                    max: sizeMaxValue!,
                    geopointsConfig,
                });

                allPoints[`points-${valuesIndex}`].forEach((point) =>
                    setPointProperty({
                        point,
                        propName: 'radius',
                        propValue: radius,
                    }),
                );
            }

            if (label && label.title === dataTitle) {
                allPoints[`points-${valuesIndex}`].forEach((point) =>
                    setPointProperty({
                        point,
                        propName: 'label',
                        propValue: columnData,
                        propType: label.data_type,
                        formatting: label.formatting,
                    }),
                );
            }

            if (color && color.title === dataTitle) {
                const colorValue = escape(values[colorIndex] as string);
                let iconColor = DEFAULT_ICON_COLOR;

                if (colorValue) {
                    if (gradientMode) {
                        const key = isNaN(Number(colorValue))
                            ? colorValue
                            : String(Number(colorValue));

                        if (colorData[key]) {
                            iconColor = colorData[key];
                        }
                    } else {
                        let mountedColor = getMountedColor(colorsConfig, colorValue);

                        if (!mountedColor || mountedColor === 'auto') {
                            if (!colorsByValue.has(colorValue)) {
                                const key =
                                    colorsConfig.colors[
                                        colorsByValue.size % colorsConfig.colors.length
                                    ];
                                colorsByValue.set(colorValue, key);
                            }

                            mountedColor = colorsByValue.get(colorValue) || DEFAULT_ICON_COLOR;
                        }

                        iconColor = mountedColor;
                        colorDictionary[colorValue] = mountedColor;
                    }
                }

                allPoints[`points-${valuesIndex}`].forEach((point) => {
                    point.options.iconColor = iconColor;
                });
            }

            if (tooltips.length && getTooltip(dataTitle)) {
                // Due to the fact that a field that already exists in another section can be installed in a section with a tooltip,
                // it (the field in the tooltip and other section) comes to the order array in a single instance,
                // which in turn can lead to an incorrect order of displaying fields in the tooltip.
                // Therefore, before installing the tooltip, we remember its correct index
                const index = updatedTooltips.findIndex((t) => t.title === dataTitle);
                const {title, fakeTitle, formatting, data_type: propType} = getTooltip(dataTitle)!;
                allPoints[`points-${valuesIndex}`].forEach((point: GeopointPointConfig) => {
                    setPointTooltip({
                        index,
                        point,
                        propType,
                        propKey: fakeTitle || title,
                        propValue: columnData,
                        formatting,
                        shouldEscapeUserValue,
                    });
                });
            }
        });
    });

    let mapOptions: GeopointMapOptions = {
        opacity: ALPHA,
        showCustomLegend: true,
    };

    if (shared.extraSettings && shared.extraSettings.legendMode === 'hide') {
        mapOptions.showCustomLegend = false;
    }

    if (layerSettings.id) {
        mapOptions.geoObjectId = layerSettings.id;
    }

    mapOptions.layerTitle =
        layerSettings.name ||
        options.ChartEditor.getTranslation('wizard.prepares', 'label_new-layer');

    if (size) {
        mapOptions = {
            ...mapOptions,
            sizeMinValue,
            sizeMaxValue,
            sizeTitle: size.fakeTitle || idToTitle[size.guid] || size.title,
        };
    }

    if (gradientOptions) {
        const colorTitle = color.fakeTitle || idToTitle[color.guid] || color.title;

        mapOptions = {
            ...mapOptions,
            ...getGradientMapOptions(colorsConfig, colorTitle, gradientOptions),
        };

        return [
            {
                collection: {
                    children: getFlattenCoordinates(Object.values(allPoints)),
                },
                options: mapOptions,
                bounds: [leftBot, rightTop],
            },
        ];
    } else {
        mapOptions = {
            ...mapOptions,
        };

        if (color) {
            mapOptions.colorDictionary = colorDictionary;
            mapOptions.mode = 'dictionary';
            mapOptions.colorTitle = color.fakeTitle || idToTitle[color.guid] || color.title;
        }
    }

    const resultData = {
        options: mapOptions,
        bounds: [leftBot, rightTop],
    };

    const flatternCoordinates = getFlattenCoordinates(Object.values(allPoints));

    if (isClusteredPoints) {
        return [
            {
                ...resultData,
                clusterer: flatternCoordinates,
                options: {
                    ...resultData.options,
                    clusterIconLayout: 'default#pieChart',
                    iconPieChartCoreRadius: 15,
                    iconPieChartRadius: 20,
                    iconPieChartStrokeWidth: 1,
                    hasBalloon: false,
                    margin: 20,
                },
            },
        ];
    }

    return [
        {
            ...resultData,
            collection: {
                children: flatternCoordinates,
            },
        },
    ];
}

export default prepareGeopoint;
