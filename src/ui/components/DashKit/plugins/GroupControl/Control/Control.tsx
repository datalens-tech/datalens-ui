import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEqual from 'lodash/isEqual';
import {
    DATASET_FIELD_TYPES,
    DashTabItemControlData,
    DashTabItemControlDataset,
    DashTabItemControlElementType,
    DashTabItemControlManual,
    DashTabItemControlSingle,
    DashTabItemControlSourceType,
    StringParams,
    WorkbookId,
} from 'shared';
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

import {chartsDataProvider} from '../../../../../libs/DatalensChartkit';
import logger from '../../../../../libs/logger';
import {ControlItemSelect} from '../../Control/ControlItems/ControlItemSelect';
import {Error} from '../../Control/Error/Error';
import {ELEMENT_TYPE, LOAD_STATUS} from '../../Control/constants';
import {ErrorData, GetDistincts, LoadStatus, ValidationErrorData} from '../../Control/types';
import {
    checkDatasetFieldType,
    getDatasetSourceInfo,
    getLabels,
    getStatus,
    isValidRequiredValue,
} from '../../Control/utils';
import DebugInfoTool from '../../DebugInfoTool/DebugInfoTool';
import {ExtendedLoadedData} from '../types';
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
    params: StringParams;
    onStatusChanged: ({
        controlId,
        status,
        loadedData,
    }: {
        controlId: string;
        status: LoadStatus;
        loadedData?: ExtendedLoadedData | null;
    }) => void;
    silentLoading: boolean;
    getDistincts?: GetDistincts;
    onChange: ({
        params,
        callChangeByClick,
        controlId,
    }: {
        params: StringParams;
        callChangeByClick?: boolean;
        controlId?: string;
    }) => void;
    needReload: boolean;
    cancelSource: any;
    workbookId?: WorkbookId;
};

export const Control = ({
    id,
    data,
    params,
    silentLoading,
    onStatusChanged,
    getDistincts,
    onChange,
    needReload,
    cancelSource,
    workbookId,
}: ControlProps) => {
    const [prevNeedReload, setPrevNeedReload] = React.useState(needReload);

    const [
        {
            status,
            loadedData,
            errorData,
            loadingItems,
            validationError,
            isInit,
            showSilentLoader,
            control,
        },
        dispatch,
    ] = React.useReducer(reducer, getInitialState());

    const [prevParams, setPrevParams] = React.useState<string | string[] | null>(
        control?.param ? params[control.param] : null,
    );

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
            onStatusChanged({controlId: id, status: statusResponse});
        }
    };

    const setLoadedDataState = (
        newLoadedData: ResponseSuccessControls,
        loadedStatus: LoadStatus,
    ) => {
        const statusResponse = getStatus(loadedStatus);
        if (statusResponse) {
            dispatch(setLoadedData({status: statusResponse, loadedData: newLoadedData}));
            onStatusChanged({
                controlId: id,
                status: statusResponse,
                loadedData: newLoadedData
                    ? {
                          ...newLoadedData,
                          sourceType: data.sourceType,
                          id: data.id,
                      }
                    : null,
            });
        }
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
                    params,
                    ...(workbookId ? {workbookId} : {}),
                },
            };

            dispatch(setStatus({status: LOAD_STATUS.PENDING}));
            onStatusChanged({controlId: id, status: LOAD_STATUS.PENDING});

            const response = await chartsDataProvider.makeRequest(payload);

            if (response === null) {
                return;
            }

            const newLoadedData = response.data;

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
            onStatusChanged({controlId: id, status: LOAD_STATUS.DESTROYED});
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

    if (control?.param && isEqual(prevParams, params[control?.param])) {
        setPrevParams(params[control?.param]);
        reload();
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
        const newParam = {[param]: value};

        if (!isEqual(param, newParam)) {
            onChange({params: {[param]: value}, controlId: id});
        }
    };

    const getTypeProps = (
        control: ActiveControl,
        controlData: DashTabItemControlSingle,
        currentValidationError: string | null,
    ) => {
        const {source} = controlData;
        const {type} = control;

        const typeProps: {
            timeFormat?: string;
            placeholder?: string;
        } = {};

        if (type === 'range-datepicker' || type === 'datepicker') {
            let fieldType = source?.fieldType || null;
            if (controlData.sourceType === DashTabItemControlSourceType.Dataset) {
                const {datasetFieldType} = getDatasetSourceInfo({
                    data: controlData,
                    actualLoadedData: loadedData,
                });
                fieldType = datasetFieldType;
            }
            // Check 'datetime' for backward compatibility
            if (fieldType === 'datetime' || fieldType === DATASET_FIELD_TYPES.GENERICDATETIME) {
                typeProps.timeFormat = 'HH:mm:ss';
            }
        }

        if (type === 'input') {
            typeProps.placeholder = currentValidationError || control.placeholder;
        }

        return typeProps;
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

    const renderOverlay = () => {
        const paramId =
            (data.source as DashTabItemControlDataset['source']).datasetFieldId ||
            (data.source as DashTabItemControlManual['source']).fieldName ||
            control?.param ||
            '';

        const debugData = [
            {label: 'itemId', value: id},
            {label: 'paramId', value: paramId},
        ];

        return (
            <React.Fragment>
                <DebugInfoTool data={debugData} modType="top" />
                {renderSilentLoader()}
            </React.Fragment>
        );
    };

    const renderControl = () => {
        const controlData = data as unknown as DashTabItemControlSingle;
        const {source, placementMode, width} = controlData;
        const {required, operation} = source;

        const {label, innerLabel} = getLabels(controlData);
        const style = getControlWidthStyle(placementMode, width);

        if (controlData.source.elementType === DashTabItemControlElementType.Select) {
            return (
                <ControlItemSelect
                    id={id}
                    data={data}
                    defaults={data.defaults || {}}
                    status={status}
                    loadedData={loadedData}
                    loadingItems={loadingItems}
                    actualParams={params}
                    onChange={onChangeParams}
                    init={init}
                    showItemsLoader={showItemsLoader}
                    validationError={validationError}
                    errorData={errorData}
                    validateValue={validateValue}
                    getDistincts={getDistincts}
                    classMixin={b('item')}
                    labelMixin={b('item-label')}
                    selectProps={{innerLabel, label, style, limitLabel: true}}
                    renderOverlay={renderOverlay}
                />
            );
        }

        if (status === LOAD_STATUS.FAIL || !control) {
            return (
                <div className={b('item-stub', {error: true})} style={style}>
                    <Error errorData={errorData} onClickRetry={handleClickRetry} />
                </div>
            );
        }

        const {param} = control;

        const preparedValue = unwrapFromArrayAndSkipOperation(params[param]);

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

        const props: Record<string, unknown> = {
            param,
            type: control.type,
            widgetId: id,
            className: b('item'),
            labelClassName: b('item-label'),
            value: preparedValue,
            onChange: onChangeControl,
            label,
            innerLabel,
            required,
            hasValidationError: Boolean(currentValidationError),
            style,
            renderOverlay,
            hint: controlData.source.showHint ? controlData.source.hint : undefined,
            ...getTypeProps(control, controlData, currentValidationError),
        };

        switch (control.type) {
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

    const handleClickRetry = () => {
        reload();
    };

    const {placementMode, width} = data as unknown as DashTabItemControlData;
    const style = getControlWidthStyle(placementMode, width);

    if ((status === LOAD_STATUS.INITIAL || status === LOAD_STATUS.PENDING) && !control) {
        return (
            <div className={b('item-stub')} style={style}>
                <Loader size="s" />
            </div>
        );
    }

    return renderControl();
};
