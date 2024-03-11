import React from 'react';

import {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Loader} from '@gravity-ui/uikit';
import {AxiosResponse} from 'axios';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DatalensGlobalState, Utils} from 'index';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import {connect} from 'react-redux';
import {
    DATASET_FIELD_TYPES,
    DashTabItemControlDataset,
    DashTabItemControlExternal,
    DashTabItemControlManual,
    DashTabItemControlSingle,
    DashTabItemControlSourceType,
    Feature,
    StringParams,
    WorkbookId,
} from 'shared';
import {ChartWrapper} from 'ui/components/Widgets/Chart/ChartWidgetWithProvider';
import {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {ChartKitWrapperOnLoadProps} from 'ui/libs/DatalensChartkit/components/ChartKitBase/types';
import type {ChartsChartKit} from 'ui/libs/DatalensChartkit/types/charts';
import {isMobileView} from 'ui/utils/mobile';

import {chartsDataProvider} from '../../../../libs/DatalensChartkit';
import {
    ControlCheckbox,
    ControlDatepicker,
    ControlInput,
    ControlRangeDatepicker,
} from '../../../../libs/DatalensChartkit/components/Control/Items/Items';
import {
    ResponseError,
    ResponseSuccessControls,
} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import {ControlBase, OnChangeData} from '../../../../libs/DatalensChartkit/types';
import logger from '../../../../libs/logger';
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

import {ControlItemSelect} from './ControlItems/ControlItemSelect';
import {Error} from './Error/Error';
import {ELEMENT_TYPE, LOAD_STATUS, TYPE} from './constants';
import {prerenderMiddleware} from './prerenderMiddleware';
import {
    ChartControlRef,
    ControlSettings,
    ErrorData,
    GetDistincts,
    LoadStatus,
    PluginControlState,
    ValidationErrorData,
} from './types';
import {
    checkDatasetFieldType,
    getDatasetSourceInfo,
    getLabels,
    getStatus,
    isValidRequiredValue,
} from './utils';

import './Control.scss';

type ContextProps = {
    workbookId?: WorkbookId;
};

type StateProps = ReturnType<typeof mapStateToProps>;

export interface PluginControlProps
    extends PluginWidgetProps,
        ContextProps,
        ControlSettings,
        StateProps {}

export interface PluginControl extends Plugin<PluginControlProps> {
    setSettings: (settings: ControlSettings) => Plugin;
    getDistincts?: GetDistincts;
}

const b = block('dashkit-plugin-control');
const i18n = I18n.keyset('dash.dashkit-plugin-control.view');

const CONTROL_LAYOUT_DEBOUNCE_TIME = 20;

class Control extends React.PureComponent<PluginControlProps, PluginControlState> {
    chartKitRef: React.RefObject<ChartsChartKit> = React.createRef<ChartsChartKit>();
    rootNode: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

    _isUnmounted = false;
    _silentLoaderTimer: NodeJS.Timeout | undefined = undefined;
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

    filterDefaultsBySource() {
        const sourcedFieldId =
            this.props.data?.sourceType === 'dataset'
                ? (this.props.data?.source as {datasetFieldId: string})?.datasetFieldId
                : null;
        if (sourcedFieldId && this.props.defaults) {
            return {[sourcedFieldId]: this.props.defaults[sourcedFieldId]};
        }

        return this.props.defaults;
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
            defaultParams: this.filterDefaultsBySource(),
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

    setLoadedData = (loadedData: ResponseSuccessControls, status: LoadStatus) => {
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

        const statusResponse = getStatus(status);
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
    };

    init = async () => {
        try {
            const data = this.props.data as unknown as
                | DashTabItemControlDataset
                | DashTabItemControlManual
                | DashTabItemControlExternal;

            const {workbookId} = this.props;

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
                    ...(workbookId ? {workbookId} : {}),
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
                checkDatasetFieldType({
                    currentLoadedData: loadedData,
                    datasetData: data,
                    actualLoadedData: this.state.loadedData,
                    onError: this.setErrorData,
                    onSucces: this.setLoadedData,
                });
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
    };

    onChange = ({param, value}: {param: string; value: string | string[]}) => {
        this.props.onStateAndParamsChange({params: {[param]: value}}, {action: 'setParams'});
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

    renderSelectControl() {
        const data = this.props.data as unknown as DashTabItemControlSingle;
        const {id, defaults, getDistincts} = this.props;
        const {loadedData, status, loadingItems, errorData, validationError} = this.state;

        const {label, innerLabel} = getLabels(data);

        return (
            <ControlItemSelect
                id={id}
                data={data}
                defaults={defaults}
                status={status}
                loadedData={loadedData}
                loadingItems={loadingItems}
                actualParams={this.actualParams}
                onChange={this.onChange}
                init={this.init}
                showItemsLoader={this.showItemsLoader}
                validationError={validationError}
                errorData={errorData}
                validateValue={this.validateValue}
                getDistincts={getDistincts}
                classMixin={b('item')}
                selectProps={{label, innerLabel}}
            />
        );
    }

    renderControls() {
        const data = this.props.data as unknown as DashTabItemControlSingle;

        const {sourceType} = data;
        const {id} = this.props;

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
                return <Error errorData={this.state.errorData} onClickRetry={this.reload} />;
            }
        }

        const {loadedData} = this.state;

        const uiScheme = loadedData?.uiScheme;
        // @ts-ignore
        return uiScheme?.controls.map((control) => {
            const {param, type} = control;

            const {source} = data;
            const {required, operation} = source;

            if (!Object.keys(this.actualParams).includes(param)) {
                return null;
            }

            const preparedValue = unwrapFromArrayAndSkipOperation(this.actualParams[param]);

            const validationError = this.getValidationError({
                required,
                value: preparedValue,
            });

            const onChange = (value: string | string[]) => {
                const hasError = this.validateValue({
                    required,
                    value,
                });

                if (hasError) {
                    return;
                }

                const valueWithOperation = addOperationForValue({
                    value,
                    operation,
                });

                this.onChange({param, value: valueWithOperation});
            };

            const {label, innerLabel} = getLabels(data);

            const props = {
                ...control,
                widgetId: id,
                className: b('item'),
                key: param,
                value: preparedValue,
                onChange,
                innerLabel,
                label,
                required,
                hasValidationError: Boolean(validationError),
            };

            if (type === TYPE.RANGE_DATEPICKER || type === TYPE.DATEPICKER) {
                let fieldType = source?.fieldType || null;
                if (sourceType === DashTabItemControlSourceType.Dataset) {
                    const {datasetFieldType} = getDatasetSourceInfo({
                        data,
                        actualLoadedData: this.state.loadedData,
                    });
                    fieldType = datasetFieldType;
                }
                // Check 'datetime' for backward compatibility
                if (fieldType === 'datetime' || fieldType === DATASET_FIELD_TYPES.GENERICDATETIME) {
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
        const {data, editMode, id, workbookId} = this.props;
        const controlData = data as unknown as
            | DashTabItemControlExternal
            | DashTabItemControlManual
            | DashTabItemControlDataset;
        const {sourceType, source} = controlData;

        if (sourceType === DashTabItemControlSourceType.External) {
            const chartId = source.chartId;

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
                        workbookId={workbookId}
                    />
                </div>
            );
        }

        const paramIdDebug = ((source as DashTabItemControlDataset['source']).datasetFieldId ||
            (source as DashTabItemControlManual['source']).fieldName ||
            data.param ||
            '') as string;

        return (
            <div ref={this.rootNode} className={b({mobile: isMobileView})}>
                {this.renderSilentLoader()}
                <DebugInfoTool label={'paramId'} value={paramIdDebug} modType={'corner'} />
                {source.elementType === TYPE.SELECT
                    ? this.renderSelectControl()
                    : this.renderControls()}
            </div>
        );
    }

    private setErrorData = (errorData: ErrorData, status: LoadStatus) => {
        if (this._isUnmounted) {
            return;
        }

        const statusResponse = getStatus(status);
        if (statusResponse) {
            this.setState({
                status: statusResponse as LoadStatus,
                errorData,
                silentLoading: false,
                showSilentLoader: false,
                loadingItems: false,
            });
        }
    };

    private setValidationError(hasError?: boolean) {
        if (hasError) {
            this.setState({validationError: i18n('value_required')});
            return;
        }

        if (this.state.validationError) {
            this.setState({validationError: null});
        }
    }

    private validateValue = (args: ValidationErrorData) => {
        const hasError = isValidRequiredValue(args);
        this.setValidationError(hasError);

        return hasError;
    };

    private getValidationError({required, value}: {required?: boolean; value: string | string[]}) {
        let validationError = null;

        if (required) {
            // for first initialization of control
            const initialValidationError = isValidRequiredValue({
                required,
                value,
            })
                ? i18n('value_required')
                : null;
            validationError = this.state.validationError || initialValidationError;
        }

        return validationError;
    }
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    skipReload: selectSkipReload(state),
    isNewRelations: selectIsNewRelations(state),
});

const ControlWithStore = connect(mapStateToProps, null, null, {forwardRef: true})(Control);

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
        const workbookId = props.context.workbookId;

        return (
            <ControlWithStore
                {...props}
                workbookId={workbookId}
                getDistincts={plugin.getDistincts}
                ref={forwardedRef}
            />
        );
    },
};

export default plugin;
