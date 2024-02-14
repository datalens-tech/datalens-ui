import React from 'react';

import {ConfigItem} from '@gravity-ui/dashkit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEqual from 'lodash/isEqual';
import {
    DATASET_FIELD_TYPES,
    DashTabItemControlData,
    DashTabItemControlSingle,
    DashTabItemControlSourceType,
    Feature,
    StringParams,
    WorkbookId,
} from 'shared';
import type {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {
    ControlCheckbox,
    ControlDatepicker,
    ControlInput,
    ControlRangeDatepicker,
} from 'ui/libs/DatalensChartkit/components/Control/Items/Items';
import {CONTROL_TYPE} from 'ui/libs/DatalensChartkit/modules/constants/constants';
import type {EntityRequestOptions} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import {ResponseSuccessControls} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import {ActiveControl} from 'ui/libs/DatalensChartkit/types';
import {addOperationForValue, unwrapFromArrayAndSkipOperation} from 'ui/units/dash/modules/helpers';
import Utils from 'ui/utils/utils';

import {chartsDataProvider} from '../../../../../libs/DatalensChartkit';
import logger from '../../../../../libs/logger';
import {ControlItemSelect} from '../../Control/ControlItems/ControlItemSelect';
import {Error} from '../../Control/Error/Error';
import {ELEMENT_TYPE, LOAD_STATUS} from '../../Control/constants';
import {ErrorData, GetDistincts, LoadStatus, ValidationErrorData} from '../../Control/types';
import {
    checkDatasetFieldType,
    getDatasetSourceInfo,
    getRequiredLabel,
    getStatus,
    isValidRequiredValue,
} from '../../Control/utils';
import {cancelCurrentRequests, clearLoaderTimer, getControlWidthStyle} from '../utils';

import {getInitialState, reducer} from './store/reducer';
import {
    setErrorData,
    setLoadedData,
    setLoadingItems,
    setSilentLoader,
    setStatus,
    setValidationError,
} from './store/types';

import '../GroupControl.scss';

const b = block('dashkit-plugin-group-control');
const i18n = I18n.keyset('dash.dashkit-plugin-control.view');

type ControlProps = {
    id: string;
    data: DashTabItemControlSingle;
    actualParams: StringParams;
    onStatusChanged: (controlId: string, status: LoadStatus) => void;
    silentLoading: boolean;
    initialParams: ChartInitialParams;
    resolveMeta: (loadedData?: ResponseSuccessControls | null) => void;
    defaults: ConfigItem['defaults'];
    getDistincts?: GetDistincts;
    onChange: (params: StringParams, callChangeByClick?: boolean) => void;
    onInitialParamsUpdate: (initialParams: ChartInitialParams) => void;
    needReload: boolean;
    cancelSource: any;
    workbookId?: WorkbookId;
};

export const Control = ({
    id,
    data,
    actualParams,
    initialParams,
    silentLoading,
    resolveMeta,
    onStatusChanged,
    defaults,
    getDistincts,
    onChange,
    onInitialParamsUpdate,
    needReload,
    cancelSource,
    workbookId,
}: ControlProps) => {
    const [prevNeedReload, setPrevNeedReload] = React.useState(needReload);
    const [
        {status, loadedData, errorData, loadingItems, validationError, isInit, showSilentLoader},
        dispatch,
    ] = React.useReducer(reducer, getInitialState());

    let silentLoaderTimer: NodeJS.Timeout | undefined;

    const setErrorState = (newErrorData: ErrorData, errorStatus: LoadStatus) => {
        const statusResponse = getStatus(errorStatus);
        if (statusResponse) {
            dispatch(
                setErrorData({
                    status: statusResponse,
                    errorData: newErrorData,
                }),
            );
            onStatusChanged(id, statusResponse);
        }
    };

    const setLoadedDataState = (
        newLoadedData: ResponseSuccessControls,
        loadedStatus: LoadStatus,
    ) => {
        //TODO: Add new relations logic
        const newInitialParams = {...defaults, ...newLoadedData?.defaultParams};
        const initialParamsChanged = !isEqual(newInitialParams, initialParams.params);

        if (initialParamsChanged) {
            const updatedInitialParams = {params: newInitialParams};
            onInitialParamsUpdate(updatedInitialParams);
        }

        const statusResponse = getStatus(loadedStatus);
        if (statusResponse) {
            dispatch(setLoadedData({status: statusResponse, loadedData: newLoadedData}));
            onStatusChanged(id, statusResponse);
        }

        const resolveDataArg = status === LOAD_STATUS.SUCCESS ? loadedData : null;
        resolveMeta(resolveDataArg);
    };

    const init = async () => {
        try {
            const payload: EntityRequestOptions = {
                data: {
                    config: {
                        data: {
                            shared: data,
                        },
                        meta: {
                            stype: 'control_dash',
                        },
                    },
                    params: actualParams,
                    ...(workbookId ? {workbookId} : {}),
                },
            };

            dispatch(setStatus({status: LOAD_STATUS.PENDING}));
            onStatusChanged(id, LOAD_STATUS.PENDING);

            const response = await chartsDataProvider.makeRequest(payload);

            if (response === null) {
                return;
            }

            const newLoadedData = response.data;

            newLoadedData.uiScheme = Array.isArray(newLoadedData.uiScheme)
                ? {controls: newLoadedData.uiScheme}
                : newLoadedData.uiScheme;

            if (data.sourceType === DashTabItemControlSourceType.Dataset) {
                checkDatasetFieldType({
                    currentLoadedData: newLoadedData,
                    datasetData: data,
                    actualLoadedData: loadedData,
                    onSucces: setLoadedDataState,
                    onError: setErrorState,
                });
            } else {
                setLoadedDataState(newLoadedData, LOAD_STATUS.SUCCESS);
            }
        } catch (error) {
            logger.logError('DashKit: Control init failed', error);
            console.error('DASHKIT_CONTROL_RUN', error);

            let errorData = null;

            if (error.response && error.response.data) {
                errorData = {
                    data: {error: error.response.data?.error, status: error.response.data?.status},
                    requestId: error.response.headers['x-request-id'],
                };
            } else {
                errorData = {data: {message: error.message}};
            }

            setErrorState(errorData, LOAD_STATUS.FAIL);
        }
    };

    const reload = () => {
        if (!isInit) {
            return;
        }

        clearLoaderTimer(silentLoaderTimer);

        if (data.source.elementType !== ELEMENT_TYPE.SELECT) {
            silentLoaderTimer = setTimeout(() => {
                dispatch(setSilentLoader({silentLoading}));
            }, 800);
        }

        init();
    };

    React.useEffect(() => {
        return () => {
            clearLoaderTimer(silentLoaderTimer);
            cancelCurrentRequests(cancelSource);
        };
    }, []);

    if (status !== LOAD_STATUS.PENDING && silentLoaderTimer) {
        clearLoaderTimer(silentLoaderTimer);
    }

    if (prevNeedReload !== needReload) {
        setPrevNeedReload(needReload);
        if (needReload) {
            reload();
        }
    }

    if (!isInit && status === LOAD_STATUS.INITIAL) {
        init();
    }

    const showItemsLoader = () => {
        dispatch(setLoadingItems({loadingItems: true}));
    };

    const validateValue = (args: ValidationErrorData) => {
        const hasError = isValidRequiredValue(args);
        dispatch(setValidationError({hasError}));

        return hasError;
    };

    const getValidationError = ({
        required,
        value,
    }: {
        required?: boolean;
        value: string | string[];
    }) => {
        let activeValidationError = null;

        if (required) {
            // for first initialization of control
            const initialValidationError = isValidRequiredValue({
                required,
                value,
            })
                ? i18n('value_required')
                : null;
            activeValidationError = validationError || initialValidationError;
        }

        return activeValidationError;
    };

    const onChangeParams = ({value, param}: {value: string | string[]; param: string}) => {
        const newParams = {...actualParams};

        if (param && value !== undefined) {
            newParams[param] = value;
        }

        if (!isEqual(newParams, actualParams)) {
            onChange(newParams);
        }
    };

    const renderControl = () => {
        if (!loadedData || !loadedData?.uiScheme || !('controls' in loadedData.uiScheme)) {
            return null;
        }
        const control = loadedData.uiScheme.controls[0] as ActiveControl;

        if (!control) {
            return null;
        }

        const {param, type} = control;
        const controlData = data as unknown as DashTabItemControlSingle;

        const {source, placementMode, width, title} = controlData;
        const {required, operation, showTitle} = source;

        const preparedValue = unwrapFromArrayAndSkipOperation(actualParams[param]);

        const currentValidationError = getValidationError({
            required,
            value: preparedValue,
        });

        const onChangeControl = (value: string | string[]) => {
            const hasError = validateValue({
                required,
                value,
            });
            dispatch(setValidationError({hasError}));

            if (hasError) {
                return;
            }

            const valueWithOperation = addOperationForValue({
                value,
                operation,
            });

            onChangeParams({value: valueWithOperation, param});
        };

        const innerLabel = showTitle ? getRequiredLabel({title, required}) : '';
        const style = getControlWidthStyle(placementMode, width);

        const props: Record<string, unknown> = {
            param,
            type: control.type,
            widgetId: id,
            className: b('item'),
            value: preparedValue,
            onChange: onChangeControl,
            innerLabel,
            required,
            hasValidationError: Boolean(currentValidationError),
            style,
        };

        if (type === 'range-datepicker' || type === 'datepicker') {
            let fieldType = source?.fieldType || null;
            if (controlData.sourceType === DashTabItemControlSourceType.Dataset) {
                const {datasetFieldType} = getDatasetSourceInfo({
                    data: controlData,
                    actualLoadedData: loadedData,
                });
                fieldType = datasetFieldType;
            }
            if (
                fieldType === DATASET_FIELD_TYPES.DATETIME ||
                fieldType === DATASET_FIELD_TYPES.GENERICDATETIME
            ) {
                props.timeFormat = 'HH:mm:ss';
            }
        }

        if (type === 'input') {
            props.placeholder =
                Utils.isEnabledFeature(Feature.SelectorRequiredValue) && currentValidationError
                    ? currentValidationError
                    : control.placeholder;
        }

        switch (control.type) {
            case CONTROL_TYPE.SELECT:
                return (
                    <ControlItemSelect
                        id={id}
                        data={data}
                        defaults={defaults}
                        status={status}
                        loadedData={loadedData}
                        loadingItems={loadingItems}
                        actualParams={actualParams}
                        onChange={onChangeParams}
                        init={init}
                        showItemsLoader={showItemsLoader}
                        validationError={validationError}
                        errorData={errorData}
                        validateValue={validateValue}
                        getDistincts={getDistincts}
                        classMixin={b('item')}
                        selectProps={{innerLabel, style}}
                    />
                );
            case CONTROL_TYPE.INPUT:
                return <ControlInput {...props} />;
            case CONTROL_TYPE.DATEPICKER:
                return <ControlDatepicker {...props} />;
            case CONTROL_TYPE.RANGE_DATEPICKER:
                return <ControlRangeDatepicker returnInterval={true} {...props} />;
            case CONTROL_TYPE.CHECKBOX:
                return <ControlCheckbox {...props} label={innerLabel} />;
        }

        return null;
    };

    const renderSilentLoader = () => {
        if (showSilentLoader) {
            return (
                <div className={b('loader', {silent: true})}>
                    <Loader size="s" />
                </div>
            );
        }

        return null;
    };

    switch (status) {
        case LOAD_STATUS.INITIAL:
        case LOAD_STATUS.PENDING:
            if (!silentLoading || !loadedData || !loadedData.uiScheme) {
                const {placementMode, width} = data as unknown as DashTabItemControlData;
                const style = getControlWidthStyle(placementMode, width);

                return (
                    <div className={b('item-loader')} style={style}>
                        <Loader size="s" />
                    </div>
                );
            }
            break;
        case LOAD_STATUS.FAIL: {
            return <Error errorData={errorData} onClickRetry={() => reload()} />;
        }
    }

    return (
        <React.Fragment>
            {renderSilentLoader()}
            {renderControl()}
        </React.Fragment>
    );
};
