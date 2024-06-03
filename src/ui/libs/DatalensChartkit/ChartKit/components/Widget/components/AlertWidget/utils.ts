import type {Alert} from '../../../../../types';

enum TileMode {
    WideRectangle = 'WIDE_RECTANGLE',
    BigSquare = 'BIG_SQUARE',
    LittleSquare = 'LITTLE_SQUARE',
}

/* Area constants */
export const AREA_PADDING = 7;

/* Tile constants */
export const DEFAULT_TILE_WIDTH = 280;
export const DEFAULT_TILE_HEIGHT = 120;

export const NORMAL_LINE_HEIGHT = 1.2;

export const MIN_LABEL_FONT_SIZE = 9;
export const MAX_LABEL_FONT_SIZE = 18;

export const MIN_ANNOTATION_FONT_SIZE = 12;
export const MAX_ANNOTATION_FONT_SIZE = 36;

/* Tile modes */
export const TM_WIDE_RECTANGLE = 0;
export const TM_BIG_SQUARE = 2;
export const TM_LITTLE_SQUARE = 3;

/* Tile mode constants */
export const BIG_TILE_MARGIN = 2;
export const LITTLE_TILE_MARGIN = 2;

export const MIN_TILE_AS_RECTANGLE_SIZE = 30;
export const MAX_TILE_AS_LITTLE_SQUARE_SIZE = 60;
export const MIN_TILE_AS_LITTLE_SQUARE_SIZE = 5;
export const MAX_TILE_AS_BIG_SQUARE_SIZE = 280;

/* Padding constants */
export const TILE_PADDING = 15;
export const TILE_PADDING_RATIO = TILE_PADDING / DEFAULT_TILE_WIDTH;

/* Singlestat constants */
export const MAX_SINGLESTAT_SIZE = 2 * MAX_TILE_AS_BIG_SQUARE_SIZE;
export const MAX_SINGLESTAT_LABEL_FONT_SIZE = 3 * MAX_LABEL_FONT_SIZE;
export const MAX_SINGLESTAT_ANNOTATION_FONT_SIZE = 3 * MAX_ANNOTATION_FONT_SIZE;

const canvas = document.createElement('canvas');
const canvasContext = canvas.getContext('2d');

export function computeMaxValue(values: number[]) {
    return values.length === 0 ? 0 : values.reduce((a, b) => Math.max(a, b));
}

export function limitMaxValue(value: number, max: number) {
    return value > max ? max : value;
}

export function limitMinMaxValue(value: number, min: number, max: number) {
    if (value > max) {
        return max;
    } else if (value < min) {
        return min;
    } else {
        return value;
    }
}

export function checkThatTilesAreFitted(
    areaWidth: number,
    areaHeight: number,
    tileWidth: number,
    tileHeight: number,
    tileMargin: number,
    tilesCount: number,
) {
    const doubleTileMarginWithBorder = (tileMargin + 1) * 2;

    const widthForTiles = areaWidth - 2 * AREA_PADDING;

    const colCount = Math.floor(widthForTiles / (tileWidth + doubleTileMarginWithBorder));

    const rowCount = Math.ceil(tilesCount / colCount);

    const actualAreaHeight =
        AREA_PADDING * 2 + rowCount * (tileHeight + doubleTileMarginWithBorder);

    return actualAreaHeight > 0 && actualAreaHeight < areaHeight;
}

export function computeTileSizesByComplexParams(
    areaWidth: number,
    areaHeight: number,
    startTileWidth: number,
    startTileHeight: number,
    minTileSize: number,
    tileMargin: number,
    tilesCount: number,
) {
    let tileWidth = startTileWidth;
    let tileHeight = startTileHeight;

    // eslint-disable-next-line max-len
    while (
        !checkThatTilesAreFitted(
            areaWidth,
            areaHeight,
            tileWidth,
            tileHeight,
            tileMargin,
            tilesCount,
        )
    ) {
        if (tileWidth <= minTileSize || tileHeight < minTileSize) {
            return null;
        }

        if (startTileHeight <= startTileWidth) {
            --tileHeight;
            tileWidth = Math.floor((tileHeight * startTileWidth) / startTileHeight);
        } else {
            --tileWidth;
            tileHeight = Math.floor((tileWidth * startTileHeight) / startTileWidth);
        }
    }

    return {tileWidth, tileHeight};
}

export function computeWideRectangleTileSizes(
    areaWidth: number,
    areaHeight: number,
    tileMargin: number,
    tilesCount: number,
) {
    return computeTileSizesByComplexParams(
        areaWidth,
        areaHeight,
        DEFAULT_TILE_WIDTH,
        DEFAULT_TILE_HEIGHT,
        MIN_TILE_AS_RECTANGLE_SIZE,
        tileMargin,
        tilesCount,
    );
}

export function computeBigSquareTileSizes(
    areaWidth: number,
    areaHeight: number,
    tileMargin: number,
    tilesCount: number,
) {
    return computeTileSizesByComplexParams(
        areaWidth,
        areaHeight,
        MAX_TILE_AS_BIG_SQUARE_SIZE,
        MAX_TILE_AS_BIG_SQUARE_SIZE,
        MAX_TILE_AS_LITTLE_SQUARE_SIZE,
        tileMargin,
        tilesCount,
    );
}

export function computeLittleSquareTileSizes(
    areaWidth: number,
    areaHeight: number,
    tileMargin: number,
    tilesCount: number,
) {
    return computeTileSizesByComplexParams(
        areaWidth,
        areaHeight,
        MAX_TILE_AS_LITTLE_SQUARE_SIZE,
        MAX_TILE_AS_LITTLE_SQUARE_SIZE,
        MIN_TILE_AS_LITTLE_SQUARE_SIZE,
        tileMargin,
        tilesCount,
    );
}

export function computeTileSizesForArea(
    areaWidth: number,
    areaHeight: number,
    tilesCount: number,
    isSquareTitles: boolean,
) {
    let tileSizes = null;
    let tileMargin = BIG_TILE_MARGIN;
    let mode;

    if (isSquareTitles) {
        mode = TileMode.BigSquare;
        tileSizes = computeBigSquareTileSizes(areaWidth, areaHeight, tileMargin, tilesCount);
    } else {
        mode = TileMode.WideRectangle;
        tileSizes = computeWideRectangleTileSizes(areaWidth, areaHeight, tileMargin, tilesCount);
    }

    if (tileSizes === null) {
        mode = TileMode.LittleSquare;
        tileMargin = LITTLE_TILE_MARGIN;
        tileSizes = computeLittleSquareTileSizes(areaWidth, areaHeight, tileMargin, tilesCount);

        if (tileSizes === null) {
            tileSizes = {
                tileWidth: MIN_TILE_AS_LITTLE_SQUARE_SIZE,
                tileHeight: MIN_TILE_AS_LITTLE_SQUARE_SIZE,
            };
        }
    }

    return {...tileSizes, mode, tileMargin};
}

export function fitTitleByWidth(
    width: number,
    titleSize: number,
    minSize: number,
    titleLen: number,
) {
    if (titleSize < minSize) {
        return 0;
    }

    let str = '';
    for (let i = 0; i < titleLen; ++i) {
        str += 'X';
    }

    let valueWidth = 0;

    if (canvasContext) {
        canvasContext.font = `${titleSize}px serif`;
        valueWidth = canvasContext.measureText(str).width;
    }

    let resultSize = titleSize;

    if (valueWidth > width) {
        resultSize = (titleSize * width) / valueWidth;
        resultSize = resultSize >= minSize ? resultSize : 0;
    }

    return resultSize;
}

export function fitInnerTitleSizes(
    tileWidth: number,
    tileHeight: number,
    tilePadding: number,
    labelsCount: number,
    annotationsCount: number,
    labelLen: number,
    annotationLen: number,
) {
    let labelSize;
    let valueSize;

    const innerHeight = (tileHeight - 2 * tilePadding) / NORMAL_LINE_HEIGHT;
    const innerWidth = tileWidth - 2 * tilePadding;

    if (labelsCount > 0 && annotationsCount > 0) {
        const alpha =
            innerHeight /
            (MAX_LABEL_FONT_SIZE * labelsCount + MAX_ANNOTATION_FONT_SIZE * annotationsCount);

        labelSize = Math.ceil(alpha * MAX_LABEL_FONT_SIZE);
        valueSize = Math.ceil(alpha * MAX_ANNOTATION_FONT_SIZE);
        valueSize = fitTitleByWidth(innerWidth, valueSize, MIN_ANNOTATION_FONT_SIZE, annotationLen);
        labelSize = fitTitleByWidth(innerWidth, labelSize, MIN_LABEL_FONT_SIZE, labelLen);

        if (labelSize === 0 || valueSize === 0) {
            labelSize = 0;
            valueSize = Math.ceil(innerHeight / annotationsCount);
        }
    } else if (labelsCount === 0 && annotationsCount > 0) {
        labelSize = 0;
        valueSize = Math.ceil(innerHeight / annotationsCount);
    } else if (labelsCount > 0 && annotationsCount === 0) {
        labelSize = Math.ceil(innerHeight / labelsCount);
        valueSize = 0;
    } else {
        labelSize = 0;
        valueSize = 0;
    }

    return {labelSize, valueSize};
}

export function computeFitTileStyle(areaWidth: number, areaHeight: number, alerts: Alert[]) {
    let maxLabelsCount = 0;
    let maxAnnotationsCount = 0;

    let maxLabelTitleLen = 0;
    let maxAnnotationTitleLen = 0;

    alerts.forEach((alert) => {
        const {labels = {}, annotations = {}} = alert;

        const alertLabelsCount = Object.keys(labels).length;
        const alertAnnotationsCount = Object.keys(annotations).length;

        const alertLabelsMaxLen = Math.max(...Object.values(labels).map((label) => label.length));
        const alertAnnotationsMaxLen = Math.max(
            ...Object.values(annotations).map((annotation) => annotation.length),
        );

        if (alertLabelsCount > maxLabelsCount) {
            maxLabelsCount = alertLabelsCount;
        }

        if (alertAnnotationsCount > maxAnnotationsCount) {
            maxAnnotationsCount = alertAnnotationsCount;
        }

        if (alertLabelsMaxLen > maxLabelTitleLen) {
            maxLabelTitleLen = alertLabelsMaxLen;
        }

        if (alertAnnotationsMaxLen > maxAnnotationTitleLen) {
            maxAnnotationTitleLen = alertAnnotationsMaxLen;
        }
    });

    const isSquareTiles = maxLabelsCount + maxAnnotationsCount >= 5;

    const {tileWidth, tileHeight, tileMargin, mode} = computeTileSizesForArea(
        areaWidth,
        areaHeight,
        alerts.length,
        isSquareTiles,
    );

    const tilePadding = Math.min(TILE_PADDING, Math.ceil(tileWidth * TILE_PADDING_RATIO));

    let labelFontSize;
    let annotationFontSize;

    if (mode === TileMode.LittleSquare) {
        labelFontSize = 0;
        annotationFontSize = 0;
    } else {
        const maxLabelLen = Math.ceil(0.75 * maxLabelTitleLen);
        const maxAnnotationLen = maxAnnotationTitleLen;
        const size = fitInnerTitleSizes(
            tileWidth,
            tileHeight,
            tilePadding,
            maxLabelsCount,
            maxAnnotationsCount,
            maxLabelLen,
            maxAnnotationLen,
        );

        labelFontSize = limitMaxValue(size.labelSize, MAX_LABEL_FONT_SIZE);
        annotationFontSize = limitMaxValue(size.valueSize, MAX_ANNOTATION_FONT_SIZE);
    }

    return {tileWidth, tileHeight, tilePadding, tileMargin, labelFontSize, annotationFontSize};
}

export function computeFitSinglestatStyle(areaWidth: number, areaHeight: number, alert: Alert) {
    const {labels = [], annotations = []} = alert;

    const labelsCount = Object.keys(labels).length;
    const annotationsCount = Object.keys(annotations).length;

    const maxLabelLen = Math.max(...Object.values(labels).map((label) => label.length));
    const maxAnnotationLen = Math.max(
        ...Object.values(annotations).map((annotation) => annotation.length),
    );

    let tileWidth = areaWidth - 2 * (AREA_PADDING + 1);
    tileWidth = limitMinMaxValue(tileWidth, MIN_TILE_AS_LITTLE_SQUARE_SIZE, MAX_SINGLESTAT_SIZE);

    let tileHeight = areaHeight - 2 * (AREA_PADDING + 1);
    tileHeight = limitMinMaxValue(tileHeight, MIN_TILE_AS_LITTLE_SQUARE_SIZE, MAX_SINGLESTAT_SIZE);

    const minTileSize = Math.min(tileWidth, tileHeight);

    let isLittleSquare;
    let tileMargin;

    if (minTileSize >= MAX_TILE_AS_LITTLE_SQUARE_SIZE) {
        isLittleSquare = false;
        tileMargin = BIG_TILE_MARGIN;
    } else {
        isLittleSquare = true;
        tileMargin = LITTLE_TILE_MARGIN;
    }

    const tilePadding = Math.min(TILE_PADDING, Math.ceil(minTileSize * TILE_PADDING_RATIO));

    let labelFontSize;
    let annotationFontSize;

    if (isLittleSquare) {
        labelFontSize = 0;
        annotationFontSize = 0;
    } else {
        const size = fitInnerTitleSizes(
            tileWidth,
            tileHeight,
            tilePadding,
            labelsCount,
            annotationsCount,
            maxLabelLen,
            maxAnnotationLen,
        );

        labelFontSize = limitMaxValue(size.labelSize, MAX_SINGLESTAT_LABEL_FONT_SIZE);
        annotationFontSize = limitMaxValue(size.valueSize, MAX_SINGLESTAT_ANNOTATION_FONT_SIZE);
    }

    return {tileWidth, tileHeight, tileMargin, tilePadding, labelFontSize, annotationFontSize};
}
