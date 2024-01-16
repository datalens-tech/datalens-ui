import React from 'react';

import {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Button, Loader} from '@gravity-ui/uikit';
import {AxiosResponse} from 'axios';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DatalensGlobalState, Utils} from 'index';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import {ResolveThunks, connect} from 'react-redux';
import {
    ApiV2Filter,
    ApiV2Parameter,
    DATASET_FIELD_TYPES,
    DATASET_IGNORED_DATA_TYPES,
    DashTabItemControlDataset,
    DashTabItemControlElementSelect,
    DashTabItemControlExternal,
    DashTabItemControlManual,
    DashTabItemControlSourceType,
    DatasetFieldType,
    Feature,
    Operations,
    StringParams,
    resolveIntervalDate,
    resolveOperation,
    resolveRelativeDate,
    splitParamsToParametersAndFilters,
    transformParamsToUrlParams,
    transformUrlParamsToParams,
} from 'shared';
import {ChartWrapper} from 'ui/components/Widgets/Chart/ChartWidgetWithProvider';
import {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {ChartKitWrapperOnLoadProps} from 'ui/libs/DatalensChartkit/components/ChartKitBase/types';
import type {ChartsChartKit} from 'ui/libs/DatalensChartkit/types/charts';
import {MOBILE_SIZE, isMobileView} from 'ui/utils/mobile';

import {chartsDataProvider} from '../../../../libs/DatalensChartkit';
import {ChartKitCustomError} from '../../../../libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import {
    ControlCheckbox,
    ControlDatepicker,
    ControlInput,
    ControlRangeDatepicker,
    ControlSelect,
} from '../../../../libs/DatalensChartkit/components/Control/Items/Items';
import {
    ChartsData,
    DatasetFieldsListItem,
    ResponseError,
    ResponseSuccessControls,
} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import {ControlBase, OnChangeData} from '../../../../libs/DatalensChartkit/types';
import logger from '../../../../libs/logger';
import {closeDialog, openDialogErrorWithTabs} from '../../../../store/actions/dialog';
import {
    addOperationForValue,
    unwrapFromArrayAndSkipOperation,
} from '../../../../units/dash/modules/helpers';
import {
    selectIsNewRelations,
    selectSkipReload,
} from '../../../../units/dash/store/selectors/dashTypedSelectors';
import {adjustWidgetLayout} from '../../utils';
import DebugInfoTool from '../DebugInfoTool/DebugInfoTool';

import {Error} from './Error/Error';
import {prerenderMiddleware} from './prerenderMiddleware';
import {
    ChartControlRef,
    ControlSettings,
    ControlType,
    ErrorData,
    GetDistincts,
    LoadStatus,
    PluginControlState,
    SelectControlProps,
    ValidationErrorData,
} from './types';

import './Control.scss';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

export interface PluginControlProps
    extends PluginWidgetProps,
        ControlSettings,
        StateProps,
        DispatchProps {}

export interface PluginControl extends Plugin<PluginControlProps> {
    setSettings: (settings: ControlSettings) => Plugin;
    getDistincts?: GetDistincts;
}

const b = block('dashkit-plugin-control');
const i18n = I18n.keyset('dash.dashkit-plugin-control.view');
const i18nError = I18n.keyset('dash.dashkit-control.error');

const ELEMENT_TYPE = {
    SELECT: 'select',
    DATE: 'date',
    INPUT: 'input',
};
export const LOAD_STATUS: Record<string, LoadStatus> = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAIL: 'fail',
};
const TYPE: Record<string, ControlType> = {
    SELECT: 'select',
    INPUT: 'input',
    DATEPICKER: 'datepicker',
    RANGE_DATEPICKER: 'range-datepicker',
    CHECKBOX: 'checkbox',
};

// This value is also used in charts
const LIMIT = 1000;

const CONTROL_LAYOUT_DEBOUNCE_TIME = 20;

const isValidationError = ({isValueRequired, value}: ValidationErrorData) => {
    return (
        Utils.isEnabledFeature(Feature.SelectorRequiredValue) &&
        isValueRequired &&
        (!value || !value?.length)
    );
};

class Control extends React.PureComponent<PluginControlProps, PluginControlState> {
    static getStatus(status: LoadStatus) {
        let res = '';
        for (const [key, val] of Object.entries(LOAD_STATUS)) {
            if (status === val) {
                res = key;
            }
        }
        return LOAD_STATUS[res];
    }

    chartKitRef: React.RefObject<ChartsChartKit> = React.createRef<ChartsChartKit>();
    rootNode: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

    _isUnmounted = false;
    _silentLoaderTimer: NodeJS.Timeout | undefined = undefined;
    _loadingItemsTimer: NodeJS.Timeout | undefined = undefined;
    _cancelSource: any = null;

    adjustWidgetLayout = debounce(this.setAdjustWidgetLayout, CONTROL_LAYOUT_DEBOUNCE_TIME);

    resolve: ((value: unknown) => void) | null = null;

    /**
     * can't use it in state because of doubling requests
     */
    initialParams: ChartInitialParams = {
        params: {} as StringParams,
    };

    constructor(props: PluginControlProps) {
        super(props);
        this.state = {
            status: LOAD_STATUS.PENDING,
            loadedData: null,
            errorData: null,
            silentLoading: false,
            // loader with a vail that is not shown immediately
            showSilentLoader: false,
            // ChartKit parameter that equals false in case selector-chart has postUpdateOnChange param.
            // Its mean, you do not need to do this.init, because the request has already been executed on the ChartKit side
            forceUpdate: true,
            dialogVisible: false,
            loadingItems: true,
            isInit: false,
            validationError: null,
        };
    }

    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prevProps: Readonly<PluginControlProps>) {
        if (this.state.status !== LOAD_STATUS.PENDING && this._silentLoaderTimer) {
            this.clearSilentLoaderTimer();
        }

        // autoHeight triggers from ChartSelector wrapper for external selectors
        if (
            this.rootNode.current &&
            this.props.data.sourceType !== DashTabItemControlSourceType.External
        ) {
            if (this.props.data.autoHeight) {
                // if the "Auto-altitude" flag is set
                this.adjustWidgetLayout(false);
            } else if (prevProps.data.autoHeight) {
                // if the "Auto-height" flag was set and then removed
                this.adjustWidgetLayout(true);
            }
        }
        const hasDataChanged = !isEqual(this.props.data, prevProps.data);
        const hasParamsChanged = !isEqual(
            this.filterSignificantParams(this.props.params),
            this.filterSignificantParams(prevProps.params),
        );

        const hasDefaultsChanged = !isEqual(this.props.defaults, prevProps.defaults);

        const initialParams = {...this.state.loadedData?.defaultParams, ...this.props.defaults};
        const needUpdateInitialParams =
            hasDefaultsChanged || !isEqual(initialParams, this.initialParams.params);

        if (needUpdateInitialParams) {
            this.initialParams = {
                params: initialParams,
            } as ChartInitialParams;
        }

        const hasChanged = hasDataChanged || hasParamsChanged || hasDefaultsChanged;

        if (this.state.forceUpdate && hasChanged) {
            this.setState({
                status: LOAD_STATUS.PENDING,
                silentLoading: true,
            });

            this.clearSilentLoaderTimer();
            // @ts-ignore
            if (this.props.data.source.elementType !== ELEMENT_TYPE.SELECT) {
                this._silentLoaderTimer = setTimeout(this.showSilentLoader, 800);
            }

            this.init();
        }
    }

    componentWillUnmount() {
        this._isUnmounted = true;
        this.clearSilentLoaderTimer();
        this.cancelCurrentRequests();
    }

    setAdjustWidgetLayout(needSetDefault: boolean) {
        adjustWidgetLayout({
            widgetId: this.props.id,
            needSetDefault,
            rootNode: this.rootNode,
            gridLayout: this.props.gridLayout,
            layout: this.props.layout,
            cb: this.props.adjustWidgetLayout,
        });
    }

    get actualParams(): StringParams {
        return this.filterSignificantParams(this.props.params);
    }

    clearSilentLoaderTimer() {
        if (this._silentLoaderTimer) {
            clearTimeout(this._silentLoaderTimer);
        }
    }

    showSilentLoader = () => {
        this.setState((prevState) => {
            return prevState.status === LOAD_STATUS.PENDING && prevState.silentLoading
                ? {showSilentLoader: true}
                : null;
        });
    };

    showItemsLoader = () => {
        this.setState({loadingItems: true});
    };

    filterSignificantParams(params: StringParams) {
        if (!params) {
            return {};
        }

        const loadedData = this.state.loadedData;
        // @ts-ignore
        const dependentSelectors = this.props.settings.dependentSelectors;

        if (loadedData && loadedData.usedParams && dependentSelectors) {
            return pick(params, Object.keys(loadedData.usedParams));
        }

        return dependentSelectors ? params : pick(params, Object.keys(this.props.defaults!));
    }

    reload = ({silentLoading}: {silentLoading?: boolean} = {}) => {
        if (this.props.skipReload || !this.state.isInit) {
            return;
        }

        this.setState({status: LOAD_STATUS.PENDING, silentLoading: Boolean(silentLoading)});
        this.init();
    };

    cancelCurrentRequests() {
        if (this._cancelSource) {
            this._cancelSource.cancel('DASHKIT_CONTROL_CANCEL_CURRENT_REQUESTS');
        }
    }

    // public
    getMeta() {
        if (this.props.data.sourceType === DashTabItemControlSourceType.External) {
            return (this.chartKitRef.current as ChartControlRef)?.getMeta();
        }
        if (Utils.isEnabledFeature(Feature.ShowNewRelations) && this.props.isNewRelations) {
            return this.getCurrentWidgetMetaInfo();
        }
        if (this.chartKitRef && this.chartKitRef.current) {
            this.chartKitRef.current.undeferred();
        }
        return new Promise((resolve) => {
            this.resolve = resolve;
            if (this.state.loadedData) {
                this.resolveMeta(this.state.loadedData);
            }
            if (this.state.status === LOAD_STATUS.FAIL) {
                this.resolveMeta(null);
            }
        });
    }

    getCurrentWidgetMetaInfo() {
        if (this.chartKitRef.current) {
            this.chartKitRef.current.undeferred();
        }

        return new Promise((resolve: (value: unknown) => void) => {
            this.resolve = resolve;
            if (this.state.status !== LOAD_STATUS.PENDING) {
                const metaData = this.state.loadedData || null;

                if (this.state.loadedData || this.state.status === LOAD_STATUS.FAIL) {
                    this.getCurrentWidgetResolvedMetaInfo(metaData);
                }
            }
        });
    }

    getCurrentWidgetResolvedMetaInfo(
        data: ResponseSuccessControls | AxiosResponse<ResponseError> | null,
    ) {
        if (!this.resolve) {
            return;
        }

        const loadedData = (data as ResponseSuccessControls) || this.state.loadedData || null;

        const firstControlWithLabel = loadedData?.controls?.controls?.find(
            (item) => (item as ControlBase).label,
        ) as ControlBase;

        const loadedWithError =
            Boolean((data as AxiosResponse<ResponseError>)?.data?.error) ||
            this.state.status === LOAD_STATUS.FAIL;

        const widgetMetaInfo = {
            layoutId: this.props.id,
            chartId: null,
            widgetId: this.props.id,
            title: this.props.data?.title || '',
            label: firstControlWithLabel?.label || '',
            params: this.props.params,
            defaultParams: this.props.defaults,
            loaded: Boolean(loadedData),
            entryId: this.chartKitRef?.current?.props.id || null, // to do built in widget ?
            usedParams: loadedData?.usedParams
                ? Object.keys(this.filterSignificantParams(loadedData.usedParams))
                : null,
            datasets: loadedData?.extra?.datasets || null,
            datasetId: loadedData?.sources?.fields?.datasetId || '',
            type: 'control',
            sourceType: this.props.data?.sourceType,
            visualizationType: null,
            loadError: loadedWithError,
        };

        this.resolve(widgetMetaInfo);
    }

    resolveMeta(loadedData?: any) {
        // @ts-ignore
        if (this.resolve) {
            let result: any = {id: this.props.id};

            if (loadedData && loadedData.extra) {
                result = {
                    id: this.props.id,
                    usedParams: loadedData.usedParams
                        ? Object.keys(this.filterSignificantParams(loadedData.usedParams))
                        : null,
                    datasets: loadedData.extra.datasets,
                    // deprecated
                    datasetId: loadedData.extra.datasetId,
                    datasetFields: loadedData.extra.datasetFields,
                    type: 'control',
                    sourceType: this.props.data?.sourceType,
                };
            }

            // @ts-ignore
            this.resolve(result);
        }
    }

    getDatasetSourceInfo(currentLoadedData?: ResponseSuccessControls) {
        const {data} = this.props;
        const {datasetFieldId, datasetId} = (data as unknown as DashTabItemControlDataset).source;
        let datasetFieldType = null;

        const loadedData = currentLoadedData || (this.state.loadedData as unknown as ChartsData);

        let datasetFields: DatasetFieldsListItem[] = [];

        if (loadedData && loadedData.extra.datasets) {
            const dataset = loadedData.extra.datasets.find((dataset) => dataset.id === datasetId);
            // when the dataset was changed for the selector.
            // During the following several renders datasetId is not presented in loadedData.extra.datasets,
            // datasetId will appears after new loadedData is received.
            if (dataset) {
                datasetFields = dataset.fieldsList;
                const field = dataset.fieldsList.find((field) => field.guid === datasetFieldId);

                if (field) {
                    datasetFieldType = field.dataType;
                }
            }
        }

        const datasetFieldsMap = datasetFields.reduce((acc, field) => {
            const fieldData = {
                fieldType: field.fieldType,
                guid: field.guid,
            };
            acc[field.guid] = fieldData;
            acc[field.title] = fieldData;

            return acc;
        }, {} as Record<string, {guid: string; fieldType: DatasetFieldType}>);

        return {datasetId, datasetFieldId, datasetFieldType, datasetFields, datasetFieldsMap};
    }

    setLoadedData(loadedData: ResponseSuccessControls, status: LoadStatus) {
        const isNewRelations =
            Utils.isEnabledFeature(Feature.ShowNewRelations) && this.props.isNewRelations;

        const isAvailableStatus = isNewRelations
            ? [LOAD_STATUS.SUCCESS, LOAD_STATUS.FAIL].includes(status)
            : true;

        if (this._isUnmounted || !isAvailableStatus) {
            return;
        }

        const newInitialParams = {...loadedData?.defaultParams, ...this.props.defaults};
        const initialParamsChanged = !isEqual(newInitialParams, this.initialParams.params);

        if (initialParamsChanged) {
            this.initialParams.params = newInitialParams as StringParams;
        }

        const statusResponse = Control.getStatus(status);
        if (statusResponse) {
            this.setState({
                status: statusResponse as LoadStatus,
                loadedData,
                silentLoading: false,
                showSilentLoader: false,
                loadingItems: false,
            });
        }

        if (isNewRelations) {
            this.getCurrentWidgetResolvedMetaInfo(loadedData);
        } else {
            const resolveDataArg = status === LOAD_STATUS.SUCCESS ? loadedData : null;
            this.resolveMeta(resolveDataArg);
        }
    }

    async init() {
        try {
            const {data} = this.props;

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
                    params: this.actualParams,
                },
            };

            const response =
                data.sourceType === DashTabItemControlSourceType.External
                    ? null
                    : // @ts-ignore
                      await chartsDataProvider.makeRequest(payload);

            if (response === null || this._isUnmounted) {
                return;
            }

            const loadedData = response.data;

            loadedData.uiScheme = Array.isArray(loadedData.uiScheme)
                ? {controls: loadedData.uiScheme}
                : loadedData.uiScheme;

            if (data.sourceType === DashTabItemControlSourceType.Dataset) {
                this.checkDatasetFieldType(loadedData);
            } else {
                this.setLoadedData(loadedData, LOAD_STATUS.SUCCESS);
            }
            if (this.state.isInit === false) {
                this.setState({isInit: true});
            }
        } catch (error) {
            if (this.state.isInit === false) {
                this.setState({isInit: true});
            }
            logger.logError('DashKit: Control init failed', error);
            console.error('DASHKIT_CONTROL_RUN', error);

            let errorData = null;

            if (this._isUnmounted) {
                return;
            }

            if (error.response && error.response.data) {
                errorData = {
                    data: {error: error.response.data?.error, status: error.response.data?.status},
                    requestId: error.response.headers['x-request-id'],
                };
            } else {
                errorData = {data: {message: error.message}};
            }

            this.setErrorData(errorData, LOAD_STATUS.FAIL);
        }
    }

    onChange(param: string, value: string | string[]) {
        this.props.onStateAndParamsChange({params: {[param]: value}});
    }

    // TODO: seems like this function should be in shared/ui
    getDistincts = async ({
        searchPattern,
        nextPageToken,
    }: {
        searchPattern: string;
        nextPageToken: number;
    }) => {
        try {
            const {datasetId, datasetFieldId, datasetFields, datasetFieldsMap} =
                this.getDatasetSourceInfo();

            const splitParams = splitParamsToParametersAndFilters(
                transformParamsToUrlParams(this.actualParams),
                datasetFields,
            );

            const filtersParams = transformUrlParamsToParams(splitParams.filtersParams);

            const where = Object.entries(filtersParams).reduce(
                (result, [key, rawValue]) => {
                    // ignoring the values of the current field when filtering,
                    // because it is enabled by default with operation: 'ICONTAINS',
                    // otherwise, we will search among the selected
                    if (key === datasetFieldId) {
                        return result;
                    }

                    const valuesWithOperation = (
                        Array.isArray(rawValue) ? rawValue : [rawValue]
                    ).map((item) => resolveOperation(item));

                    if (valuesWithOperation.length > 0 && valuesWithOperation[0]?.value) {
                        const value = valuesWithOperation[0]?.value;
                        let operation = valuesWithOperation[0]?.operation;
                        let values = valuesWithOperation.map((item) => item?.value!);

                        if (
                            valuesWithOperation.length === 1 &&
                            value.indexOf('__interval_') === 0
                        ) {
                            const resolvedInterval = resolveIntervalDate(value);

                            if (resolvedInterval) {
                                values = [resolvedInterval.from, resolvedInterval.to];
                                operation = Operations.BETWEEN;
                            }
                        }

                        if (
                            valuesWithOperation.length === 1 &&
                            value.indexOf('__relative_') === 0
                        ) {
                            const resolvedRelative = resolveRelativeDate(value);

                            if (resolvedRelative) {
                                values = [resolvedRelative];
                            }
                        }

                        result.push({
                            column: key,
                            operation,
                            values,
                        });
                    }

                    return result;
                },
                [
                    {
                        column: datasetFieldId,
                        operation: 'ICONTAINS',
                        values: [searchPattern],
                    },
                ],
            );

            const filters: ApiV2Filter[] = where
                .filter((el) => {
                    return datasetFieldsMap[el.column]?.fieldType !== DatasetFieldType.Measure;
                })
                .map<ApiV2Filter>((filter) => {
                    return {
                        ref: {type: 'id', id: filter.column},
                        operation: filter.operation,
                        values: filter.values,
                    };
                });

            const parameter_values: ApiV2Parameter[] =
                splitParams.parametersParams.map<ApiV2Parameter>(([key, value]) => {
                    return {
                        ref: {type: 'id', id: key},
                        value,
                    };
                });

            const {result} = await this.props.getDistincts!({
                datasetId,
                fields: [
                    {
                        ref: {type: 'id', id: datasetFieldId},
                        role_spec: {role: 'distinct'},
                    },
                ],
                limit: LIMIT,
                offset: LIMIT * nextPageToken,
                filters,
                parameter_values,
            });

            return {
                items: result.data.Data.map(([value]) => ({value, title: value})),
                nextPageToken: result.data.Data.length < LIMIT ? undefined : nextPageToken + 1,
            };
        } catch (error) {
            logger.logError('DashKit: Control getDistincts failed', error);
            console.error('SELECT_GET_ITEMS_FAILED', error);
            throw error;
        }
    };

    getItems = async ({
        searchPattern,
        exactKeys,
        nextPageToken = 0,
    }: {
        searchPattern: string;
        exactKeys: string[];
        nextPageToken?: number;
    }) => {
        if (searchPattern || (!searchPattern && nextPageToken)) {
            return this.getDistincts({searchPattern, nextPageToken});
        } else if (exactKeys) {
            return {
                items: exactKeys.map((value) => ({value, title: value})),
                nextPageToken: nextPageToken + 1,
            };
        }

        return {items: []};
    };

    onChangeExternal = ({type, data}: OnChangeData) => {
        // onChangeExternal = ({params, loadedData} = {}, {forceUpdate} = {}) => {
        // for the case of a selector with postUpdateOnChange comes loadedData
        // because the request occurs on the ChartKit side and because of forceUpdate: true
        // there is no re-request of loadedData, so it comes here
        // this.setState({forceUpdate});
        // if (loadedData) {
        //     this.setState({loadedData});
        // }
        if (type === 'PARAMS_CHANGED') {
            const {params} = data as {params: StringParams};
            this.props.onStateAndParamsChange({params: params || {}});
        }
    };

    onLoadExternal = ({status, requestId, data}: ChartKitWrapperOnLoadProps): void => {
        return status === 'success'
            ? this.setLoadedData(
                  data.loadedData as unknown as ResponseSuccessControls,
                  LOAD_STATUS.SUCCESS,
              )
            : this.setLoadedData({data, requestId} as any, LOAD_STATUS.FAIL);
    };

    onOpenChange = ({open}: {open: boolean}) => {
        clearTimeout(this._loadingItemsTimer as NodeJS.Timeout);

        if (this.state.status === LOAD_STATUS.PENDING) {
            if (open) {
                this.showItemsLoader();
            } else {
                // A delay for displaying the Loader in the Popup, to prevent loading blinking while closing.
                this._loadingItemsTimer = setTimeout(() => {
                    if (this.state.status === LOAD_STATUS.PENDING) {
                        this.showItemsLoader();
                    }
                }, 150);
            }
        }
    };

    getErrorText = (data: ErrorData['data']) => {
        if (typeof data?.error?.code === 'string') {
            return data.error.code;
        }
        if (typeof data?.error === 'string') {
            return data.error;
        }
        if (typeof data?.message === 'string') {
            return data.message;
        }
        if (data?.status && data.status === 504) {
            return i18nError('label_error-timeout');
        }

        return i18nError('label_error');
    };

    prepareSelectorError = (data: ErrorData['data'], requestId?: string) => {
        const errorBody = data?.error?.details?.sources?.distincts?.body;
        if (errorBody) {
            return {
                isCustomError: true,
                details: {
                    source: {
                        code: errorBody.code,
                        details: errorBody.details,
                        debug: errorBody.debug || (requestId ? {requestId} : ''),
                    },
                },
                message: errorBody.message,
                code: data.error?.code || '',
            };
        }

        const errorContent = data?.error;
        let debugInfo = errorContent?.debug || '';
        if (typeof errorContent?.debug === 'object' && requestId) {
            debugInfo = {...errorContent?.debug, requestId};
        }

        return {
            ...errorContent,
            debug: debugInfo,
            message: this.getErrorText(data),
            isCustomError: true,
        };
    };

    getErrorContent() {
        const {errorData} = this.state;
        const data = errorData?.data;
        const errorText = this.getErrorText(data || {});
        const errorTitle = data?.title;

        const buttonsSize = isMobileView ? MOBILE_SIZE.BUTTON : 's';
        const buttonsWidth = isMobileView ? 'max' : 'auto';

        return (
            <div className={b('error', {inside: true, mobile: isMobileView})}>
                <span className={b('error-text')} title={errorText}>
                    {errorTitle || errorText}
                </span>
                <div className={b('buttons')}>
                    <Button
                        size={buttonsSize}
                        onClick={() => {
                            this.showItemsLoader();
                            this.init();
                        }}
                        width={buttonsWidth}
                    >
                        {i18n('button_retry')}
                    </Button>
                    <Button
                        size={buttonsSize}
                        view="flat"
                        onClick={() =>
                            this.props.openDialogErrorWithTabs({
                                error: this.prepareSelectorError(data || {}) as ChartKitCustomError,
                                title: errorTitle,
                            })
                        }
                        width={buttonsWidth}
                    >
                        {i18n('button_details')}
                    </Button>
                </div>
            </div>
        );
    }

    renderSilentLoader() {
        if (this.state.showSilentLoader) {
            return (
                <div className={b('loader', {silent: true})}>
                    <Loader size="s" />
                </div>
            );
        }

        return null;
    }

    renderError() {
        const errorData = this.state.errorData;
        const errorTitle = errorData?.data?.title;
        return (
            <div className={b('error')}>
                <Error
                    onClick={() =>
                        this.props.openDialogErrorWithTabs({
                            error: this.prepareSelectorError(
                                errorData?.data || {},
                                errorData?.requestId,
                            ) as ChartKitCustomError,
                            title: errorTitle,
                            onRetry: () => {
                                this.reload();
                                this.props.closeDialog();
                            },
                        })
                    }
                />
            </div>
        );
    }

    renderSelector() {
        const {defaults, data, editMode, id} = this.props;

        const {loadedData, status, loadingItems} = this.state;
        const controlData = data as unknown as DashTabItemControlDataset | DashTabItemControlManual;
        const source = controlData.source;
        const title = controlData.title;
        const sourceType = controlData.sourceType;
        const fieldId =
            (source as DashTabItemControlDataset['source']).datasetFieldId ||
            (source as DashTabItemControlManual['source']).fieldName;
        const selectedValue = defaults![fieldId];
        const preselectedContent = [{title: selectedValue, value: selectedValue}];
        // @ts-ignore
        const content = loadedData?.uiScheme?.controls[0].content;
        const emptyPaceholder = Utils.isEnabledFeature(Feature.EmptySelector)
            ? i18n('placeholder_empty')
            : undefined;

        const preparedValue = unwrapFromArrayAndSkipOperation(this.actualParams[fieldId]);

        // for first initialization of control
        const initialValidationError = isValidationError({
            isValueRequired: source.isValueRequired,
            value: preparedValue,
        })
            ? i18n('value_required')
            : null;
        const validationError = this.state.validationError || initialValidationError;

        const placeholder =
            Utils.isEnabledFeature(Feature.SelectorRequiredValue) && validationError
                ? validationError
                : emptyPaceholder;

        const onChange = (value: string | string[]) => {
            const isValid = this.checkValueValidation({
                isValueRequired: source.isValueRequired,
                value,
            });

            if (!isValid) {
                return;
            }

            const valueWithOperation = addOperationForValue({
                value,
                operation: source.operation,
            });

            this.onChange(fieldId, valueWithOperation);
        };

        const props: SelectControlProps = {
            widgetId: id,
            content: content || preselectedContent,
            label: (source.showTitle ? title : '') as string,
            innerLabel: (source.showInnerTitle ? source.innerTitle : '') as string,
            param: fieldId,
            multiselect: (source as DashTabItemControlElementSelect).multiselectable,
            type: TYPE.SELECT,
            className: b('item'),
            key: fieldId,
            value: preparedValue as string,
            editMode,
            onChange,
            onOpenChange: this.onOpenChange,
            loadingItems,
            placeholder,
            isValueRequired: source.isValueRequired,
            isValidationError: Boolean(validationError),
        };

        if (status === LOAD_STATUS.FAIL) {
            props.errorContent = this.getErrorContent();
            props.itemsLoaderClassName = b('select-loader');
        }

        if (props.content.length >= LIMIT && sourceType === DashTabItemControlSourceType.Dataset) {
            props.getItems = this.getItems;
        }

        return <ControlSelect {...props} />;
    }

    renderControls() {
        const {
            data: {sourceType},
            editMode,
            id,
        } = this.props;

        switch (this.state.status) {
            case LOAD_STATUS.PENDING:
                if (
                    !this.state.silentLoading ||
                    !this.state.loadedData ||
                    !this.state.loadedData.uiScheme
                ) {
                    return (
                        <div className={b()}>
                            <Loader size="s" />
                        </div>
                    );
                }
                break;
            case LOAD_STATUS.FAIL: {
                return this.renderError();
            }
        }

        const {loadedData} = this.state;

        const uiScheme = loadedData?.uiScheme;
        // @ts-ignore
        // eslint-disable-next-line complexity
        return uiScheme?.controls.map((control) => {
            const {param, type} = control;
            const data = this.props.data as unknown as
                | DashTabItemControlManual
                | DashTabItemControlDataset;

            const {source, title} = data;

            if (!Object.keys(this.actualParams).includes(param)) {
                return null;
            }

            const preparedValue = unwrapFromArrayAndSkipOperation(this.actualParams[param]);

            // for first initialization of control
            const initialValidationError = isValidationError({
                isValueRequired: source.isValueRequired,
                value: preparedValue,
            })
                ? i18n('value_required')
                : null;
            const validationError = this.state.validationError || initialValidationError;

            const onChange = (value: string | string[]) => {
                const isValid = this.checkValueValidation({
                    isValueRequired: source.isValueRequired,
                    value,
                });

                if (!isValid) {
                    return;
                }

                const valueWithOperation = addOperationForValue({
                    value,
                    operation: source.operation,
                });

                this.onChange(param, valueWithOperation);
            };

            const props = {
                ...control,
                widgetId: id,
                className: b('item'),
                key: param,
                value: preparedValue,
                onChange,
                editMode,
                innerLabel: (source.showInnerTitle ? source.innerTitle : '') as string,
                label: (source.showTitle ? title : '') as string,
                isValueRequired: source.isValueRequired,
                isValidationError: Boolean(validationError),
            };

            if (type === TYPE.RANGE_DATEPICKER || type === TYPE.DATEPICKER) {
                props.emptyValueText =
                    Utils.isEnabledFeature(Feature.SelectorRequiredValue) && validationError
                        ? validationError
                        : i18n('value_undefined');

                let fieldType = source?.fieldType || null;
                if (sourceType === DashTabItemControlSourceType.Dataset) {
                    const {datasetFieldType} = this.getDatasetSourceInfo();
                    fieldType = datasetFieldType;
                }
                if (
                    fieldType === DATASET_FIELD_TYPES.DATETIME ||
                    fieldType === DATASET_FIELD_TYPES.GENERICDATETIME
                ) {
                    props.timeFormat = 'HH:mm:ss';
                }
            }

            if (type === TYPE.INPUT) {
                props.placeholder =
                    Utils.isEnabledFeature(Feature.SelectorRequiredValue) && validationError
                        ? validationError
                        : control.placeholder;
            }

            switch (type) {
                case TYPE.INPUT:
                    return <ControlInput {...props} />;
                case TYPE.DATEPICKER:
                    return <ControlDatepicker {...props} />;
                case TYPE.RANGE_DATEPICKER:
                    return <ControlRangeDatepicker returnInterval={true} {...props} />;
                case TYPE.CHECKBOX:
                    return <ControlCheckbox {...props} />;
            }

            return null;
        });
    }

    render() {
        const {data, editMode, id} = this.props;
        const controlData = data as unknown as
            | DashTabItemControlExternal
            | DashTabItemControlManual
            | DashTabItemControlDataset;
        const sourceType = controlData.sourceType;

        if (sourceType === DashTabItemControlSourceType.External) {
            const chartId = (data as unknown as DashTabItemControlExternal).source.chartId;
            return (
                <div
                    ref={this.rootNode}
                    className={b({
                        external: true,
                    })}
                >
                    <DebugInfoTool label={'chartId'} value={chartId} />
                    <ChartWrapper
                        {...this.props}
                        usageType="control"
                        id={chartId}
                        widgetId={id}
                        config={
                            {
                                data: {
                                    shared: data,
                                },
                                meta: {
                                    stype: 'control_dash',
                                },
                            } as any
                            // can't retype because of dashkit
                        }
                        params={this.actualParams}
                        initialParams={this.initialParams}
                        onChartLoad={this.onLoadExternal}
                        onChange={this.onChangeExternal}
                        widgetType={sourceType}
                        editMode={editMode}
                        forwardedRef={this.chartKitRef as any}
                    />
                </div>
            );
        }
        const source = (
            controlData as unknown as DashTabItemControlManual | DashTabItemControlDataset
        ).source;

        const paramIdDebug = ((source as DashTabItemControlDataset['source']).datasetFieldId ||
            (source as DashTabItemControlManual['source']).fieldName ||
            data.param ||
            '') as string;

        return (
            <div ref={this.rootNode} className={b({mobile: isMobileView})}>
                {this.renderSilentLoader()}
                <DebugInfoTool label={'paramId'} value={paramIdDebug} modType={'corner'} />
                {source.elementType === TYPE.SELECT ? this.renderSelector() : this.renderControls()}
            </div>
        );
    }

    private checkDatasetFieldType(loadedData: ResponseSuccessControls) {
        const {datasetFieldType} = this.getDatasetSourceInfo(loadedData);

        if (
            datasetFieldType &&
            DATASET_IGNORED_DATA_TYPES.includes(datasetFieldType as DATASET_FIELD_TYPES)
        ) {
            const errorData = {
                data: {
                    title: i18nError('label_field-error-title'),
                    message: i18nError('label_field-error-text'),
                },
            };
            this.setErrorData(errorData, LOAD_STATUS.FAIL);
        } else {
            this.setLoadedData(loadedData, LOAD_STATUS.SUCCESS);
        }
    }

    private setErrorData(errorData: ErrorData, status: LoadStatus) {
        if (this._isUnmounted) {
            return;
        }

        const statusResponse = Control.getStatus(status);
        if (statusResponse) {
            this.setState({
                status: statusResponse as LoadStatus,
                errorData,
                silentLoading: false,
                showSilentLoader: false,
                loadingItems: false,
            });
        }
    }

    private checkValueValidation(args: ValidationErrorData) {
        if (isValidationError(args)) {
            this.setState({validationError: i18n('value_required')});
            return false;
        }

        if (this.state.validationError) {
            this.setState({validationError: null});
        }
        return true;
    }
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    skipReload: selectSkipReload(state),
    isNewRelations: selectIsNewRelations(state),
});

const mapDispatchToProps = {
    openDialogErrorWithTabs,
    closeDialog,
};

const ControlWithStore = connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(
    Control,
);

const plugin: PluginControl = {
    type: 'control',
    defaultLayout: {w: 8, h: 2},
    setSettings(settings: ControlSettings) {
        const {getDistincts} = settings;

        // TODO: remove this. use basic ChartKit abilities
        plugin.getDistincts = getDistincts;

        return plugin;
    },
    prerenderMiddleware,
    renderer(props: PluginWidgetProps, forwardedRef) {
        return (
            <ControlWithStore {...props} getDistincts={plugin.getDistincts} ref={forwardedRef} />
        );
    },
};

export default plugin;
