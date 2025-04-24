import {type RGBColor, type VisualizationLayerShared, ZoomMode} from '../../../../../../shared';
import {getCurrentGradient, getRgbColors, getThresholdValues} from '../utils/color-helpers';
import type {Coordinate} from '../utils/geo-helpers';
import {
    getExtremeValues,
    getFlattenCoordinates,
    getLayerAlpha,
    getMapBounds,
    getMapState,
} from '../utils/geo-helpers';
import {getTitleInOrder} from '../utils/misc-helpers';

import type {PrepareFunctionArgs} from './types';

type HeatmapPointConfig = {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: any;
    };
    properties: {
        weight: number;
    };
};

type HeatmapMapOptions = {
    radius: number;
    /** disperse points on higher zoom levels according to radius */
    dissipating: boolean;
    opacity: number;
    /** Intensity of median point (from 0 to 1) */
    intensityOfMidpoint: number;
    gradient: Record<string, string>;
    isCustomPalette: boolean;
    showCustomLegend: boolean;
    colorTitle: string;
    geoObjectId?: string;
    layerTitle?: string;
};

function prepareHeatmap(options: PrepareFunctionArgs) {
    const {
        placeholders,
        colors,
        resultData: {data, order},
        idToTitle,
        shared,
        colorsConfig,
        ChartEditor,
    } = options;
    const layerSettings = (options.layerSettings ||
        {}) as VisualizationLayerShared['visualization']['layerSettings'];

    const allPoints: Record<string, HeatmapPointConfig[]> = {};
    const coordinates = placeholders[0].items;

    let min: number, max: number, leftBot: Coordinate | undefined, rightTop: Coordinate | undefined;

    if (colors.length) {
        data.forEach((values) => {
            values.forEach((columnData, columnIndex) => {
                if (columnData === 'null' || columnData === null) {
                    return;
                }

                const dataTitle = getTitleInOrder(order, columnIndex, coordinates);

                if (colors[0].title === dataTitle) {
                    const value = Number(columnData);
                    [min, max] = getExtremeValues({min, max, value});
                }
            });
        });
    }

    // we get a step for the weight parameter (we distribute points from 1 to 10)
    const step = (max! - min!) / 10;

    const getPointConfig = (coordinates: any): HeatmapPointConfig => {
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates,
            },
            properties: {
                weight: 5,
            },
        };
    };

    const getPointWeight = ({current, min, step}: {current: number; min: number; step: number}) => {
        return Math.ceil((current - min) / step);
    };

    const setPointWeight = (point: undefined | HeatmapPointConfig, weight: number) => {
        if (!point) {
            return;
        }

        point.properties.weight = weight ? weight : 1;
    };
    const colorValues: number[] = [];

    data.forEach((values, valuesIndex) => {
        allPoints[`points-${valuesIndex}`] = [];

        values.forEach((columnData, columnIndex) => {
            if (columnData === 'null' || columnData === null) {
                return;
            }

            const dataTitle = getTitleInOrder(order, columnIndex, coordinates);

            if (coordinates.findIndex(({title}) => title === dataTitle) !== -1) {
                const current = JSON.parse(columnData);
                [leftBot, rightTop] = getMapBounds({leftBot, rightTop, current});
                allPoints[`points-${valuesIndex}`].push(getPointConfig(current));
            }

            if (colors.length && colors[0].title === dataTitle) {
                const weight = getPointWeight({current: Number(columnData), min, step});

                colorValues.push(weight);
                allPoints[`points-${valuesIndex}`].forEach((point) =>
                    setPointWeight(point, weight),
                );
            }
        });
    });

    const isCustomPalette = Boolean(colors.length && colorsConfig.gradientColors?.length);
    let middleThreshold = 0.2;
    let gradient: Record<string, string> = {
        0.1: 'rgba(128, 255, 0, 0.7)',
        0.2: 'rgba(255, 255, 0, 0.8)',
        0.7: 'rgba(234, 72, 58, 0.9)',
        1.0: 'rgba(162, 36, 25, 1)',
    };

    if (isCustomPalette) {
        const currentGradient = getCurrentGradient(colorsConfig);
        const rgbColors: RGBColor[] = getRgbColors(
            currentGradient.colors,
            Boolean(colorsConfig.reversed),
        );

        const [first, second, third] = rgbColors;

        if (first && second && third) {
            const hasMiddleThreValue = Boolean(
                colorsConfig.thresholdsMode === 'manual' &&
                    colorsConfig.middleThreshold !== 'undefined',
            );

            if (hasMiddleThreValue) {
                const {range, rangeMiddle} = getThresholdValues(colorsConfig, colorValues);
                middleThreshold = rangeMiddle / range;
            }

            gradient = {
                '0': `rgba(${first.red}, ${first.green}, ${first.blue}, 0.7)`,
                '0.5': `rgba(${second.red}, ${second.green}, ${second.blue}, 0.9)`,
                '1': `rgba(${third.red}, ${third.green}, ${third.blue}, 1)`,
            };
        } else if (first && second) {
            gradient = {
                '0': `rgba(${first.red}, ${first.green}, ${first.blue}, 0.7)`,
                '1': `rgba(${second.red}, ${second.green}, ${second.blue}, 1)`,
            };
        }
    }

    const mapOptions: HeatmapMapOptions = {
        radius: 15,
        dissipating: false,
        opacity: getLayerAlpha(layerSettings),
        intensityOfMidpoint: middleThreshold,
        gradient,
        isCustomPalette: isCustomPalette,
        showCustomLegend: true,
        colorTitle:
            coordinates[0].fakeTitle || idToTitle[coordinates[0].guid] || coordinates[0].title,
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

    const shouldSetBounds =
        shared?.extraSettings?.zoomMode !== ZoomMode.Manual &&
        shared?.extraSettings?.mapCenterMode !== ZoomMode.Manual;
    const {zoom, center} = getMapState(shared, [leftBot, rightTop]);

    ChartEditor.updateHighchartsConfig({state: {zoom, center}});

    return [
        {
            heatmap: getFlattenCoordinates(Object.values(allPoints)),
            options: mapOptions,
            bounds: shouldSetBounds ? [leftBot, rightTop] : undefined,
        },
    ];
}

export default prepareHeatmap;
