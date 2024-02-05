import React from 'react';

import {ConfigItem, ConfigItemData} from '@gravity-ui/dashkit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEqual from 'lodash/isEqual';
import {
    DATASET_FIELD_TYPES,
    DATASET_IGNORED_DATA_TYPES,
    DashTabItemControlData,
    DashTabItemControlDataset,
    DashTabItemControlManual,
    DashTabItemControlSourceType,
    Feature,
    StringParams,
} from 'shared';
import {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {
    ControlCheckbox,
    ControlDatepicker,
    ControlInput,
    ControlRangeDatepicker,
} from 'ui/libs/DatalensChartkit/components/Control/Items/Items';
import {CONTROL_TYPE} from 'ui/libs/DatalensChartkit/modules/constants/constants';
import {ResponseSuccessControls} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import {ActiveControl} from 'ui/libs/DatalensChartkit/types';
import {addOperationForValue, unwrapFromArrayAndSkipOperation} from 'ui/units/dash/modules/helpers';
import Utils from 'ui/utils/utils';

import {chartsDataProvider} from '../../../../../libs/DatalensChartkit';
import logger from '../../../../../libs/logger';
import {ControlItemSelect} from '../../Control/ControlItems/ControlItemSelect';
import {Error} from '../../Control/Error/Error';
import {LOAD_STATUS} from '../../Control/constants';
import {ErrorData, GetDistincts, LoadStatus, ValidationErrorData} from '../../Control/types';
import {
    getDatasetSourceInfo,
    getLabels,
    getStatus,
    isValidRequiredValue,
} from '../../Control/utils';
import {getControlWidth} from '../utils';

import {getInitialState, reducer} from './store/reducer';
import {
    setErrorData,
    setLoadedData,
    setLoadingItems,
    setStatus,
    setValidationError,
} from './store/types';

import '../GroupControl.scss';

const b = block('dashkit-plugin-group-control');
const i18n = I18n.keyset('dash.dashkit-plugin-control.view');
const i18nError = I18n.keyset('dash.dashkit-control.error');

type ControlProps = {
    id: string;
    data: ConfigItemData;
    actualParams: StringParams;
    showSilentLoader: boolean;
    onStatusChanged: (status: LoadStatus) => void;
    silentLoading: boolean;
    initialParams: ChartInitialParams;
    resolveMeta: (loadedData?: ResponseSuccessControls | null) => void;
    defaults: ConfigItem['defaults'];
    getDistincts?: GetDistincts;
    onChange: (params: StringParams, callChangeByClick?: boolean) => void;
    onInitialParamsUpdate: (initialParams: ChartInitialParams) => void;
    skipReload: boolean;
};

export const Control = ({
    id,
    data,
    actualParams,
    initialParams,
    showSilentLoader,
    silentLoading,
    resolveMeta,
    onStatusChanged,
    defaults,
    getDistincts,
    onChange,
    skipReload,
    onInitialParamsUpdate,
}: ControlProps) => {
    // const [status, setStatus] = React.useState(LOAD_STATUS.PENDING);
    // const [loadedData, setLoadedData] = React.useState<ResponseSuccessControls | null>(null);
    // const [errorData, setErrorData] = React.useState<ErrorData | null>(null);
    // const [loadingItems, setLoadingItems] = React.useState(false);
    // const [validationError, setValidationError] = React.useState(null);

    const [{status, loadedData, errorData, loadingItems, validationError, isInit}, dispatch] =
        React.useReducer(reducer, getInitialState());

    const setErrorState = (newErrorData: ErrorData, errorStatus: LoadStatus) => {
        const statusResponse = getStatus(errorStatus);
        if (statusResponse) {
            dispatch(
                setErrorData({
                    status: statusResponse,
                    errorData: newErrorData,
                }),
            );
            onStatusChanged(statusResponse);
        }
    };

    const setLoadedDataState = (
        newLoadedData: ResponseSuccessControls,
        loadedStatus: LoadStatus,
    ) => {
        //TODO: Add new relations logic
        const newInitialParams = {...loadedData?.defaultParams, ...defaults};
        const initialParamsChanged = !isEqual(newInitialParams, initialParams.params);

        if (initialParamsChanged) {
            const updatedInitialParams = {params: newInitialParams};
            onInitialParamsUpdate(updatedInitialParams);
        }

        const statusResponse = getStatus(loadedStatus);
        if (statusResponse) {
            dispatch(setLoadedData({status: statusResponse, loadedData: newLoadedData}));

            onStatusChanged(statusResponse);
        }

        const resolveDataArg = status === LOAD_STATUS.SUCCESS ? loadedData : null;
        resolveMeta(resolveDataArg);
    };

    const checkDatasetFieldType = (currentLoadedData: ResponseSuccessControls) => {
        const {datasetFieldType} = getDatasetSourceInfo({
            currentLoadedData: currentLoadedData,
            data,
            actualLoadedData: loadedData,
        });

        if (
            datasetFieldType &&
            DATASET_IGNORED_DATA_TYPES.includes(datasetFieldType as DATASET_FIELD_TYPES)
        ) {
            const datasetErrorData = {
                data: {
                    title: i18nError('label_field-error-title'),
                    message: i18nError('label_field-error-text'),
                },
            };
            setErrorState(datasetErrorData, LOAD_STATUS.FAIL);
        } else {
            setLoadedDataState(currentLoadedData, LOAD_STATUS.SUCCESS);
        }
    };

    const init = async () => {
        try {
            const payload = {
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
                },
            };

            dispatch(setStatus({status: LOAD_STATUS.PENDING}));

            // @ts-ignore
            const response = await chartsDataProvider.makeRequest(payload);

            if (response === null) {
                return;
            }

            const newLoadedData = response.data;

            newLoadedData.uiScheme = Array.isArray(newLoadedData.uiScheme)
                ? {controls: newLoadedData.uiScheme}
                : newLoadedData.uiScheme;

            if (data.sourceType === DashTabItemControlSourceType.Dataset) {
                checkDatasetFieldType(newLoadedData);
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

    const onChangeParams = (
        controlData: DashTabItemControlManual | DashTabItemControlDataset,
        value: string | string[],
        param?: string,
    ) => {
        const {source} = controlData;
        const {required, operation} = source;

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

        const newParams = {...actualParams};

        if (param && value !== undefined) {
            newParams[param] = valueWithOperation;
        }

        if (!isEqual(newParams, actualParams)) {
            onChange(newParams);
        }
    };

    const reload = () => {
        if (skipReload || !isInit) {
            return;
        }

        dispatch(setStatus({status: LOAD_STATUS.PENDING}));
        init();
    };

    const renderControl = () => {
        if (!loadedData || !loadedData?.uiScheme) {
            return null;
        }
        const uiScheme = loadedData.uiScheme;
        const control = (
            'controls' in uiScheme ? uiScheme.controls[0] : uiScheme[0]
        ) as ActiveControl;

        if (!control) {
            return null;
        }

        const {param, type} = control;
        const controlData = data as unknown as DashTabItemControlData;

        const {source, placementMode, width} = controlData;
        const {required} = source;

        const preparedValue = unwrapFromArrayAndSkipOperation(actualParams[param]);

        const currentValidationError = getValidationError({
            required,
            value: preparedValue,
        });

        const onChangeControl = ({value}: {value: string | string[]}) => {
            onChangeParams(controlData, value, param);
        };

        const {label, innerLabel} = getLabels({controlData});
        const controlWidth = getControlWidth(placementMode, width);

        const props: Record<string, unknown> = {
            ...control,
            widgetId: id,
            className: b('item'),
            key: param,
            value: preparedValue,
            onChange: onChangeControl,
            innerLabel,
            label,
            required,
            hasValidationError: Boolean(currentValidationError),
            width: controlWidth,
        };

        if (type === 'range-datepicker' || type === 'datepicker') {
            let fieldType = source?.fieldType || null;
            if (controlData.sourceType === DashTabItemControlSourceType.Dataset) {
                const {datasetFieldType} = getDatasetSourceInfo({
                    data,
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
                        onChange={onChangeControl}
                        init={init}
                        showItemsLoader={showItemsLoader}
                        validationError={validationError}
                        errorData={errorData}
                        validateValue={validateValue}
                        getDistincts={getDistincts}
                        classMixin={b('item')}
                        width={controlWidth}
                    />
                );
            case CONTROL_TYPE.INPUT:
                return <ControlInput {...props} />;
            case CONTROL_TYPE.DATEPICKER:
                return <ControlDatepicker {...props} />;
            case CONTROL_TYPE.RANGE_DATEPICKER:
                return <ControlRangeDatepicker returnInterval={true} {...props} />;
            case CONTROL_TYPE.CHECKBOX:
                return <ControlCheckbox {...props} />;
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

    // const source = (data as unknown as DashTabItemControlManual | DashTabItemControlDataset).source;

    // const paramIdDebug = ((source as DashTabItemControlDataset['source']).datasetFieldId ||
    //     (source as DashTabItemControlManual['source']).fieldName ||
    //     data.param ||
    //     '') as string;

    const {placementMode, width} = data as unknown as DashTabItemControlData;
    const controlWidth = getControlWidth(placementMode, width);

    switch (status) {
        case LOAD_STATUS.INITIAL:
        case LOAD_STATUS.PENDING:
            if (!silentLoading || !loadedData || !loadedData.uiScheme) {
                return (
                    <div className={b('item-loader')} style={{width: controlWidth}}>
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
