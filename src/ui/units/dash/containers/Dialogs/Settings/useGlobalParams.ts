import React from 'react';

import {i18n} from 'i18n';
import type {DashSettingsGlobalParams} from 'shared';

import {
    clearEmptyParams,
    removeParam,
    updateParamTitle,
    updateParamValue,
    validateParamTitle,
} from '../../../components/ParamsSettings/helpers';

type UseGlobalParamsArgs = {
    initialParams?: DashSettingsGlobalParams;
};

export function useGlobalParams({initialParams = {}}: UseGlobalParamsArgs = {}) {
    const [globalParams, setGlobalParams] = React.useState<DashSettingsGlobalParams>(initialParams);
    const [isGlobalParamsError, setIsGlobalParamsError] = React.useState(false);

    const localParams = React.useMemo(() => clearEmptyParams(globalParams), [globalParams]);

    const handleChangeGlobalParams = React.useCallback((params: DashSettingsGlobalParams) => {
        setIsGlobalParamsError(
            Object.keys(params).some((param) => Boolean(validateParamTitle(param))),
        );
        setGlobalParams(params);
    }, []);

    const handleEditParamTitle = React.useCallback(
        (paramTitleOld: string, paramTitle: string) => {
            handleChangeGlobalParams(updateParamTitle(localParams, paramTitleOld, paramTitle));
        },
        [localParams, handleChangeGlobalParams],
    );

    const handleEditParamValue = React.useCallback(
        (paramTitle: string, paramValue: string[]) => {
            handleChangeGlobalParams(updateParamValue(localParams, paramTitle, paramValue));
        },
        [localParams, handleChangeGlobalParams],
    );

    const handleRemoveParam = React.useCallback(
        (paramTitle: string) => {
            handleChangeGlobalParams(removeParam(localParams, paramTitle));
        },
        [localParams, handleChangeGlobalParams],
    );

    const handleRemoveAllParams = React.useCallback(() => {
        handleChangeGlobalParams({});
    }, [handleChangeGlobalParams]);

    const handleValidateParamTitle = React.useCallback((paramTitle: string) => {
        const errorCode = validateParamTitle(paramTitle);

        if (errorCode) {
            return new Error(i18n('dash.params-button-dialog.view', `context_${errorCode}`));
        }

        return null;
    }, []);

    const reset = React.useCallback((newParams: DashSettingsGlobalParams = {}) => {
        setGlobalParams(newParams);
        setIsGlobalParamsError(false);
    }, []);

    return {
        globalParams,
        isGlobalParamsError,
        localParams,
        handleEditParamTitle,
        handleEditParamValue,
        handleRemoveParam,
        handleRemoveAllParams,
        handleValidateParamTitle,
        reset,
    };
}
