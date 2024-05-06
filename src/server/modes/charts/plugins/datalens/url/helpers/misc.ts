import {StringParams} from '../../../../../../../shared';
import {getParam} from '../../../../../../components/charts-engine/components/processor/paramsUtils';

export const isParamValid = (value: unknown) => {
    if (typeof value === 'undefined' || value === null) {
        return false;
    }

    if (typeof value === 'number' && isNaN(value)) {
        return false;
    }

    if (
        Array.isArray(value) &&
        (value.length === 0 || value.some((x: string | number | null) => x === null))
    ) {
        return false;
    }

    if (Array.isArray(value) && value.length === 1 && value[0] === '') {
        return false;
    }

    return true;
};

export const isRawParamValid = (paramValue: unknown) => {
    if (paramValue === null) {
        return false;
    }

    if (paramValue === '') {
        return false;
    }

    if (Array.isArray(paramValue) && paramValue.length === 1 && paramValue[0] === '') {
        return false;
    }

    return true;
};

export const getTreeState = (params: StringParams) => {
    return ([] as string[]).concat(getParam('treeState', params)).filter(Boolean);
};
