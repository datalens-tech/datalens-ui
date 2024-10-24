import type React from 'react';

import type {ResponseSuccessSingleControl} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import type {ActiveControl} from 'ui/libs/DatalensChartkit/types';

import type {ErrorData, LoadStatus} from '../../../Control/types';

export type Dispatch = React.Dispatch<Action>;

export type State = {
    status: LoadStatus;
    loadedData: null | ResponseSuccessSingleControl;
    errorData: null | ErrorData;
    loadingItems: boolean;
    validationError: null | string;
    isInit: boolean;
    showSilentLoader: boolean;
    control: null | ActiveControl;
};

export const CONTROL_SET_ERROR_DATA = Symbol('control/SET_ERROR_DATA');
type SetErrorData = {
    type: typeof CONTROL_SET_ERROR_DATA;
    payload: {status: LoadStatus; errorData: ErrorData};
};
export const setErrorData = (payload: SetErrorData['payload']): SetErrorData => {
    return {
        type: CONTROL_SET_ERROR_DATA,
        payload,
    };
};

export const CONTROL_SET_LOADED_DATA = Symbol('control/SET_LOADED_DATA');
type SetLoadedData = {
    type: typeof CONTROL_SET_LOADED_DATA;
    payload: {status: LoadStatus; loadedData: ResponseSuccessSingleControl};
};
export const setLoadedData = (payload: SetLoadedData['payload']): SetLoadedData => {
    return {
        type: CONTROL_SET_LOADED_DATA,
        payload,
    };
};

export const CONTROL_SET_LOADING_ITEMS = Symbol('control/SET_LOADING_ITEMS');
type SetLoadingItems = {
    type: typeof CONTROL_SET_LOADING_ITEMS;
    payload: {loadingItems: boolean};
};
export const setLoadingItems = (payload: SetLoadingItems['payload']): SetLoadingItems => {
    return {
        type: CONTROL_SET_LOADING_ITEMS,
        payload,
    };
};

export const CONTROL_SET_VALIDATION_ERROR = Symbol('control/SET_VALIDATION_ERROR');
type SetValidationError = {
    type: typeof CONTROL_SET_VALIDATION_ERROR;
    payload: {hasError?: boolean};
};
export const setValidationError = (payload: SetValidationError['payload']): SetValidationError => {
    return {
        type: CONTROL_SET_VALIDATION_ERROR,
        payload,
    };
};

export const CONTROL_SET_STATUS = Symbol('control/SET_STATUS');
type SetStatus = {
    type: typeof CONTROL_SET_STATUS;
    payload: {status: LoadStatus};
};
export const setStatus = (payload: SetStatus['payload']): SetStatus => {
    return {
        type: CONTROL_SET_STATUS,
        payload,
    };
};

export const CONTROL_SET_IS_INIT = Symbol('control/SET_IS_INIT');
type SetIsInit = {
    type: typeof CONTROL_SET_IS_INIT;
    payload: {isInit: boolean};
};
export const setIsInit = (payload: SetIsInit['payload']): SetIsInit => {
    return {
        type: CONTROL_SET_IS_INIT,
        payload,
    };
};

export const CONTROL_SET_SILENT_LOADER = Symbol('control/SET_SILENT_LOADER');
type SetSilentLoader = {
    type: typeof CONTROL_SET_SILENT_LOADER;
    payload: {silentLoading: boolean};
};
export const setSilentLoader = (payload: SetSilentLoader['payload']): SetSilentLoader => {
    return {
        type: CONTROL_SET_SILENT_LOADER,
        payload,
    };
};

export type Action =
    | SetErrorData
    | SetLoadedData
    | SetLoadingItems
    | SetValidationError
    | SetStatus
    | SetIsInit
    | SetSilentLoader;
