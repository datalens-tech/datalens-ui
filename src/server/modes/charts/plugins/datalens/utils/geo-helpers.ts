import {MapCenterMode, ZoomMode, mapStringToCoordinates} from '../../../../../../shared';
import type {RGBGradient, ServerChartsConfig} from '../../../../../../shared';
import type {ChartColorsConfig} from '../types';

import {
    getCurrentGradient,
    getRgbColors,
    mapAndColorizeCoordinatesByDimension,
    mapAndColorizeHashTableByGradient,
} from './color-helpers';
import {LAT, LONG} from './constants';

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

function colorizeGeoByPalette(data: GeoData, colorsConfig: ChartColorsConfig, colorGuid: string) {
    const preparedData = Object.entries(data).reduce((acc, [, points]) => {
        points.forEach((point) => {
            if (typeof point === 'object' && point !== null) {
                Object.assign(acc, point);
            }
        });

        return acc;
    }, {});

    return mapAndColorizeCoordinatesByDimension(preparedData, colorsConfig, colorGuid);
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
    colorizeGeoByPalette,
    getLayerAlpha,
    getGradientMapOptions,
};
