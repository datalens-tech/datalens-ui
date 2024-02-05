import React from 'react';

import {ConfigItemData, Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DatalensGlobalState, Utils} from 'index';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import {ResolveThunks, connect} from 'react-redux';
import {
    DashTabItemControlDataset,
    DashTabItemControlManual,
    DashTabItemGroupControlData,
    Feature,
    StringParams,
} from 'shared';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from 'ui/libs/DatalensChartkit/ChartKit/helpers/constants';
import {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {ControlButton} from 'ui/libs/DatalensChartkit/components/Control/Items/Items';
import {
    CLICK_ACTION_TYPE,
    CONTROL_TYPE,
} from 'ui/libs/DatalensChartkit/modules/constants/constants';
import type {ChartsChartKit} from 'ui/libs/DatalensChartkit/types/charts';
import {isMobileView} from 'ui/utils/mobile';

import logger from '../../../../libs/logger';
import {selectSkipReload} from '../../../../units/dash/store/selectors/dashTypedSelectors';
import {adjustWidgetLayout} from '../../utils';
import {Error} from '../Control/Error/Error';
import {LOAD_STATUS} from '../Control/constants';
import {ControlSettings, GetDistincts, LoadStatus} from '../Control/types';
import DebugInfoTool from '../DebugInfoTool/DebugInfoTool';

import {Control} from './Control/Control';

import './GroupControl.scss';

const GROUP_CONTROL_LAYOUT_DEBOUNCE_TIME = 20;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

interface PluginGroupControlProps
    extends PluginWidgetProps,
        ControlSettings,
        StateProps,
        DispatchProps {}

interface PluginGroupControlState {
    status: LoadStatus;
    silentLoading: boolean;
    showSilentLoader: boolean;
    forceUpdate: boolean;
    dialogVisible: boolean;
    initialParams?: StringParams;
    isInit: boolean;
    stateParams: StringParams;
}

export interface PluginGroupControl extends Plugin<PluginGroupControlProps> {
    setSettings: (settings: ControlSettings) => Plugin;
    getDistincts?: GetDistincts;
}

const b = block('dashkit-plugin-group-control');

class GroupControl extends React.PureComponent<PluginGroupControlProps, PluginGroupControlState> {
    chartKitRef: React.RefObject<ChartsChartKit> = React.createRef<ChartsChartKit>();
    rootNode: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

    _isUnmounted = false;
    _silentLoaderTimer: NodeJS.Timeout | undefined = undefined;

    adjustWidgetLayout = debounce(this.setAdjustWidgetLayout, GROUP_CONTROL_LAYOUT_DEBOUNCE_TIME);

    resolve: ((value: unknown) => void) | null = null;

    /**
     * can't use it in state because of doubling requests
     */
    initialParams: ChartInitialParams = {
        params: {} as StringParams,
    };

    constructor(props: PluginGroupControlProps) {
        super(props);
        this.state = {
            status: LOAD_STATUS.PENDING,
            silentLoading: false,
            showSilentLoader: false,
            forceUpdate: true,
            dialogVisible: false,
            isInit: false,
            stateParams: {},
        };
    }

    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prevProps: Readonly<PluginGroupControlProps>) {
        if (this.state.status !== LOAD_STATUS.PENDING && this._silentLoaderTimer) {
            this.clearSilentLoaderTimer();
        }

        if (this.rootNode.current) {
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

        if (hasDefaultsChanged) {
            this.initialParams = {
                params: {...this.initialParams.params, ...this.props.defaults},
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
            // if (this.props.data.source.elementType !== ELEMENT_TYPE.SELECT) {
            //     this._silentLoaderTimer = setTimeout(this.showSilentLoader, 800);
            // }

            this.init();
        }
    }

    componentWillUnmount() {
        this._isUnmounted = true;
    }

    render() {
        const {data} = this.props;
        const controlData = data as unknown as DashTabItemGroupControlData;

        const sources = Object.values(controlData.items)
            .filter((item) => 'source' in item)
            .map((item) => item.source);

        const paramIdDebug = sources
            .map(
                (source) =>
                    (source as DashTabItemControlDataset['source']).datasetFieldId ||
                    (source as DashTabItemControlManual['source']).fieldName ||
                    data.param ||
                    '',
            )
            .join(', ') as string;

        return (
            <div ref={this.rootNode} className={b({mobile: isMobileView})}>
                <div className={b('container', CHARTKIT_SCROLLABLE_NODE_CLASSNAME)}>
                    {this.renderSilentLoader()}
                    <DebugInfoTool label={'paramId'} value={paramIdDebug} modType={'corner'} />
                    {Utils.isEnabledFeature(Feature.GroupControls)
                        ? this.renderControls()
                        : this.renderError()}
                </div>
            </div>
        );
    }

    private clearSilentLoaderTimer() {
        if (this._silentLoaderTimer) {
            clearTimeout(this._silentLoaderTimer);
        }
    }

    private onChange = (params: StringParams, callChangeByClick?: boolean) => {
        const controlData = this.props.data as unknown as DashTabItemGroupControlData;
        if (!controlData.buttonApply || callChangeByClick) {
            this.props.onStateAndParamsChange({params});
        }
        this.setState({stateParams: params});
    };

    private filterSignificantParams(loadedData?: any) {
        const params = loadedData.usedParams;

        if (!params) {
            return {};
        }

        // @ts-ignore
        const dependentSelectors = this.props.settings.dependentSelectors;

        if (loadedData && loadedData.usedParams && dependentSelectors) {
            return pick(params, Object.keys(loadedData.usedParams));
        }

        return dependentSelectors ? params : pick(params, Object.keys(this.props.defaults!));
    }

    private resolveMeta = (loadedData?: any) => {
        // @ts-ignore
        if (this.resolve) {
            let result: any = {id: this.props.id};

            if (loadedData && loadedData.extra) {
                result = {
                    id: this.props.id,
                    usedParams: loadedData.usedParams
                        ? Object.keys(this.filterSignificantParams(loadedData))
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
    };

    private handleInitialParamsUpdate = (updatedInitialParams: ChartInitialParams) => {
        this.initialParams = updatedInitialParams;
    };

    private renderControl(id: string, item: ConfigItemData) {
        const {getDistincts, skipReload, defaults} = this.props;
        const {silentLoading, showSilentLoader} = this.state;

        return (
            <Control
                key={id}
                id={id}
                data={item}
                initialParams={this.initialParams}
                actualParams={this.actualParams}
                showSilentLoader={showSilentLoader}
                onStatusChanged={() => {}}
                silentLoading={silentLoading}
                resolveMeta={this.resolveMeta}
                defaults={defaults}
                getDistincts={getDistincts}
                onChange={this.onChange}
                skipReload={skipReload}
                onInitialParamsUpdate={this.handleInitialParamsUpdate}
            />
        );
    }

    private renderButtons() {
        const {data} = this.props;
        const controlData = data as unknown as DashTabItemGroupControlData;

        const onButtonChange = (action: string) => {
            let newParams = {...this.actualParams};

            if (action === CLICK_ACTION_TYPE.SET_PARAMS) {
                newParams = this.state.stateParams;
            } else if (action === CLICK_ACTION_TYPE.SET_INITIAL_PARAMS) {
                newParams = this.initialParams?.params;
            }

            if (!isEqual(newParams, this.actualParams)) {
                this.onChange(newParams, true);
            }
        };

        return (
            <React.Fragment>
                {controlData.buttonApply && (
                    <ControlButton
                        type={CONTROL_TYPE.BUTTON}
                        label={'APPLY'}
                        updateOnChange={true}
                        theme="action"
                        className={b('item')}
                        onChange={() => onButtonChange(CLICK_ACTION_TYPE.SET_PARAMS)}
                    />
                )}
                {controlData.buttonReset && (
                    <ControlButton
                        type={CONTROL_TYPE.BUTTON}
                        className={b('item')}
                        label={'RESET'}
                        onClick={{action: 'setInitialParams'}}
                        onChange={() => onButtonChange(CLICK_ACTION_TYPE.SET_INITIAL_PARAMS)}
                    />
                )}
            </React.Fragment>
        );
    }

    private renderControls() {
        const {data} = this.props;
        const controlData = data as unknown as DashTabItemGroupControlData;

        return (
            <div>
                {Object.entries(controlData.items).map(([id, item]) =>
                    this.renderControl(id, item),
                )}
                {this.renderButtons()}
            </div>
        );
    }

    private renderSilentLoader() {
        if (this.state.showSilentLoader) {
            return (
                <div className={b('loader', {silent: true})}>
                    <Loader size="s" />
                </div>
            );
        }

        return null;
    }

    private showSilentLoader = () => {
        this.setState((prevState) => {
            return prevState.status === LOAD_STATUS.PENDING && prevState.silentLoading
                ? {showSilentLoader: true}
                : null;
        });
    };

    private renderError() {
        return (
            <div className={b('error')}>
                <Error />
                <div>Render not implemented</div>
            </div>
        );
    }

    // public
    private getMeta() {
        if (this.chartKitRef && this.chartKitRef.current) {
            this.chartKitRef.current.undeferred();
        }
        return Promise.resolve({});
    }

    get actualParams(): StringParams {
        return this.props.params;
    }

    private async init() {
        try {
            // FIXME: need implement init section for GroupControl

            if (this.state.isInit === false) {
                this.setState({isInit: true});
            }
        } catch (error) {
            if (this.state.isInit === false) {
                this.setState({isInit: true});
            }
            logger.logError('DashKit: GroupControl init failed', error);
            // eslint-disable-next-line no-console
            console.error('DASHKIT_CONTROL_RUN', error);

            // let errorData = null;

            // if (this._isUnmounted) {
            //     return;
            // }

            // if (error.response && error.response.data) {
            //     errorData = {
            //         data: {error: error.response.data?.error},
            //         requestId: error.response.headers['x-request-id'],
            //     };
            // } else {
            //     errorData = {data: {message: error.message}};
            // }

            // this.setErrorData(errorData, LOAD_STATUS.FAIL);
        }
    }

    private setAdjustWidgetLayout(needSetDefault: boolean) {
        adjustWidgetLayout({
            widgetId: this.props.id,
            needSetDefault,
            rootNode: this.rootNode,
            gridLayout: this.props.gridLayout,
            layout: this.props.layout,
            cb: this.props.adjustWidgetLayout,
        });
    }
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    skipReload: selectSkipReload(state),
});

const mapDispatchToProps = {};

const GroupControlWithStore = connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true,
})(GroupControl);

const plugin: PluginGroupControl = {
    type: 'group_control',
    defaultLayout: {w: 8, h: 2},
    setSettings(settings: ControlSettings) {
        const {getDistincts} = settings;

        // TODO: remove this. use basic ChartKit abilities
        plugin.getDistincts = getDistincts;

        return plugin;
    },
    renderer(props: PluginWidgetProps, forwardedRef) {
        return <GroupControlWithStore {...props} ref={forwardedRef} />;
    },
};

export default plugin;
