import {
    MapCenterMode,
    ZoomMode,
    getSortedData,
    mapStringToCoordinates,
} from '../../../../../../shared';
import type {RGBGradient, ServerChartsConfig, ServerField} from '../../../../../../shared';
import {getColorsSettings} from '../../helpers/color-palettes';
import type {ChartColorsConfig} from '../types';

import {getCurrentGradient, getRgbColors, mapAndColorizeHashTableByGradient} from './color-helpers';
import {LAT, LONG, getColor, getMountedColor} from './constants';

export type Coordinate = [number, number];

type GeoData = Record<string, {}[]>;

interface GradientMapOptions {
    mode: 'gradient';
    colorTitle: string;
    gradientData: RGBGradient;
    colorMinValue: number;
    colorMaxValue: number;
    colorMidValue?: number;
}

function getMapBounds(points: {
    current: Coordinate;
    leftBot?: Coordinate;
    rightTop?: Coordinate;
}): [Coordinate, Coordinate] {
    const {current} = points;
    const currentLat = (current[LAT] = current[LAT] < -90 ? current[LAT] + 180 : current[LAT]);

    // -168 - Bering Strait
    const currentLong = (current[LONG] =
        current[LONG] < -168 ? current[LONG] + 360 : current[LONG]);

    let leftBot: Coordinate, rightTop: Coordinate;

    if (points.leftBot) {
        leftBot = [...points.leftBot];
    } else {
        leftBot = [currentLat, currentLong];
    }

    if (points.rightTop) {
        rightTop = [...points.rightTop];
    } else {
        rightTop = [currentLat, currentLong];
    }

    if (currentLat < leftBot[LAT]) {
        leftBot[LAT] = currentLat;
    }

    if (currentLong < leftBot[LONG]) {
        leftBot[LONG] = currentLong;
    }

    if (currentLat > rightTop[LAT]) {
        rightTop[LAT] = currentLat;
    }

    if (currentLong > rightTop[LONG]) {
        rightTop[LONG] = currentLong;
    }

    // -85 is the maximum latitude value to which Yandex maps draw, then the south pole is displayed as a gray zone.
    if (leftBot[LAT] < -85) {
        leftBot[LAT] = -85;
    }

    return [leftBot, rightTop];
}

function getExtremeValues(params: {min?: number; max?: number; value: number}) {
    const {value} = params;
    let min, max;

    if (params.min) {
        min = params.min;
    } else {
        min = value;
    }

    if (params.max) {
        max = params.max;
    } else {
        max = value;
    }

    if (value < min) {
        min = value;
    }

    if (value > max) {
        max = value;
    }

    return [min, max];
}

function getFlattenCoordinates(coordinates: unknown[][]) {
    return coordinates.reduce((acc, val) => acc.concat(val), []);
}

export type GradientOptions = {
    min: number;
    mid: number;
    max: number;
};

export type ColorizedResult = GradientOptions & {
    colorData: Record<
        string,
        {
            backgroundColor: string;
            color: string;
            value: number | null;
        }
    >;
};

function colorizeGeoByGradient(data: GeoData, colorsConfig: ChartColorsConfig): ColorizedResult {
    const preparedData = Object.entries(data).reduce((acc, [, points]) => {
        points.forEach((point) => {
            Object.assign(acc, point);
        });

        return acc;
    }, {});

    return mapAndColorizeHashTableByGradient(preparedData, colorsConfig);
}

export function colorizeGeoByPalette({
    data,
    colorsConfig,
    colorField,
    defaultColorPaletteId,
}: {
    data: GeoData;
    colorsConfig: ChartColorsConfig;
    colorField: ServerField;
    defaultColorPaletteId: string;
}) {
    const preparedData: Record<string, string> = Object.entries(data).reduce((acc, [, points]) => {
        points.forEach((point) => {
            if (typeof point === 'object' && point !== null) {
                Object.assign(acc, point);
            }
        });

        return acc;
    }, {});

    const knownValues: {point: string; value: string; backgroundColor?: string}[] = [];

    const colorData: Record<string, {backgroundColor?: string; colorIndex?: number}> = {};
    const colorDictionary: Record<string, string> = {};

    const {mountedColors, colors} = getColorsSettings({
        field: colorField,
        colorsConfig,
        defaultColorPaletteId,
        availablePalettes: colorsConfig.availablePalettes,
        customColorPalettes: colorsConfig.loadedColorPalettes,
    });

    // eslint-disable-next-line guard-for-in
    for (const point in preparedData) {
        const value = preparedData[point];
        colorData[point] = {};
        let colorIndex = knownValues.findIndex(({value: knownValue}) => knownValue === value);

        if (colorIndex === -1) {
            knownValues.push({point, value});
            colorIndex = knownValues.length - 1;

            let color;

            if (mountedColors && mountedColors[value]) {
                color = getMountedColor({mountedColors, colors, value});
            } else {
                color = getColor(colorIndex, colors);
            }
            knownValues[knownValues.length - 1].backgroundColor = color;
            colorData[point].backgroundColor = color;

            colorDictionary[value] = color;
        } else {
            colorData[point].backgroundColor = knownValues[colorIndex].backgroundColor;
        }

        colorData[point].colorIndex = colorIndex;
    }

    return {colorData, colorDictionary: getSortedData(colorDictionary)};
}

function getLayerAlpha(layerSettings: {alpha: number}) {
    return layerSettings.alpha * 1e-2 || 0.8;
}

function getGradientMapOptions(
    colorsConfig: ChartColorsConfig,
    colorTitle: string,
    colorizedResult: GradientOptions,
) {
    const rawGradientData = getCurrentGradient(colorsConfig);
    const rgbColors = getRgbColors(rawGradientData.colors, Boolean(colorsConfig.reversed));
    const gradientData = {
        ...rawGradientData,
        colors: rgbColors,
    };

    const mapOptions: GradientMapOptions = {
        mode: 'gradient',
        colorTitle,
        gradientData,
        colorMinValue: colorizedResult.min,
        colorMaxValue: colorizedResult.max,
    };

    if (colorsConfig.gradientMode === '3-point') {
        mapOptions.colorMidValue = colorizedResult.mid;
    }

    return mapOptions;
}

export function getMapState(shared: ServerChartsConfig, bounds: (Coordinate | undefined)[]) {
    const [leftBot, rightTop] = bounds;
    const shouldSetBounds =
        shared?.extraSettings?.zoomMode !== ZoomMode.Manual &&
        shared?.extraSettings?.mapCenterMode !== ZoomMode.Manual;

    let center: Coordinate = [55.76, 37.64];
    const centerValue = shared?.extraSettings?.mapCenterValue;
    const mapCenterValue = centerValue ? (mapStringToCoordinates(centerValue) as Coordinate) : null;

    if (shared?.extraSettings?.mapCenterMode === MapCenterMode.Manual && mapCenterValue) {
        center = mapCenterValue;
    } else if (leftBot && rightTop && !shouldSetBounds) {
        center = [leftBot[0] / 2 + rightTop[0] / 2, leftBot[1] / 2 + rightTop[1] / 2];
    }

    let zoom = 8;
    if (shared?.extraSettings?.zoomMode === ZoomMode.Manual && shared?.extraSettings?.zoomValue) {
        zoom = Math.max(1, shared.extraSettings.zoomValue);
    }

    return {zoom, center};
}

export {
    getMapBounds,
    getExtremeValues,
    getFlattenCoordinates,
    colorizeGeoByGradient,
    getLayerAlpha,
    getGradientMapOptions,
};
