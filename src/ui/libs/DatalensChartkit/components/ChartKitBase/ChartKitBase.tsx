import React from 'react';

import type {ChartKitRef} from '@gravity-ui/chartkit';
import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import block from 'bem-cn-lite';
import {get, isEqual, isFunction, omit} from 'lodash';
import type {StringParams} from 'shared';
import {DashTabItemControlSourceType} from 'shared';

import type {WidgetType} from '../../../../units/dash/modules/constants';
import type {ChartKit} from '../../ChartKit/ChartKit';
import {ChartKitAdapter} from '../../ChartKit/ChartKitAdapter';
import {START_PAGE} from '../../ChartKit/components/Widget/components/Table/Paginator/Paginator';
import {drawComments, hideComments} from '../../ChartKit/modules/comments/drawing';
import {deepAssign, getRandomCKId} from '../../helpers/helpers';
import type {MenuItemArgs} from '../../menu/MenuItems';
import DatalensChartkitCustomError, {
    ERROR_CODE,
    formatError,
} from '../../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import ExtensionsManager from '../../modules/extensions-manager/extensions-manager';
import settings from '../../modules/settings/settings';
import type {
    CombinedError,
    ControlsOnlyWidget,
    DataProvider,
    LoadedWidget,
    LoadedWidgetData,
    OnChangeData,
    Widget as TWidget,
} from '../../types';
import type {MenuItems} from '../../types/menu';
import DeferredInitializer from '../DeferredInitializer/DeferredInitializer';
import Drill from '../Drill/Drill';
import type {ErrorProps} from '../Error/Error';
import {SideMarkdown} from '../SideMarkdown/SideMarkdown';

import type {HeaderProps} from './components/Header/Header';
import {Header} from './components/Header/Header';
import Loader from './components/Loader/Loader';
import {CHARTKIT_BASE_CLASSNAME, getVisibleItems} from './helpers';

import './ChartKitBase.scss';

export interface ChartKitLoadSuccess<TProviderData> {
    status: 'success';
    requestId: string;
    data: {
        loadedData: TWidget & TProviderData;
        widget: ChartKitState<unknown, TProviderData, unknown>['widget'];
        widgetRendering: number | null;
        yandexMapAPIWaiting: number | null;
    };
}

export type ChartKitBaseOnLoadProps<TProviderData> =
    | ChartKitLoadSuccess<TProviderData>
    | {
          status: 'error';
          requestId: string;
          data: {
              error: CombinedError;
              loadedData: LoadedWidgetData;
          };
      };

export type ChartInitialParams = {params: StringParams};

export interface ChartKitBaseProps<
    TProviderProps = unknown,
    TProviderData = unknown,
    TProviderCancellation = unknown,
> {
    // @ts-ignore error after migration to ts 4.9, TProviderProps types do not converge
    dataProvider?: DataProvider<TProviderProps, TProviderData, TProviderCancellation>;

    id?: string;
    params?: StringParams;
    initialParams?: ChartInitialParams;

    onLoadStart?: () => void;
    onLoad?: ({status, requestId, data}: ChartKitBaseOnLoadProps<TProviderData>) => void;
    onChange?: (data: OnChangeData) => void;
    transformLoadedData?: (data: LoadedWidgetData) => LoadedWidgetData;

    noControls?: boolean;
    widgetType?: DashTabItemControlSourceType | WidgetType;
    compactLoader?: boolean;
    noLoader?: boolean;
    noVeil?: boolean;
    loaderDelay?: number;

    menu?:
        | MenuItems<TProviderData, TProviderProps>
        | Array<MenuItems<TProviderData, TProviderProps>>;
    hideMenu?: boolean;
    requestIdPrefix?: string;

    nonBodyScroll?: boolean;

    deferredInitialization?: boolean;
    deferredInitializationMargin?: number;

    widgetBodyClassName?: string;

    splitTooltip?: boolean;
}

export type ChartKitProps<
    TProviderProps = unknown,
    TProviderData = unknown,
    TProviderCancellation = unknown,
> = ChartKitBaseProps<TProviderProps, TProviderData, TProviderCancellation> & TProviderProps;

interface ChartKitState<TProviderProps, TProviderData, TProviderCancellation> {
    forceUpdate: boolean;
    dataProviderSavedProps: TProviderProps | null;
    runtimeParams: StringParams;
    loading: boolean;
    // for cases when the parameters are updated inside control, and then from the outside via props
    isDataProviderPropsNotChanged: boolean;
    loadedData: LoadedWidgetData<TProviderData>;
    error: CombinedError | null;
    // {proceed: null} sometimes gets from Highcharts, for example, when after a successful download, there will be a download with the network turned off
    // table resize
    widget: LoadedWidget;
    requestId: string;
    requestCancellation: TProviderCancellation;
    widgetRendering: number | null;
    yandexMapAPIWaiting: number | null;
    deferred?: boolean;
}

// everything except params and config
const DATA_PROVIDER_IRRELEVANT_PROPS_KEYS: Array<keyof ChartKitBaseProps> = [
    'dataProvider',
    'onLoadStart',
    'onLoad',
    'onChange',
    'noControls',
    'compactLoader',
    'noLoader',
    'noVeil',
    'loaderDelay',
    'menu',
    'requestIdPrefix',
    'nonBodyScroll',
    'splitTooltip',
    'deferredInitialization',
    'deferredInitializationMargin',
    'widgetBodyClassName',
    'widgetType',
    'hideMenu',
];

function omitChartKitProps<TProviderProps, TProviderData, TProviderCancellation>(
    props: ChartKitProps<TProviderProps, TProviderData, TProviderCancellation>,
) {
    return omit(props, DATA_PROVIDER_IRRELEVANT_PROPS_KEYS) as TProviderProps;
}

const b = block(CHARTKIT_BASE_CLASSNAME);

// new data will be requested after componentDidMount/componentDidUpdate if state.loading: true is set
// state.loading: true is set during initialization, and if the values of the TProviderProps keys have changed in props
// there is a copy of TProviderProps in state.dataProviderSavedProps to check for changes in getDerivedStateFromProps
// (the check is not in componentDidUpdate, because new props will first have to go through all other lifecycle methods)

class ChartKitBase<TProviderProps, TProviderData, TProviderCancellation> extends React.Component<
    ChartKitProps<TProviderProps, TProviderData, TProviderCancellation>,
    ChartKitState<TProviderProps, TProviderData, TProviderCancellation>
> {
    // TODO: propTypes and defaultProps

    static registerPlugins = ExtensionsManager.register;
    static setGeneralSettings = settings.set;

    static getDerivedStateFromProps<TProviderProps, TProviderData, TProviderCancellation>(
        nextProps: ChartKitProps<TProviderProps, TProviderData, TProviderCancellation>,
        prevState: ChartKitState<TProviderProps, TProviderData, TProviderCancellation>,
    ) {
        const dataProviderNextProps = omitChartKitProps(nextProps);
        const dataProviderSavedProps = prevState.dataProviderSavedProps;
        const dataProviderRuntimeProps = deepAssign({}, prevState.dataProviderSavedProps, {
            // checking for keys, because deepAssign can overwrite with an empty object
            params: Object.keys(prevState.runtimeParams).length ? prevState.runtimeParams : null,
        });

        const dataProvider = nextProps.dataProvider!;

        const isDataProviderPropsNotChanged =
            dataProviderSavedProps &&
            // comparison in case new props didn't arrive
            (dataProvider.isEqualProps(dataProviderNextProps, dataProviderSavedProps) ||
                // Comparison in case new props have arrived and they match with runtimeParams.
                // For example, when an external selector gave parameters via onChange and wrote them to runtimeParams,
                // and then they came back here as props.
                dataProvider.isEqualProps(dataProviderNextProps, dataProviderRuntimeProps));

        if (!prevState.forceUpdate && isDataProviderPropsNotChanged) {
            return {isDataProviderPropsNotChanged};
        }

        if (prevState.requestCancellation) {
            dataProvider.cancelRequests(prevState.requestCancellation);
        }

        if (prevState.widget) {
            const widget = prevState.widget as Highcharts.Chart;
            if (widget.tooltip && widget.tooltip.fixed) {
                // forcing the redrawing of the chart to hide the fixed tooltip
                widget.tooltip.hideFixedTooltip();
            }
        }

        return {
            loading: true,
            forceUpdate: false,
            dataProviderSavedProps: dataProviderNextProps,
            isDataProviderPropsNotChanged,
            requestCancellation: dataProvider.getRequestCancellation(),
            requestId: settings.requestIdGenerator(nextProps.requestIdPrefix),
        };
    }

    chartKitRef: React.RefObject<ChartKit | ChartKitRef> = React.createRef();

    // dynamic id will force Widget to be re-rendered and then Component/Graph
    id = getRandomCKId();

    changedByTabSelect = false; // flag for subsequent forced re-rendering

    state: ChartKitState<TProviderProps, TProviderData, TProviderCancellation> = {
        forceUpdate: false,
        dataProviderSavedProps: null,
        runtimeParams: {},
        loading: true,
        isDataProviderPropsNotChanged: false,
        loadedData: null,
        error: null,
        requestId: settings.requestIdGenerator(this.props.requestIdPrefix),
        requestCancellation: this.dataProvider.getRequestCancellation(),
        widgetRendering: null,
        yandexMapAPIWaiting: null,
        widget: null,
        deferred: this.props.deferredInitialization,
    };

    private mounted = false;
    private rootNodeRef = React.createRef<HTMLDivElement>();

    // TODO: move to props.noLoader and use it
    private isSilentReload = false;
    private isReloadWithNoVeil = false;

    constructor(props: ChartKitProps<TProviderProps, TProviderData, TProviderCancellation>) {
        super(props);

        if (settings.needShowUndeterminedSettingsWarning) {
            settings.showUndeterminedSettingsWarning();
        }
    }

    componentDidMount() {
        this.mounted = true;
        this.getWidget();
    }

    // for the case when getWidget is already in the process, loading is still true,
    // and by componentDidUpdate, another getWidget is launched
    shouldComponentUpdate(
        nextProps: ChartKitProps<TProviderProps, TProviderData, TProviderCancellation>,
        nextState: ChartKitState<TProviderProps, TProviderData, TProviderCancellation>,
    ) {
        const nextStateWithoutNotChanged = omit(nextState, 'isDataProviderPropsNotChanged');
        const stateWithoutNotChanged = omit(this.state, 'isDataProviderPropsNotChanged');

        const shouldUpdate =
            !isEqual(omit(nextProps, 'menu'), omit(this.props, 'menu')) ||
            !isEqual(nextStateWithoutNotChanged, stateWithoutNotChanged);
        return shouldUpdate;
    }

    componentDidUpdate(
        prevProps: ChartKitProps<TProviderProps, TProviderData, TProviderCancellation>,
    ) {
        if (this.props.splitTooltip !== prevProps.splitTooltip) {
            return;
        }

        this.getWidget();
    }

    componentDidCatch(error: Error) {
        this.onError({error});
    }

    componentWillUnmount() {
        this.mounted = false;
        if (this.state.requestCancellation) {
            this.dataProvider.cancelRequests(this.state.requestCancellation);
        }
    }

    render() {
        const renderedContent = this.renderContent();

        let content = renderedContent;
        if (this.props.deferredInitialization) {
            content = (
                <DeferredInitializer
                    onChange={this.onDeferred}
                    deferred={this.state.deferred!}
                    deferredInitializationMargin={this.props.deferredInitializationMargin}
                >
                    {renderedContent}
                </DeferredInitializer>
            );
        }

        return <div className={b(null, settings.themeClassName)}>{content}</div>;
    }

    renderContent = () => {
        const veil = Boolean(
            this.state.loadedData &&
                !this.state.error &&
                !this.props.noVeil &&
                !this.isReloadWithNoVeil,
        );

        const showLoader =
            this.state.loading &&
            !this.isSilentReload &&
            !this.props.noLoader &&
            Boolean(!this.state.loadedData || this.state.error || !this.props.noLoader);

        const hidden = Boolean(this.state.loading && this.state.error);
        const entryId = get(this.state, 'loadedData.entryId');
        const chartsInsightsData = this.state.loadedData?.chartsInsightsData;
        const menuData = {
            isMenuAvailable: !this.props.noControls,
            items: getVisibleItems(this.props.menu || settings.menu, {
                loadedData: this.state.loadedData as MenuItemArgs['loadedData'],
                widget: this.state.widget as MenuItemArgs['widget'],
            }) as unknown as HeaderProps['menuData']['items'],
            widget: this.state.widget,
            loadedData: this.state.loadedData || undefined,
            error: this.state.error,
            providerProps: this.dataProviderProps,
            requestId: this.state.requestId,
            widgetRendering: this.state.widgetRendering,
            yandexMapAPIWaiting: this.state.yandexMapAPIWaiting,
            hideComments,
            drawComments,
            onChange: this.onChange,
        };
        const sideMardownData = this.state.loadedData?.sideMarkdown;
        const hideMenu =
            this.props.widgetType === DashTabItemControlSourceType.External || this.props.hideMenu;

        return (
            <React.Fragment>
                <Loader
                    visible={showLoader}
                    compact={this.props.compactLoader}
                    veil={veil}
                    delay={this.props.loaderDelay}
                />
                {!hideMenu && (
                    <Header
                        chartsInsightsData={chartsInsightsData}
                        menuData={menuData}
                        loading={this.state.loading}
                    />
                )}
                <div
                    ref={this.rootNodeRef}
                    className={b('body', {hidden}, this.props.widgetBodyClassName)}
                    data-qa={`chartkit-body-entry-${entryId}`}
                >
                    {this.renderControl()}
                    {this.renderDrillControls()}
                    {sideMardownData && <SideMarkdown data={sideMardownData} />}
                    {this.renderBody()}
                </div>
            </React.Fragment>
        );
    };

    reflow() {
        if (this.chartKitRef.current && isFunction(this.chartKitRef.current.reflow)) {
            this.chartKitRef.current.reflow();
        }
    }

    reload({silentLoading, noVeil}: {silentLoading?: boolean; noVeil?: boolean} = {}) {
        this.isSilentReload = Boolean(silentLoading);
        this.isReloadWithNoVeil = Boolean(noVeil);

        this.setState({forceUpdate: true});
    }

    undeferred() {
        if (this.state.deferred) {
            this.setState({deferred: false});
        }
    }

    getControls = async (params: StringParams) => {
        if (this.dataProvider.getControls) {
            try {
                const loadedData = await this.dataProvider.getControls({
                    props: {
                        ...this.dataProviderProps,
                        params,
                    },
                    requestId: this.state.requestId,
                    requestCancellation: this.state.requestCancellation,
                });

                return loadedData;
            } catch (error) {
                throw DatalensChartkitCustomError.wrap(error, {
                    code: error.code || ERROR_CODE.DATA_PROVIDER_ERROR,
                });
            }
        }

        console.warn('ChartKit: getControls called but not defined in dataProvider');

        return null;
    };

    handlerChartsSelectTab = () => {
        this.changedByTabSelect = true;
    };

    private get dataProvider() {
        return this.props.dataProvider!;
    }

    private get dataProviderProps() {
        const resultParams = this.state.isDataProviderPropsNotChanged
            ? deepAssign({}, this.props.params, this.state.runtimeParams)
            : deepAssign({}, this.state.runtimeParams, this.props.params);
        return {
            ...omit(this.props, DATA_PROVIDER_IRRELEVANT_PROPS_KEYS),
            params: resultParams,
        } as TProviderProps & {params: StringParams};
    }

    private getWidget = async () => {
        if (this.state.loading && !this.state.deferred) {
            if (this.props.onLoadStart) {
                this.props.onLoadStart();
            }

            try {
                const sentParams = this.dataProviderProps.params;

                const loadedData = await this.dataProvider.getWidget({
                    props: {
                        ...this.dataProviderProps,
                        widgetType: this.props.widgetType,
                    },
                    requestId: this.state.requestId,
                    requestCancellation: this.state.requestCancellation,
                });

                // Check the consistency of the data, it is possible that the data has already changed in the state of controls,
                // in this case there is no need to set an irrelevant value
                const isSentDataEqualToStateData = isEqual(
                    sentParams,
                    this.dataProviderProps.params,
                );

                // loadedData === null, if request was canceled
                if (this.mounted && loadedData !== null) {
                    this.isReloadWithNoVeil = false;

                    const newState = {
                        loading: false,
                        error: null,
                    } as ChartKitState<TProviderProps, TProviderData, TProviderCancellation>;
                    // change the value to the loaded, if the state controllers are relevant or when switching charts tab
                    if (isSentDataEqualToStateData || this.changedByTabSelect) {
                        newState.loadedData = loadedData;

                        if (this.changedByTabSelect) {
                            this.changedByTabSelect = false;
                        }
                    }
                    this.setState(newState);
                }
            } catch (error) {
                this.onError({
                    error: DatalensChartkitCustomError.wrap(error, {
                        code: error.code || ERROR_CODE.DATA_PROVIDER_ERROR,
                    }),
                });
            }
        }
    };

    private onDeferred = (deferred: boolean) => {
        if (this.state.deferred !== deferred) {
            this.setState({deferred});
        }
    };

    private onLoad = ({
        widget = null,
        widgetRendering = null,
        yandexMapAPIWaiting = null,
    }: {
        widget?: LoadedWidget;
        widgetRendering?: number | null;
        yandexMapAPIWaiting?: number | null;
    } = {}) => {
        if (this.mounted) {
            this.isReloadWithNoVeil = false;
            this.setState({loading: false, widget, widgetRendering, yandexMapAPIWaiting});

            if (this.props.onLoad) {
                this.props.onLoad({
                    status: 'success',
                    requestId: this.state.requestId,
                    data: {
                        loadedData: this.state.loadedData!,
                        widget,
                        widgetRendering,
                        yandexMapAPIWaiting,
                    },
                });
            }
        }
    };

    private onError = ({error}: {error: CombinedError}) => {
        if (this.mounted) {
            const args = {
                debug: {
                    requestId:
                        ('debug' in error && error.debug?.requestId) ||
                        this.state.loadedData?.requestId,
                    traceId:
                        ('debug' in error && error.debug?.traceId) ||
                        this.state.loadedData?.traceId,
                },
            };

            const customError = DatalensChartkitCustomError.wrap(error, args);

            const stateToUpdate = {loading: false, error: customError};

            if (this.props.id && this.props.id !== this.state.loadedData?.entryId) {
                Object.assign(stateToUpdate, {loadedData: null});
            }

            this.setState(stateToUpdate);
            if (this.props.onLoad) {
                this.props.onLoad({
                    status: 'error',
                    requestId: this.state.requestId,
                    data: {
                        error: customError,
                        loadedData: this.state.loadedData,
                    },
                });
            }
        }

        this.isSilentReload = false;
        this.isReloadWithNoVeil = false;
    };

    // callExternalOnChange, to prevent the immediate return of parameters from all controls at the same time.
    // right now it only for table with onClick in the cell and control-button with onClick
    private onChange = (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => {
        if (data.type === 'PARAMS_CHANGED') {
            let additionalParams = {};
            const oldDrillDownLevel = this.getCurrentDrillDownLevel();
            const newDrillDownLevel = data.data.params.drillDownLevel;
            const isDrillDownLevelNotEqual =
                oldDrillDownLevel && newDrillDownLevel && oldDrillDownLevel !== newDrillDownLevel;

            let drillParamsChanged = false;
            if (isDrillDownLevelNotEqual) {
                drillParamsChanged = true;
                additionalParams = {
                    _page: String(START_PAGE),
                };
            }

            const oldDrillDownFilters = this.getCurrentDrillDownFilters();
            const newDrillDownFilters = data.data.params.drillDownFilters;
            // check only when not null, not undefined, not ''
            const isDrillDownFiltersNotEqual =
                Boolean(oldDrillDownFilters) &&
                Boolean(newDrillDownFilters) &&
                !isEqual(oldDrillDownFilters, newDrillDownFilters);

            if (isDrillDownFiltersNotEqual) {
                drillParamsChanged = true;
            }

            const isPageChanged =
                String(data.data.params._page) !== String(this.state.runtimeParams?._page);

            const isSortingChanged =
                data.data.params._columnId !== this.state.runtimeParams?._columnId ||
                data.data.params._sortOrder !== this.state.runtimeParams?._sortOrder ||
                data.data.params.__sortMeta !== this.state.runtimeParams?.__sortMeta;

            const newRuntimeParam = deepAssign(
                {},
                this.state.runtimeParams,
                data.data.params,
                additionalParams,
            );

            const needForceChange =
                !callExternalOnChange ||
                drillParamsChanged ||
                isPageChanged ||
                isSortingChanged ||
                callChangeByClick;

            if (needForceChange) {
                this.setState(
                    {
                        runtimeParams: newRuntimeParam,
                        ...state,
                    },
                    () => {
                        this.onExternalChangeCallback({
                            callExternal: Boolean(callExternalOnChange),
                            onChange: this.props.onChange,
                            params: newRuntimeParam,
                        });
                    },
                );
            } else {
                this.onExternalChangeCallback({
                    callExternal: Boolean(callExternalOnChange),
                    onChange: this.props.onChange,
                    params: newRuntimeParam,
                });
            }
        } else if (callExternalOnChange && this.props.onChange) {
            this.props.onChange(data);
        }
    };

    private onExternalChangeCallback({
        callExternal,
        onChange,
        params,
    }: {
        callExternal: boolean;
        onChange: ChartKitBaseProps['onChange'];
        params: StringParams;
    }) {
        if (callExternal && onChange) {
            onChange({
                type: 'PARAMS_CHANGED',
                data: {
                    params,
                },
            });
        }
    }

    private onRetry = (data: {params: StringParams} = {params: {}}) => {
        this.onChange({type: 'PARAMS_CHANGED', data}, {forceUpdate: true}, false);
    };

    private renderError() {
        if (!this.state.error) {
            return null;
        }

        const ErrorComponent = settings.ErrorComponent as React.ComponentType<ErrorProps>;

        const formattedError = formatError({
            error: this.state.error,
            requestId: this.state.requestId,
            noControls: this.props.noControls,
        });

        const onError = settings.onError;
        if (typeof onError === 'function') {
            (onError as (err: Error, formatted: DatalensChartkitCustomError) => void)(
                this.state.error,
                formattedError,
            );
        }

        return <ErrorComponent error={formattedError} onAction={this.onRetry} />;
    }

    private renderBody() {
        if (this.state.error) {
            return this.renderError();
        }

        let {loadedData} = this.state;

        if (this.props.transformLoadedData) {
            loadedData = this.props.transformLoadedData(loadedData);
        }

        if (loadedData && loadedData.type !== 'control') {
            return (
                <ChartKitAdapter
                    ref={this.chartKitRef}
                    rootNodeRef={this.rootNodeRef}
                    loadedData={loadedData}
                    splitTooltip={this.props.splitTooltip}
                    nonBodyScroll={this.props.nonBodyScroll}
                    isMobile={settings.isMobile}
                    lang={settings.lang}
                    onLoad={this.onLoad}
                    onError={this.onError}
                    onChange={this.onChange}
                />
            );
        }

        return null;
    }

    private renderControl() {
        const {loadedData} = this.state;

        if (
            !this.props.noControls &&
            loadedData &&
            'controls' in loadedData &&
            loadedData.controls &&
            (loadedData as ControlsOnlyWidget)?.controls?.controls?.length
        ) {
            if (ExtensionsManager.has('control')) {
                const Control = ExtensionsManager.get('control') as React.ComponentType;
                return (
                    // @ts-ignore
                    <Control<TProviderData>
                        initialParams={this.props.initialParams}
                        id={this.id}
                        data={loadedData}
                        onLoad={this.onLoad}
                        onError={this.onError}
                        onChange={this.onChange}
                        getControls={this.getControls}
                        nonBodyScroll={this.props.nonBodyScroll}
                    />
                );
            }

            console.warn('ChartKit: control scheme declared, but extension not added');

            return null;
        }

        return null;
    }

    private getCurrentDrillDownLevel(): string {
        const runtimeDrillDownLevel = this.state.runtimeParams.drillDownLevel as string;

        if (runtimeDrillDownLevel) {
            return runtimeDrillDownLevel;
        }

        return (this.state.loadedData?.params.drillDownLevel || ['0'])[0];
    }

    private getCurrentDrillDownFilters(): string[] {
        const runtimeDrillDownFilters = this.state.runtimeParams.drillDownFilters as string[];

        if (runtimeDrillDownFilters) {
            return runtimeDrillDownFilters;
        }

        return (this.state.loadedData?.params.drillDownFilters as string[]) || [];
    }

    private renderDrillControls() {
        const drillDown = this.state.loadedData?.config?.drillDown;

        if (!drillDown) {
            return null;
        }

        const drillDownLevel = this.getCurrentDrillDownLevel();
        const drillDownFilters = this.getCurrentDrillDownFilters();

        const filters: string[] = drillDownFilters;
        const level = Number(drillDownLevel);

        return (
            <Drill
                onChange={this.onChange}
                breadcrumbs={drillDown.breadcrumbs}
                filters={filters}
                level={level}
            />
        );
    }
}

export default ChartKitBase;
