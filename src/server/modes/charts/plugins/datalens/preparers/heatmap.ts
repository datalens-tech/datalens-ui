import {RGBColor, VisualizationLayerShared} from '../../../../../../shared';
import {getCurrentGradient, getRgbColors} from '../utils/color-helpers';
import {
    Coordinate,
    getExtremeValues,
    getFlattenCoordinates,
    getLayerAlpha,
    getMapBounds,
} from '../utils/geo-helpers';
import {getTitleInOrder} from '../utils/misc-helpers';

import {PrepareFunctionArgs} from './types';

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
    dissipating: boolean;
    opacity: number;
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
                allPoints[`points-${valuesIndex}`].forEach((point) =>
                    setPointWeight(point, weight),
                );
            }
        });
    });

    const currentGradient = getCurrentGradient(colorsConfig);

    const rgbColors: RGBColor[] = getRgbColors(
        currentGradient.colors,
        Boolean(colorsConfig.reversed),
    );

    let gradient: Record<string, string> = {
        0.1: 'rgba(128, 255, 0, 0.7)',
        0.2: 'rgba(255, 255, 0, 0.8)',
        0.7: 'rgba(234, 72, 58, 0.9)',
        1.0: 'rgba(162, 36, 25, 1)',
    };

    if (rgbColors.length && colors.length) {
        const [first, second, third] = rgbColors;

        if (first && second && third) {
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

    const opacity = getLayerAlpha(layerSettings);

    const mapOptions: HeatmapMapOptions = {
        // Radius of influence
        radius: 15,
        // Is it necessary to reduce the pixel size of the dots when the zoom is reduced. False - not necessary
        dissipating: false,
        // Transparency of the heat map
        opacity,
        // Transparency at the median point by weight
        intensityOfMidpoint: 0.2,
        // JSON description of the gradient
        gradient,
        isCustomPalette: Boolean(rgbColors.length),
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

    return [
        {
            heatmap: getFlattenCoordinates(Object.values(allPoints)),
            options: mapOptions,
            bounds: [leftBot, rightTop],
        },
    ];
}

export default prepareHeatmap;
