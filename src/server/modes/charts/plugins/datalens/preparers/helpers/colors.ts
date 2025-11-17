import type {RGBColor} from '../../../../../../../shared';

// the algorithm is taken almost as is from d3.interpolateRgb Basis
// (https://d3js.org/d3-interpolate/color#interpolateRgbBasis)
export function interpolateRgbBasis(colors: RGBColor[]) {
    const red: number[] = [],
        green: number[] = [],
        blue: number[] = [];

    colors.forEach((color, index) => {
        red[index] = color.red || 0;
        green[index] = color.green || 0;
        blue[index] = color.blue || 0;
    });

    const redFn = spline(red);
    const greenFn = spline(green);
    const blueFn = spline(blue);

    return function (value: number) {
        const result: RGBColor = {
            red: Math.round(redFn(value)),
            green: Math.round(greenFn(value)),
            blue: Math.round(blueFn(value)),
        };

        return result;
    };
}

function basis(t1: number, v0: number, v1: number, v2: number, v3: number) {
    const t2 = t1 * t1,
        t3 = t2 * t1;

    return (
        ((1 - 3 * t1 + 3 * t2 - t3) * v0 +
            (4 - 6 * t2 + 3 * t3) * v1 +
            (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 +
            t3 * v3) /
        6
    );
}

function spline(colorValues: number[]) {
    const n = colorValues.length - 1;

    return function (value: number) {
        const i =
                value <= 0
                    ? (value = 0)
                    : value >= 1
                      ? ((value = 1), n - 1)
                      : Math.floor(value * n),
            v1 = colorValues[i],
            v2 = colorValues[i + 1],
            v0 = i > 0 ? colorValues[i - 1] : 2 * v1 - v2,
            v3 = i < n - 1 ? colorValues[i + 2] : 2 * v2 - v1;
        return basis((value - i / n) * n, v0, v1, v2, v3);
    };
}