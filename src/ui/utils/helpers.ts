import {cloneDeep, unset} from 'lodash';

/**
 * @param{object} obj object for filter
 * @param {Array<string>} keys paths to object fields to be deleted
 * @returns {object} filtered object
 */
export const getFilteredObject = <T = unknown>(obj: T, keys: string[]) => {
    const result = cloneDeep(obj);

    keys.forEach((key) => {
        unset(result, key);
    });

    return result;
};

// TODO: CHARTS-7304
export const getSelectedValueForSelect = (value: string[], valueList: string[]): string[] => {
    const map = value.reduce((acc, s) => {
        acc[s] = true;
        return acc;
    }, {} as Record<string, boolean>);

    return valueList.filter((v) => map[v]);
};
