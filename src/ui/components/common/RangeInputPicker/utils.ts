import range from 'lodash/range';

export const prepareAvailableValues = (availableValues?: number[]): number[] | undefined => {
    if (!availableValues || !availableValues.length) {
        return undefined;
    }

    return [...availableValues].sort((v1, v2) => v1 - v2);
};

export const prepareValue = ({
    value = 0,
    min = 0,
    max = 100,
}: {
    value?: number;
    min?: number;
    max?: number;
}) => {
    if (value > max) {
        return max;
    }
    if (value < min) {
        return min;
    }

    return value;
};

export const getInfoPoints = ({
    infoPointsCount,
    min,
    max,
    values,
}: {
    infoPointsCount: number;
    min: number;
    max: number;
    values?: number[];
}) => {
    let mapInfoPoints;

    if (values && infoPointsCount >= values.length) {
        return values;
    }

    if (infoPointsCount < 1) {
        return [];
    }

    if (infoPointsCount === 1) {
        return [min];
    }

    if (!values || !values.length) {
        const step = Math.abs(max - min) / (infoPointsCount - 1);
        mapInfoPoints = (el: number): number => Math.round((min + step * el) * 100) / 100;
    } else {
        const step = values.length / infoPointsCount;
        mapInfoPoints = (el: number, i: number, arr: number[]) => {
            let index = Math.ceil(el * step);
            if (i === arr.length - 1) {
                index = values.length - 1;
            }
            return values[index];
        };
    }

    return range(0, infoPointsCount).map(mapInfoPoints);
};

export const getParsedValue = (textValue: string, parse?: (value: string) => number): number => {
    return parse ? parse(textValue) : parseFloat(textValue);
};

export const getTextValue = (value: number, format?: (value: number) => string): string => {
    return format ? format(value) : value.toString();
};

export const getClosestValue = (value: number, values?: number[]): number => {
    if (!values || !values.length) {
        return value;
    }

    let low = 0;
    let hi = values.length - 1;

    while (hi - low > 1) {
        const mid = Math.floor((low + hi) / 2);
        if (values[mid] < value) {
            low = mid;
        } else {
            hi = mid;
        }
    }

    const left = values[low];
    const right = values[hi];
    return value - left <= right - value ? left : right;
};
