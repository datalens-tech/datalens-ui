export const getLineTimeDistinctValue = (
    distinct: string | null | number,
    prevDistinct: string,
): string => {
    if (distinct === 'null') {
        return prevDistinct;
    }

    return prevDistinct.length > 0 ? `${prevDistinct}; ${distinct}` : `${distinct}`;
};

export function getDistinctValue(value: unknown) {
    return value === null ? 'Null' : String(value);
}
