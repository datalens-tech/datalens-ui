import {registry} from '../../../../registry';

import type {ParamsSettingData} from './types';

export const clearEmptyParams = (params?: ParamsSettingData) => {
    if (!params) {
        return {} as ParamsSettingData;
    }

    return Object.entries(params)
        .filter(([paramTitle]) => paramTitle.trim() !== '')
        .reduce<ParamsSettingData>((filteredParams, [title, value]) => {
            filteredParams[title] = value;
            return filteredParams;
        }, {} as ParamsSettingData);
};

export const updateParamTitle = (
    params: ParamsSettingData,
    paramTitleOld: string,
    paramTitle: string,
) => {
    let newParams = {};
    if (paramTitleOld === '') {
        newParams = {...params, [paramTitle]: params[paramTitle] || []};
    } else {
        newParams = Object.entries(params).reduce<ParamsSettingData>((result, [title, value]) => {
            if (title === paramTitleOld) {
                result[paramTitle] = value;
            } else {
                result[title] = value;
            }
            return result;
        }, {} as ParamsSettingData);
    }

    return newParams;
};

export const updateParamValue = (
    params: ParamsSettingData,
    paramTitle: string,
    paramValue: string[],
) => {
    return Object.entries(params).reduce<ParamsSettingData>((result, [key, value]) => {
        if (key === paramTitle) {
            result[key] = paramValue;
        } else {
            result[key] = value;
        }
        return result;
    }, {});
};

export const removeParam = (params: ParamsSettingData, paramTitle: string) => {
    return Object.entries(params).reduce<ParamsSettingData>((result, [key, value]) => {
        if (key !== paramTitle) {
            result[key] = value;
        }
        return result;
    }, {} as ParamsSettingData);
};

export const validateParamTitleOnlyUnderscore = (paramTitle: string) => {
    const titleTrimmed = paramTitle.trim();

    if (/^_/g.test(titleTrimmed)) {
        return 'invalid-format';
    }

    return null;
};

export const validateParamTitle = (paramTitle: string) => {
    const titleTrimmed = paramTitle.trim();

    if (/^_/g.test(titleTrimmed)) {
        return 'invalid-format';
    }

    const {getRestrictedParamNames} = registry.common.functions.getAll();

    if (getRestrictedParamNames().includes(titleTrimmed)) {
        return 'restricted-param';
    }

    return null;
};

export const convertParamValueToArray = (paramValue?: string | string[]): string[] => {
    if (paramValue === undefined || paramValue === '') {
        return [];
    }

    if (Array.isArray(paramValue)) {
        return paramValue.map((val) => (val || '').toString().trim()).filter((val) => val !== '');
    }

    return [(paramValue || '').toString().trim()];
};
