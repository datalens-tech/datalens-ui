import _ from 'lodash';

interface RGB {
    r: number;
    g: number;
    b: number;
}

interface ColorScheme {
    type: string;

    green?: string;
    yellow?: string;
    red?: string;
    violet?: string;
}

function isNumber(c: unknown) {
    return !Number.isNaN(Number(c));
}

function isDigit(c: string) {
    return c >= '0' && c <= '9';
}

function digitsPrefixLength(s: string, pos: number) {
    let r = 0;
    while (pos + r < s.length && isDigit(s.charAt(pos + r))) {
        ++r;
    }
    return r;
}

function compareImpl(s1: string, p1: number, s2: string, p2: number) {
    while (p1 !== s1.length && p2 !== s2.length) {
        const d1Len = Math.min(digitsPrefixLength(s1, p1), 17);
        const d2Len = Math.min(digitsPrefixLength(s2, p2), 17);
        if (d1Len > 0 && d2Len > 0) {
            // lame
            const d1 = parseInt(s1.substring(p1, p1 + d1Len), 10);
            const d2 = parseInt(s2.substring(p2, p2 + d2Len), 10);
            const c = d1 - d2;
            if (c !== 0) {
                return c;
            }
            p1 += d1Len;
            p2 += d2Len;
            continue;
        }

        const d1 = s1.charCodeAt(p1);
        const d2 = s2.charCodeAt(p2);
        const c = d1 - d2;
        if (c !== 0) {
            return c;
        }
        ++p1;
        ++p2;
    }

    return Number(p1 !== s1.length) - Number(p2 !== s2.length);
}

export function compareTextWithNumber(s1: string, s2: string) {
    if (isNumber(s1) && isNumber(s2)) {
        return Number(s1) - Number(s2);
    }

    return compareImpl(s1, 0, s2, 0);
}

const STARTING_HUE_POINTS = [80, 200, 50, 0, 160, 250];
const REGION_HUE_POINTS = [90, 200, 50, 10, 160, 330];

function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) {
        t += 1;
    }
    if (t > 1) {
        t -= 1;
    }
    if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
        return q;
    }
    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
}

function fixAttr(value: number) {
    let absValue = value;
    if (absValue > 255) {
        absValue = 255;
    }
    if (absValue < 0) {
        absValue = 0;
    }

    return absValue.toFixed();
}

function formatRgb(r: number, g: number, b: number) {
    return `rgb(${fixAttr(r)},${fixAttr(g)},${fixAttr(b)})`;
}

function convertHslToRgb(h: number, s: number, l: number) {
    let r;
    let g;
    let b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return formatRgb(r * 255, g * 255, b * 255);
}

function lin(pos: number, rfrom: number, rto: number) {
    const r = Math.floor(pos * (rto - rfrom) + rfrom);

    const rmin = Math.min(rfrom, rto);
    const rmax = Math.max(rfrom, rto);

    if (r < rmin) {
        return rmin;
    }

    if (r > rmax) {
        return rmax;
    }

    return r;
}

function lina(pos: number, rfrom: RGB, rto: RGB): RGB {
    const r = lin(pos, rfrom.r, rto.r);
    const g = lin(pos, rfrom.g, rto.g);
    const b = lin(pos, rfrom.b, rto.b);

    return {r, g, b};
}

export function getGradientColor(pos: number, begin: RGB, end: RGB) {
    const rgb = lina(pos, begin, end);
    return formatRgb(rgb.r, rgb.g, rgb.b);
}

/* ALEX PETROV COLOR */

export function getColorAlexPetrov(n: number) {
    const regionSize = 40;
    let hue;
    let saturation = 100;
    let lightness = 43;
    const magic = 7;

    if (n < STARTING_HUE_POINTS.length) {
        hue = STARTING_HUE_POINTS[n];
    } else {
        const region = n % REGION_HUE_POINTS.length;
        const iteration = Math.floor(n / REGION_HUE_POINTS.length);

        const hueShift = (magic * iteration) % regionSize;

        hue = (REGION_HUE_POINTS[region] + hueShift) % 360;

        // Indistinguishable green
        if (hue > 120 && hue < 150) {
            hue = (hue + 50) % 360;
        }
        // Purple-pink
        if (hue > 270 && hue < 330) {
            hue = (hue + 70) % 360;
        }
        // Indistinguishable blue
        if (hue > 220 && hue < 250) {
            hue = (hue + 40) % 360;
        }

        const saturationShift = (13 * (iteration + region)) % 20;
        saturation = 70 + saturationShift;

        const lightnessShift = (11 * (iteration + region)) % 25;
        if ((region + iteration + 1) % 2 > 0) {
            lightness = 45 - lightnessShift;
        } else {
            lightness = 45 + lightnessShift;
        }
    }

    return convertHslToRgb(hue / 360.0, saturation / 100.0, lightness / 100.0);
}

/* SOLOMON SPECIFIED COLOR FUNCTIONS */
enum ColorSchemeType {
    Gradient = 'gradient',
    Default = 'default',
    Auto = 'auto',
}

const GREEN = {r: 0, g: 127, b: 0};
const YELLOW = {r: 255, g: 255, b: 0};
const RED = {r: 255, g: 0, b: 0};
const VIOLET = {r: 128, g: 0, b: 255};

const GREEN_YELLOW_ZONE_ID = 0;
const YELLOW_RED_ZONE_ID = 1;
const RED_VIOLET_ZONE_ID = 2;

const GREEN_YELLOW_VALUE = {begin: GREEN, end: YELLOW};
const YELLOW_RED_VALUE = {begin: YELLOW, end: RED};
const RED_VIOLET_VALUE = {begin: RED, end: VIOLET};

const GradientZoneValues = [GREEN_YELLOW_VALUE, YELLOW_RED_VALUE, RED_VIOLET_VALUE];

class GradientColor {
    gradientZone: number;
    gradientPosition: number;
    ordinal: number;

    constructor(gradientZone: number, gradientPosition: number, ordinal: number) {
        this.gradientZone = gradientZone;
        this.gradientPosition = gradientPosition;
        this.ordinal = ordinal;
    }
}

const GradientColorIndexes = {
    GREEN: 0,
    YELLOW: 1,
    RED: 2,
    VIOLET: 3,
};

const GradientColorValues = [
    new GradientColor(GREEN_YELLOW_ZONE_ID, 0, 0),
    new GradientColor(YELLOW_RED_ZONE_ID, 0, 1),
    new GradientColor(RED_VIOLET_ZONE_ID, 0, 2),
    new GradientColor(RED_VIOLET_ZONE_ID, 1, 3),
];

enum LineColorType {
    Auto = 'auto',
    Gradient = 'gradient',
    Fixes = 'fixed',
}

class LineColor {
    type: LineColorType;
    zone: number | null;
    position: number | null;

    constructor(type: LineColorType, zone: number | null, position: number | null) {
        this.type = type;
        this.zone = zone;
        this.position = position;
    }
}

const AUTO_COLOR = new LineColor(LineColorType.Auto, null, null);

function gradientColor(zone: number | null, position: number | null) {
    return new LineColor(LineColorType.Gradient, zone, position);
}

const UNIQUE_GRADIENTED_LABELS_PATTERN = /^(|.*\D)(\d+)(\D*)$/;

function putIfAbsent(map: Record<string, unknown>, key: string | number, value: unknown) {
    if (!_.has(map, key)) {
        map[key] = value;
    }
}

function tryParseDecimalLong(s: string) {
    const num = Number(s);
    return !isNaN(num);
}

function labelPrefixAndSuffixOrNull(label: string) {
    const matcher = UNIQUE_GRADIENTED_LABELS_PATTERN.exec(label);

    if (matcher !== null && matcher.length === 4 && tryParseDecimalLong(matcher[2])) {
        return [matcher[1], matcher[3]];
    }

    return null;
}

function isUniqueGradientedLabels(labels: string[]) {
    labels = labels.filter((label) => label !== 'inf');

    if (labels.length === 0) {
        return false;
    }

    const firstLabel = labels[0];

    const firstLabelPrefixOrSuffix = labelPrefixAndSuffixOrNull(firstLabel);
    if (firstLabelPrefixOrSuffix === null) {
        return false;
    }

    for (let i = 1; i < labels.length; ++i) {
        const currentLabel = labels[i];
        const currentLabelPrefixAndSuffix = labelPrefixAndSuffixOrNull(currentLabel);
        if (!_.isEqual(firstLabelPrefixOrSuffix, currentLabelPrefixAndSuffix)) {
            return false;
        }
    }
    return true;
}

function constructColorMap(colorIndexes: Record<string, number>, labels: string[]) {
    const colorMap: Record<string, LineColor> = {};

    if (_.size(colorIndexes) > 0) {
        const entryList = _.entries(colorIndexes);
        entryList.sort((a, b) => a[1] - b[1]);

        let currentColorIndex = 0;
        for (let i = 0; i < labels.length; ++i) {
            while (currentColorIndex < entryList.length && i >= entryList[currentColorIndex][1]) {
                ++currentColorIndex;
            }

            let gradientPosition;
            let zone;

            if (currentColorIndex < entryList.length && currentColorIndex > 0) {
                const cidx = Number(entryList[currentColorIndex][0]);
                const currentColor = GradientColorValues[cidx];
                const currentColorNumber = entryList[currentColorIndex][1];

                const pidx = Number(entryList[currentColorIndex - 1][0]);
                const previousColor = GradientColorValues[pidx];
                const previousColorNumber = entryList[currentColorIndex - 1][1];

                gradientPosition =
                    (i - previousColorNumber) / (currentColorNumber - previousColorNumber);

                if (previousColor.ordinal < currentColor.ordinal) {
                    zone = previousColor.gradientZone;
                } else {
                    zone = currentColor.gradientZone;
                    gradientPosition = 1 - gradientPosition;
                }
            } else if (currentColorIndex >= entryList.length) {
                const cidx = Number(entryList[entryList.length - 1][0]);
                const currentColor = GradientColorValues[cidx];
                zone = currentColor.gradientZone;
                gradientPosition = currentColor.gradientPosition;
            } else {
                const cidx = Number(entryList[0][0]);
                const currentColor = GradientColorValues[cidx];
                zone = currentColor.gradientZone;
                gradientPosition = currentColor.gradientPosition;
            }

            const colorN = labels[i];
            colorMap[colorN] = gradientColor(zone, gradientPosition);
        }
    }

    return colorMap;
}

function getInputSetGradientColorMap(colorLabels: Record<string, string>, uniqueValues: string[]) {
    const colorNumbers: Record<string, number> = {};

    for (let i = 0; i < uniqueValues.length; ++i) {
        const value = uniqueValues[i];
        const filteredEntries = _.entries(colorLabels).filter((e) => e[1] === value);

        if (filteredEntries.length > 0) {
            const foundedColor = filteredEntries[0][0];
            colorNumbers[foundedColor] = i;
        }
    }

    return colorNumbers;
}

function putColorLabelIfPresent(
    colorLabels: Record<string, string>,
    color: number,
    label?: string,
) {
    if (label) {
        colorLabels[color] = label;
    }
}

function getGradientColorLabels(colorSchemeParams: ColorScheme) {
    const colorLabels = {};
    putColorLabelIfPresent(colorLabels, GradientColorIndexes.GREEN, colorSchemeParams.green);
    putColorLabelIfPresent(colorLabels, GradientColorIndexes.YELLOW, colorSchemeParams.yellow);
    putColorLabelIfPresent(colorLabels, GradientColorIndexes.RED, colorSchemeParams.red);
    putColorLabelIfPresent(colorLabels, GradientColorIndexes.VIOLET, colorSchemeParams.violet);
    return colorLabels;
}

function getMapOrder(colorNumbers: Record<string, number>) {
    if (_.size(colorNumbers) > 1) {
        const initialKeys = GradientColorValues.filter((color) =>
            _.has(colorNumbers, color.ordinal),
        );

        const firstColor = colorNumbers[initialKeys[0].ordinal];
        const lastColor = colorNumbers[initialKeys[initialKeys.length - 1].ordinal];
        return firstColor - lastColor;
    }

    return 0;
}

function addMissingPointsToGradientMap(colorNumbers: Record<string, number>, setSize: number) {
    const mapOrder = getMapOrder(colorNumbers);
    const allKeys = GradientColorValues;
    const firstKeyOrdinal = allKeys[0].ordinal;
    const lastKeyOrdinal = allKeys[allKeys.length - 1].ordinal;
    if (mapOrder > 0) {
        putIfAbsent(colorNumbers, firstKeyOrdinal, setSize);
        putIfAbsent(colorNumbers, lastKeyOrdinal, 0);
    } else {
        putIfAbsent(colorNumbers, firstKeyOrdinal, 0);
        putIfAbsent(colorNumbers, lastKeyOrdinal, setSize);
    }

    const keys = GradientColorValues.filter((color) => _.has(colorNumbers, color.ordinal));

    const newColorNumber: Record<string, number> = {};
    let i = 0;
    let j = 0;
    while (i < allKeys.length && j < keys.length) {
        const presentKey = keys[j];
        const key = allKeys[i];

        const order = presentKey.ordinal - key.ordinal;
        if (order > 0) {
            if (j > 0) {
                const previousPresentKey = keys[j - 1];
                const pKeyOrdinal = previousPresentKey.ordinal;
                const keyOrdinal = presentKey.ordinal;
                const absentKeyOrdinal = key.ordinal;
                const pKeyNumber = colorNumbers[pKeyOrdinal];
                const keyNumber = colorNumbers[keyOrdinal];
                const absentKeyNumber = Math.trunc(
                    ((keyNumber - pKeyNumber) * (absentKeyOrdinal - pKeyOrdinal)) /
                        (keyOrdinal - pKeyOrdinal) +
                        pKeyNumber,
                );
                newColorNumber[key.ordinal] = absentKeyNumber;
            }
            i++;
        } else if (order === 0) {
            newColorNumber[presentKey.ordinal] = colorNumbers[presentKey.ordinal];
            i++;
            j++;
        } else {
            throw new Error('we must not reach there');
        }
    }
    return newColorNumber;
}

function getGradientColorsPositions(colorLabels: Record<string, string>, uniqueValues: string[]) {
    const colorIndexes = getInputSetGradientColorMap(colorLabels, uniqueValues);
    return addMissingPointsToGradientMap(colorIndexes, uniqueValues.length);
}

function getUniqueGradientedLabels(labels: string[], colorLabels: Record<string, string>) {
    const strings = [];
    strings.push(...labels);
    strings.push(..._.values(colorLabels).filter((s) => s));
    strings.sort(compareTextWithNumber);

    return _.uniqWith(strings, (a, b) => a === b);
}

function gradientScheme(colorSchemeParams: ColorScheme, labelValues: string[]) {
    const colorLabels = getGradientColorLabels(colorSchemeParams);
    const uniqueValues = getUniqueGradientedLabels(labelValues, colorLabels);
    const colorsIndexes = getGradientColorsPositions(colorLabels, uniqueValues);
    return constructColorMap(colorsIndexes, uniqueValues);
}

function autoScheme(colorSchemeParams: ColorScheme, labelValues: string[]) {
    if (isUniqueGradientedLabels(labelValues)) {
        return gradientScheme(colorSchemeParams, labelValues);
    }
    return {};
}

function constructColorScheme(colorSchemeParams: ColorScheme, labelValues: string[]) {
    const type = colorSchemeParams.type || ColorSchemeType.Auto;

    switch (type) {
        case 'gradient':
            return gradientScheme(colorSchemeParams, labelValues);
        case 'default':
            return {};
        case 'automatic':
        default:
            return autoScheme(colorSchemeParams, labelValues);
    }
}

function getColorOrAutoColor(colorScheme: Record<string, LineColor>, label: string): LineColor {
    if (_.has(colorScheme, label)) {
        return colorScheme[label];
    }

    return AUTO_COLOR;
}

function getAlexPetrovColorsForN(n: number) {
    const result = [];
    for (let i = 0; i < n; ++i) {
        result[i] = getColorAlexPetrov(i);
    }
    return result;
}

function getColorsForNamesImpl(names: string[], colorSchemeParams: ColorScheme) {
    const colorScheme = constructColorScheme(colorSchemeParams, names);

    return names.map((name, index) => {
        const lineColor = getColorOrAutoColor(colorScheme, name);

        if (
            lineColor.type === 'gradient' &&
            lineColor.zone !== null &&
            lineColor.position !== null
        ) {
            const zone = GradientZoneValues[lineColor.zone];
            return getGradientColor(lineColor.position, zone.begin, zone.end);
        }

        return getColorAlexPetrov(index);
    });
}

export function getColorsForNames(names: string[], colorSchemeParams?: ColorScheme) {
    const uniqNames = new Set(names);
    const namesForColors =
        uniqNames.size <= 1 ? names.map((_, index) => `uniqName${index}`) : names;

    if (!colorSchemeParams) {
        return getAlexPetrovColorsForN(namesForColors.length);
    }

    try {
        return getColorsForNamesImpl(namesForColors, colorSchemeParams);
    } catch (e) {
        return getAlexPetrovColorsForN(namesForColors.length);
    }
}
