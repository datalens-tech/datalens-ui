import React from 'react';

import {ResponseSuccessControls} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';

import {ErrorData, LoadStatus} from '../../../Control/types';

export type Dispatch = React.Dispatch<Action>;

export type State = {
    status: LoadStatus;
    loadedData: null | ResponseSuccessControls;
    errorData: null | ErrorData;
    loadingItems: boolean;
    validationError: null | string;
    isInit: boolean;
};

type SetErrorData = {
    type: 'SET_ERROR_DATA';
    payload: {status: LoadStatus; errorData: ErrorData};
};
export const setErrorData = (payload: SetErrorData['payload']): SetErrorData => {
    return {
        type: 'SET_ERROR_DATA',
        payload,
    };
};
type SetLoadedData = {
    type: 'SET_LOADED_DATA';
    payload: {status: LoadStatus; loadedData: ResponseSuccessControls};
};
export const setLoadedData = (payload: SetLoadedData['payload']): SetLoadedData => {
    return {
        type: 'SET_LOADED_DATA',
        payload,
    };
};

type SetLoadingItems = {
    type: 'SET_LOADING_ITEMS';
    payload: {loadingItems: boolean};
};
export const setLoadingItems = (payload: SetLoadingItems['payload']): SetLoadingItems => {
    return {
        type: 'SET_LOADING_ITEMS',
        payload,
    };
};

type SetValidationError = {
    type: 'SET_VALIDATION_ERROR';
    payload: {hasError?: boolean};
};
export const setValidationError = (payload: SetValidationError['payload']): SetValidationError => {
    return {
        type: 'SET_VALIDATION_ERROR',
        payload,
    };
};

type SetStatus = {
    type: 'SET_STATUS';
    payload: {status: LoadStatus};
};
export const setStatus = (payload: SetStatus['payload']): SetStatus => {
    return {
        type: 'SET_STATUS',
        payload,
    };
};

type SetIsInit = {
    type: 'SET_IS_INIT';
    payload: {isInit: boolean};
};
export const setIsInit = (payload: SetIsInit['payload']): SetIsInit => {
    return {
        type: 'SET_IS_INIT',
        payload,
    };
};

export type Action =
    | SetErrorData
    | SetLoadedData
    | SetLoadingItems
    | SetValidationError
    | SetStatus
    | SetIsInit;
