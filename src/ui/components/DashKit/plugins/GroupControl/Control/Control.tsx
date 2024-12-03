import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import type {CancelTokenSource} from 'axios';
import axios from 'axios';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEqual from 'lodash/isEqual';
import type {
    DashTab,
    DashTabItemControlDataset,
    DashTabItemControlManual,
    DashTabItemControlSingle,
    StringParams,
    WorkbookId,
} from 'shared';
import {
    ControlType,
    DATASET_FIELD_TYPES,
    DashTabItemControlElementType,
    DashTabItemControlSourceType,
    TitlePlacementOption,
} from 'shared';
import {useMountedState} from 'ui/hooks';
import {
    ControlCheckbox,
    ControlDatepicker,
    ControlInput,
    ControlRangeDatepicker,
} from 'ui/libs/DatalensChartkit/components/Control/Items/Items';
import {CONTROL_TYPE} from 'ui/libs/DatalensChartkit/modules/constants/constants';
import {type EntityRequestOptions} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import type {ResponseSuccessSingleControl} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import type {ActiveControl} from 'ui/libs/DatalensChartkit/types';
import {
    addOperationForValue,
    unwrapFromArray,
    unwrapFromArrayAndSkipOperation,
} from 'ui/units/dash/modules/helpers';
import {ExtendedDashKitContext} from 'ui/units/dash/utils/context';

import {chartsDataProvider} from '../../../../../libs/DatalensChartkit';
import logger from '../../../../../libs/logger';
import {getControlHint} from '../../../utils';
import {ControlItemSelect} from '../../Control/ControlItems/ControlItemSelect';
import {Error} from '../../Control/Error/Error';
import {ELEMENT_TYPE, LOAD_STATUS} from '../../Control/constants';
import type {
    ControlSettings,
    ErrorData,
    LoadStatus,
    SelectorError,
    ValidationErrorData,
} from '../../Control/types';
import {
    checkDatasetFieldType,
    getDatasetSourceInfo,
    getLabels,
    getStatus,
    isValidRequiredValue,
} from '../../Control/utils';
import DebugInfoTool from '../../DebugInfoTool/DebugInfoTool';
import type {ExtendedLoadedData} from '../types';
import {
    clearLoaderTimer,
    filterSignificantParams,
    getControlWidthStyle,
    getErrorTitle,
} from '../utils';

import {getInitialState, reducer} from './store/reducer';
import {
    setErrorData,
    setIsInit,
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
    getDistincts?: ControlSettings['getDistincts'];
    requestHeaders?: Record<string, string>;
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
    workbookId?: WorkbookId;
    dependentSelectors?: boolean;
    groupId: string;
};

export const Control = ({
    id,
    data,
    params,
    silentLoading,
    onStatusChanged,
    getDistincts,
    requestHeaders,
    onChange,
    needReload,
    workbookId,
    dependentSelectors,
    groupId,
}: ControlProps) => {
    const extDashkitContext = React.useContext(ExtendedDashKitContext);

    const [prevNeedReload, setPrevNeedReload] = React.useState(needReload);
    const isMounted = useMountedState([]);
    const [prevParams, setPrevParams] = React.useState<StringParams | null>(null);
    // it is filled in for the first time when the data is loaded, then it is updated when the params change
    const currentSignificantParams = React.useRef<StringParams | null>();
    const requestCancellationRef = React.useRef<CancelTokenSource>();

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
        newLoadedData: ResponseSuccessSingleControl,
        loadedStatus: LoadStatus,
    ) => {
        const statusResponse = getStatus(loadedStatus);
        if (statusResponse) {
            // first fill of current params
            if (!currentSignificantParams.current) {
                currentSignificantParams.current = filterSignificantParams({
                    params,
                    loadedData: newLoadedData,
                    defaults: data.defaults,
                    dependentSelectors,
                });
            }
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

    const cancelCurrentRunRequest = () => {
        if (requestCancellationRef.current) {
            requestCancellationRef.current.cancel();
        }
    };

    const init = async () => {
        try {
            const payloadCancellation = chartsDataProvider.getRequestCancellation();
            const payload: EntityRequestOptions = {
                data: {
                    config: {
                        data: {
                            shared: data,
                        },
                        meta: {
                            stype: ControlType.Dash,
                        },
                    },
                    controlData: {
                        id,
                        groupId,
                        tabId: (extDashkitContext?.config as DashTab)?.id,
                    },
                    // currentParams are filled in after the first receiving of loadedData
                    params: currentSignificantParams.current || params,
                    ...(workbookId ? {workbookId} : {}),
                },
                cancelToken: payloadCancellation.token,
                headers: requestHeaders,
            };

            cancelCurrentRunRequest();

            // if the previous request is canceled, but we make a new one, we do not need to send status again
            if (status !== LOAD_STATUS.PENDING) {
                dispatch(setStatus({status: LOAD_STATUS.PENDING}));
                onStatusChanged({controlId: id, status: LOAD_STATUS.PENDING});
            }

            requestCancellationRef.current = payloadCancellation;

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
            if (axios.isCancel(error)) {
                return;
            }
            logger.logError('DashKit: Control init failed', error);
            console.error('DASHKIT_CONTROL_RUN', error);

            let errorData = null;

            if (error.response && error.response.data) {
                const errorInfo = error.response.data?.error as SelectorError;

                errorData = {
                    data: {
                        error: errorInfo,
                        status: error.response.data?.status,
                        title: getErrorTitle(errorInfo),
                    },
                    requestId: error.response.headers['x-request-id'],
                    extra: {
                        hideErrorDetails: Boolean(extDashkitContext?.hideErrorDetails),
                    },
                };
            } else {
                errorData = {data: {message: error.message}};
            }
            setErrorState(errorData, LOAD_STATUS.FAIL);
        }
    };

    const reload = () => {
        clearLoaderTimer(silentLoaderTimer);

        if (data.source.elementType !== ELEMENT_TYPE.SELECT) {
            silentLoaderTimer = setTimeout(() => {
                if (isInit) {
                    dispatch(setSilentLoader({silentLoading}));
                }
            }, 800);
        }

        init();
    };

    const reloadAfterParamsChanges = () => {
        const significantParams = filterSignificantParams({
            params,
            loadedData,
            defaults: data.defaults,
            dependentSelectors,
        });
        if (!needReload && !isEqual(currentSignificantParams.current, significantParams)) {
            currentSignificantParams.current = significantParams;
            reload();
        }
    };

    // cancel requests, transfer status and remove timer if component is unmounted or selector is
    // removed from group
    React.useEffect(() => {
        dispatch(setIsInit({isInit: true}));

        return () => {
            if (!isMounted()) {
                clearLoaderTimer(silentLoaderTimer);
                onStatusChanged({controlId: id, status: LOAD_STATUS.DESTROYED});
                cancelCurrentRunRequest();
            }
        };
    }, [id, isMounted, onStatusChanged, silentLoaderTimer]);

    if (status !== LOAD_STATUS.PENDING && silentLoaderTimer) {
        clearLoaderTimer(silentLoaderTimer);
    }

    if (loadedData && !isEqual(params, prevParams)) {
        if (currentSignificantParams.current) {
            reloadAfterParamsChanges();
        }
        setPrevParams(params);
    }

    // control needs to be reloaded after autoupdate or update in data (changes in group configuration)
    if (prevNeedReload !== needReload) {
        setPrevNeedReload(needReload);
        if (needReload) {
            reload();
        }
    }

    if (!isInit && status === LOAD_STATUS.INITIAL) {
        init();
    }

    const setItemsLoader = (isLoadingItems: boolean) => {
        if (!isMounted) {
            return;
        }
        dispatch(setLoadingItems({loadingItems: isLoadingItems}));
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

        onChange({params: newParam, controlId: id});
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
        if (showSilentLoader || (!control && status === LOAD_STATUS.SUCCESS)) {
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

    const renderLoadingStub = (props: Record<string, unknown>) => {
        const {
            source: {elementType},
        } = data as unknown as DashTabItemControlSingle;

        const stubProps = {
            ...props,
            value: '',
            param: '',
            onChange: () => {},
        };
        switch (elementType) {
            case DashTabItemControlElementType.Input:
                return <ControlInput {...stubProps} type="input" />;
            case DashTabItemControlElementType.Date:
                return <ControlDatepicker {...stubProps} type="datepicker" />;
            case DashTabItemControlElementType.Checkbox:
                return (
                    <ControlCheckbox
                        {...stubProps}
                        className={b('item', {checkbox: true})}
                        type="checkbox"
                    />
                );
        }

        return null;
    };

    const handleClickRetry = () => {
        reload();
    };

    const renderControl = () => {
        // data is already in dash config, it's available without '/api/run' requests
        const controlData = data as unknown as DashTabItemControlSingle;
        const {source, placementMode, width} = controlData;
        const {required, operation, elementType, titlePlacement} = source;

        const {label, innerLabel} = getLabels(controlData);
        const style = getControlWidthStyle(placementMode, width);

        const vertical = titlePlacement === TitlePlacementOption.Top;

        // appearance props to help display the control before it is loaded
        const initialProps: Record<string, unknown> = {
            innerLabel,
            label,
            labelPlacement: titlePlacement,
            className: b('item'),
            // TODO: move class to withWrapForContros after cleaning code from GroupControls flag
            labelClassName: b('item-label', {vertical}),

            style,
            renderOverlay,
            hint: getControlHint(controlData.source),
        };

        // due to the logic of calculating the content,
        // the select itself is responsible for its own loading stub
        if (elementType === DashTabItemControlElementType.Select) {
            return (
                <ControlItemSelect
                    id={id}
                    data={data}
                    defaults={data.defaults || {}}
                    status={status}
                    loadedData={loadedData}
                    loadingItems={loadingItems}
                    actualParams={currentSignificantParams.current || params}
                    onChange={onChangeParams}
                    init={init}
                    setItemsLoader={setItemsLoader}
                    validationError={validationError}
                    errorData={errorData}
                    validateValue={validateValue}
                    getDistincts={getDistincts}
                    classMixin={b('item')}
                    labelMixin={b('item-label', {vertical})}
                    selectProps={{
                        innerLabel,
                        label,
                        style,
                        limitLabel: true,
                        labelPlacement: titlePlacement,
                    }}
                    renderOverlay={renderOverlay}
                />
            );
        }

        if (status === LOAD_STATUS.FAIL) {
            return (
                <div className={b('item-stub', {error: true})} style={style}>
                    <Error errorData={errorData} onClickRetry={handleClickRetry} />
                </div>
            );
        }

        if (!control) {
            return renderLoadingStub(initialProps);
        }

        // this is data from '/api/run' request
        const {param, disabled} = control;

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

            if (!isEqual(valueWithOperation, unwrapFromArray(params[param]))) {
                onChangeParams({value: valueWithOperation, param});
            }
        };

        const props: Record<string, unknown> = {
            ...initialProps,
            param,
            type: control.type,
            widgetId: id,
            value: disabled ? '' : preparedValue,
            required,
            onChange: onChangeControl,
            hasValidationError: Boolean(currentValidationError),
            disabled,
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
                return <ControlCheckbox {...props} className={b('item', {checkbox: true})} />;
        }

        return null;
    };

    return renderControl();
};
